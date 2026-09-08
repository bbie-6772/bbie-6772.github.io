import { queryPlan } from './memory-queries.mjs';
const base = new URL('../../', import.meta.url);
const cache = new Map();
export const excerptText = value => value.replace(/<[^>]*>/g, '').replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g,
  (_, entity) => ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ', '#39':"'"}[entity]));
async function json(url) {
  if (!cache.has(url)) cache.set(url, fetch(url).then(response => {
    if (!response.ok) throw new Error(`자료를 불러오지 못했습니다 (${response.status}). 다시 시도해 주세요.`);
    return response.json();
  }).catch(error => { cache.delete(url); throw error; }));
  return cache.get(url);
}
let enginePromise;
async function engine() {
  if (!enginePromise) enginePromise = import(new URL('pagefind/pagefind.js', base).href)
    .catch(error => { enginePromise = null; throw error; });
  return enginePromise;
}
export async function catalog() { return json(new URL('memory/index.json', base).href); }
export async function filters() { return (await engine()).filters(); }
export async function getPost(id) {
  if (typeof id !== 'string' || id.length > 250) throw new Error('올바른 글 ID가 필요합니다.');
  const entry = (await catalog()).posts.find(post => post.id === id);
  if (!entry) throw new Error('해당 글이 없습니다. 먼저 검색 결과의 post_id를 확인해 주세요.');
  // Only fetch catalog-listed same-origin records, never a caller-supplied URL.
  const url = new URL(entry.data_url, base);
  if (url.origin !== base.origin || !url.pathname.startsWith(new URL('memory/posts/', base).pathname)) throw new Error('잘못된 자료 경로입니다.');
  return json(url.href);
}
export async function getSection(id, sectionId, options = {}) {
  const post = await getPost(id);
  const section = post.sections.find(section => section.id === sectionId);
  if (!section) throw new Error('해당 구간이 없습니다. 글의 구간 목록을 확인해 주세요.');
  const offset = options.offset ?? 0;
  const maxChars = options.max_chars ?? 6000;
  if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(maxChars) || maxChars < 100 || maxChars > 12000) throw new Error('offset은 0 이상 정수, max_chars는 100~12000 사이 정수여야 합니다.');
  const chars = [...section.text];
  return { post_id: post.id, title: post.title, date: post.date, content_hash: post.content_hash, ...section,
    text: chars.slice(offset, offset + maxChars).join(''), total_chars: chars.length, offset,
    next_offset: offset + maxChars < chars.length ? offset + maxChars : null };
}
export async function searchPosts(query, options = {}) {
  if (typeof query !== 'string' || query.trim().length < 1 || query.length > 200) throw new Error('검색어를 1~200자로 입력해 주세요.');
  const limit = options.limit ?? 10;
  if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error('검색 개수는 1~20 사이 정수여야 합니다.');
  const selected = {};
  for (const key of ['year', 'category', 'tag']) {
    if (options[key]) {
      if (typeof options[key] !== 'string' || options[key].length > 100) throw new Error('필터 값이 올바르지 않습니다.');
      selected[key] = options[key];
    }
  }
  const queries = queryPlan(query.trim());
  const candidates = new Map();
  const searchEngine = await engine();
  for (const [queryIndex, term] of queries.entries()) {
    const result = await searchEngine.search(term, { filters: selected });
    for (const [rank, item] of result.results.entries()) {
      const existing = candidates.get(item.id) || { item, score: 0 };
      existing.score += (queryIndex === 0 ? 2 : 1) / (20 + rank);
      candidates.set(item.id, existing);
    }
  }
  const ranked = [...candidates.values()].sort((a,b) => b.score - a.score).map(value => value.item);
  const seen = new Set(), found = [];
  // Pagefind returns sections. Rank unique posts using their highest matching section.
  for (let start = 0; start < ranked.length && found.length < limit; start += 20) {
    const batch = await Promise.all(ranked.slice(start, start + 20).map(item => item.data()));
    for (const data of batch) {
      if (seen.has(data.meta.post_id)) continue;
      seen.add(data.meta.post_id);
      found.push({ post_id: data.meta.post_id, section_id: data.meta.section_id, title: data.meta.title,
        heading: data.meta.heading, date: data.meta.date, url: data.url,
        image: data.meta.image || '', category: data.meta.category || '',
        excerpt: excerptText(data.excerpt) });
      if (found.length === limit) break;
    }
  }
  return { query: query.trim(), expanded_queries: queries, filters: selected, matched_sections: ranked.length, results: found };
}
