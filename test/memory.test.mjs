import test from 'node:test';
import assert from 'node:assert/strict';
import { extractPost } from '../scripts/build-memory.mjs';
import { toolDefinitions, registerTools } from '../assets/js/memory-webmcp.mjs';
import { queryPlan } from '../assets/js/memory-queries.mjs';

const meta = { id:'2026-09-08-test', title:'본문 <검증>', date:'2026-09-08', url:'/blog/test.html', baseurl:'/blog', image:'/blog/assets/banner.png', categories:['회고'], tags:['C++'] };
function fixture(body) { return `<html><script id="memory-post" type="application/json">${JSON.stringify(meta)}</script><div class="post-content">${body}</div></html>`; }
test('preserves original uncertainty, code and heading anchors, excludes scripts', () => {
  const result = extractPost(fixture('<p>예상과 달랐다..!</p><h2 id="원인">원인</h2><p>왜지?</p><pre><code>buffer = 1;</code></pre><script>secret()</script>'));
  assert.equal(result.post.sections.length, 2);
  assert.equal(result.post.image, '/blog/assets/banner.png');
  assert.match(result.post.sections[1].text, /왜지\?\n+buffer = 1;/);
  assert.ok(!JSON.stringify(result.post).includes('secret()'));
  assert.equal(result.post.sections[1].url, '/blog/test.html#%EC%9B%90%EC%9D%B8');
});
test('generates anchors for missing IDs and does not duplicate nested text', () => {
  const result = extractPost(fixture('<h2>시도</h2><blockquote><p>직접 확인</p></blockquote>'));
  assert.equal(result.post.sections[0].text, '직접 확인');
  assert.match(result.html, /id="memory-section-1"/);
});
test('does not export pages without an explicit post marker', () => { assert.equal(extractPost('<p>page</p>'), null); });
test('fails closed on malformed metadata', () => { assert.throws(() => extractPost('<script id="memory-post">{bad}</script>')); });
test('content hash changes when source text changes', () => { assert.notEqual(extractPost(fixture('<p>A</p>')).post.content_hash, extractPost(fixture('<p>B</p>')).post.content_hash); });
test('preserves meaningful code indentation', () => {
  assert.match(extractPost(fixture('<pre>if ready:\n    run()</pre>')).post.sections[0].text, /\n    run\(\)/);
});
test('unsupported browser does not break search', async () => { assert.deepEqual(await registerTools(undefined), { supported:false }); });
test('registers exactly the three read-only tools and supports cleanup', async () => {
  const registered=[]; const signals=[];
  const result=await registerTools({ registerTool: async (tool, options) => { registered.push(tool); signals.push(options.signal); } });
  assert.deepEqual(registered.map(tool=>tool.name), ['search_posts','get_post','get_section']);
  assert.ok(registered.every(tool=>tool.annotations.readOnlyHint));
  result.stop(); assert.ok(signals.every(signal=>signal.aborted));
});
test('registration failure cleans up earlier tools', async () => {
  let signal;
  const result=await registerTools({registerTool: async (tool, options) => { signal=options.signal; if(tool.name==='get_post') throw Error('disabled'); }});
  assert.equal(result.error,'disabled'); assert.equal(signal.aborted,true);
});
test('get_post returns section directory, not all body text', async () => {
  const tools=toolDefinitions({ getPost: async()=>({ id:'a',sections:[{id:'s',heading:'원인',text:'long body',url:'/a#s'}] }) });
  const result=JSON.parse(await tools[1].execute({post_id:'a'}));
  assert.equal(result.sections[0].text, undefined); assert.equal(result.sections[0].id,'s');
});
test('errors returned to agent are explicit, not invented results', async () => {
  const tools=toolDefinitions({getSection:async()=>{throw Error('없는 구간');}});
  assert.deepEqual(JSON.parse(await tools[2].execute({})),{error:'없는 구간'});
});
test('CS topic expands to explicit technical domains without rewriting records', () => {
  assert.ok(queryPlan('컴퓨터 CS 지식').includes('운영체제'));
  assert.ok(queryPlan('스레드').includes('thread'));
  assert.deepEqual(queryPlan('내가 했던 그 일'), ['내가 했던 그 일']);
});
