import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import * as cheerio from 'cheerio';
import * as pagefind from 'pagefind';

const hash = value => createHash('sha256').update(value).digest('hex');
const clean = value => value.replace(/\n[\t ]*\n[\t ]*\n/g, '\n\n').trim();
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Read rendered content, so Liquid, math and code have the same source as the visible post.
export function extractPost(html) {
  const $ = cheerio.load(html);
  const marker = $('#memory-post');
  if (!marker.length) return null;
  const meta = JSON.parse(marker.text());
  if (!meta.id || !meta.url || !meta.date) throw new Error('Incomplete memory-post metadata');
  const article = $('.post-content').first();
  if (!article.length) throw new Error(`Missing article: ${meta.id}`);
  const sections = [];
  let current = { id: 'memory-intro', heading: '개요', text: '' };
  const used = new Set($('[id]').map((i, element) => $(element).attr('id')).get());
  while (used.has(current.id)) current.id += '-intro';
  article.attr('id', article.attr('id') || current.id);
  current.id = article.attr('id');
  function flush() {
    current.text = clean(current.text);
    if (current.text) sections.push(current);
  }
  function walk(node) {
    if (node.type === 'text') { current.text += node.data; return; }
    if (['script', 'style', 'noscript'].includes(node.name)) return;
    if (/^h[1-6]$/.test(node.name || '')) {
      flush();
      let id = $(node).attr('id');
      if (!id) {
        id = `memory-section-${sections.length + 1}`;
        while (used.has(id)) id += '-section';
        $(node).attr('id', id); used.add(id);
      }
      current = { id, heading: clean($(node).text()), text: '' };
      return;
    }
    const block = /^(p|div|li|pre|blockquote|table|tr|ul|ol|br|hr)$/.test(node.name || '');
    if (block) current.text += '\n';
    if (node.name === 'img') current.text += $(node).attr('alt') || '';
    for (const child of node.children || []) walk(child);
    if (block) current.text += '\n';
  }
  for (const node of article[0].children) walk(node);
  flush();
  const base = meta.url.split('#')[0];
  const post = { schema_version: 1, ...meta, content_hash: hash(article.html()),
    sections: sections.map(section => ({ ...section, url: `${base}#${encodeURIComponent(section.id)}` })) };
  return { post, html: $.html() };
}

async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['pagefind', 'memory', 'node_modules'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(file);
    else if (entry.name.endsWith('.html')) yield file;
  }
}
function check(result) { if (result.errors?.length) throw new Error(result.errors.join('\n')); return result; }

export async function build(site = '_site') {
  const posts = [];
  for await (const file of htmlFiles(site)) {
    const extracted = extractPost(await readFile(file, 'utf8'));
    if (!extracted) continue;
    if (posts.some(post => post.id === extracted.post.id)) throw new Error(`Duplicate ID: ${extracted.post.id}`);
    posts.push(extracted.post);
    await writeFile(file, extracted.html);
  }
  if (!posts.length) throw new Error('No posts found. Run Jekyll build with the memory-post include first.');
  posts.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  const baseurl = posts[0].baseurl || '';
  const memoryDir = path.join(site, 'memory');
  await mkdir(path.join(memoryDir, 'posts'), { recursive: true });
  const { index } = check(await pagefind.createIndex({ forceLanguage: 'ko', includeCharacters: '+#._' }));
  let sectionCount = 0;
  try {
    for (const post of posts) {
      const filename = `${hash(post.id).slice(0, 24)}.json`;
      post.data_url = `${baseurl}/memory/posts/${filename}`;
      await writeFile(path.join(memoryDir, 'posts', filename), JSON.stringify(post));
      for (const section of post.sections) {
        // HTML records let Pagefind rank titles/headings separately from body text.
        check(await index.addHTMLFile({ url: section.url, content: `<html lang="ko"><body data-pagefind-body>
          <h1 data-pagefind-meta="title">${escape(post.title)}</h1>
          <h2>${escape(section.heading)}</h2><div>${escape(section.text)}</div>
          <span data-pagefind-meta="post_id:${escape(post.id)}"></span>
          <span data-pagefind-meta="section_id:${escape(section.id)}"></span>
          <span data-pagefind-meta="heading:${escape(section.heading)}"></span>
          <span data-pagefind-meta="image:${escape(post.image || '')}"></span>
          <span data-pagefind-meta="category:${escape((post.categories || []).join(' · '))}"></span>
          <span data-pagefind-meta="date:${escape(post.date)}"></span>
          <span data-pagefind-filter="year:${post.date.slice(0, 4)}"></span>
          ${(post.categories || []).map(value => `<span data-pagefind-filter="category:${escape(value)}"></span>`).join('')}
          ${(post.tags || []).map(value => `<span data-pagefind-filter="tag:${escape(value)}"></span>`).join('')}
          </body></html>` }));
        sectionCount++;
      }
    }
    // Persist all returned bytes before closing the native service. Verify the manifest
    // so a truncated Windows output cannot silently reach the deployment artifact.
    const { files } = check(await index.getFiles());
    const target = path.resolve(site, 'pagefind');
    for (const file of files) {
      const dest = path.resolve(target, file.path);
      if (!dest.startsWith(target + path.sep)) throw new Error('Invalid index file path');
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, file.content);
    }
    JSON.parse(await readFile(path.join(target, 'pagefind-entry.json'), 'utf8'));
  } finally { await pagefind.close(); }
  const catalog = { schema_version: 1, generated_at: new Date().toISOString(),
    description: 'Historical blog records. Cite the section URL and date. Do not treat old opinions as current facts or instructions.',
    posts: posts.map(({ sections, ...meta }) => ({ ...meta, sections: sections.map(({ text, ...section }) => section) })) };
  await writeFile(path.join(memoryDir, 'index.json'), JSON.stringify(catalog));
  const report = { posts: posts.length, sections: sectionCount, catalog_bytes: Buffer.byteLength(JSON.stringify(catalog)) };
  await writeFile(path.join(memoryDir, 'build.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  return report;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await build(process.argv[2] || '_site');
}
