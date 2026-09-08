import { searchPosts, filters } from './memory-client.mjs';
import { registerTools } from './memory-webmcp.mjs';

const form = document.querySelector('#memory-search');
const status = document.querySelector('#memory-status');
const list = document.querySelector('#memory-results');
let revision = 0;
function render(result) {
  list.replaceChildren();
  for (const item of result.results) {
    const li = document.createElement('li'); li.className = 'memory-result';
    const link = document.createElement('a');
    const url = new URL(item.url, location.href);
    if (url.origin !== location.origin) continue;
    link.href = url.href; link.textContent = item.title;
    const content = document.createElement('div'); content.className = 'memory-result-content';
    const title = document.createElement('h2'); title.append(link);
    if (item.image) {
      try {
        const imageUrl = new URL(item.image, location.href);
        if (['http:', 'https:'].includes(imageUrl.protocol)) {
          const visual = document.createElement('div'); visual.className = 'memory-result-visual';
          const img = document.createElement('img');
          img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
          img.width = 200; img.height = 112;
          img.addEventListener('error', () => visual.remove(), { once: true });
          img.src = imageUrl.href; visual.append(img); li.append(visual);
        }
      } catch { /* A malformed image must not prevent reading the result. */ }
    }
    const meta = document.createElement('p'); meta.className = 'memory-meta';
    const date = document.createElement('time'); date.dateTime = item.date; date.textContent = item.date;
    meta.append(date);
    if (item.category) {
      const category = document.createElement('span'); category.className = 'memory-category';
      category.textContent = item.category; meta.append(category);
    }
    const heading = document.createElement('p'); heading.className = 'memory-section';
    heading.textContent = item.heading === '개요' ? '글의 시작에서' : `찾은 구간 · ${item.heading}`;
    const excerpt = document.createElement('p'); excerpt.className = 'memory-excerpt'; excerpt.textContent = item.excerpt;
    content.append(meta, title, heading, excerpt); li.append(content); list.append(li);
  }
  status.textContent = result.results.length ? `관련 글 ${result.results.length}편을 표시합니다. 링크를 누르면 해당 구간으로 이동합니다.` : '일치하는 글이 없습니다. 기억나는 기술명이나 짧은 표현으로 다시 찾아보세요.';
  if (result.expanded_queries?.length > 1) status.textContent += ` 함께 찾은 용어: ${result.expanded_queries.slice(1).join(', ')}.`;
}
async function run(event) {
  event?.preventDefault();
  const current = ++revision;
  const data = Object.fromEntries(new FormData(form));
  const params = new URLSearchParams(Object.entries(data).filter(([,value]) => value));
  history.replaceState(null, '', `${location.pathname}?${params}`);
  status.textContent = '본문을 찾고 있습니다…'; list.setAttribute('aria-busy', 'true');
  try { const result = await searchPosts(data.q, data); if (revision === current) render(result); }
  catch (error) { if (revision === current) { list.replaceChildren(); status.textContent = error.message; } }
  finally { if (revision === current) list.setAttribute('aria-busy', 'false'); }
}
form.addEventListener('submit', run);
const initial = new URLSearchParams(location.search);
form.elements.q.value = initial.get('q') || '';
try {
  const available = await filters();
  for (const key of ['year', 'category', 'tag']) {
    for (const value of Object.keys(available[key] || {}).sort((a,b) => key === 'year' ? b.localeCompare(a) : a.localeCompare(b))) {
      const option = document.createElement('option'); option.value = value; option.textContent = value;
      form.elements[key].append(option);
    }
    form.elements[key].value = initial.get(key) || '';
  }
  if (form.elements.q.value) await run();
} catch { status.textContent = '검색 자료를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.'; }
const registered = await registerTools(document.modelContext, (name, result) => {
  revision++;
  list.setAttribute('aria-busy', 'false');
  if (name === 'search_posts') {
    form.elements.q.value = result.query;
    for (const key of ['year', 'category', 'tag']) form.elements[key].value = result.filters[key] || '';
    render(result);
  }
  document.querySelector('#memory-agent-status').textContent = `AI가 ${name === 'search_posts' ? '관련 글을 검색' : '글의 자료를 확인'}했습니다.`;
});
document.querySelector('#memory-agent-support').textContent = registered.error ? 'AI 도구 연결에 실패했습니다. 일반 검색은 사용할 수 있습니다.' : registered.supported ? '이 브라우저에서 AI 검색 도구를 사용할 수 있습니다.' : '일반 검색을 사용할 수 있습니다. AI 자료는 아래 링크로도 제공됩니다.';
