const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

let pendingRequest;
const input = {
  value: '',
  addEventListener(type, listener) {
    assert.equal(type, 'input');
    this.listener = listener;
  }
};
const results = { innerHTML: '' };

class FakeXMLHttpRequest {
  open() {}
  send() { pendingRequest = this; }
}

const window = { XMLHttpRequest: FakeXMLHttpRequest };
vm.runInNewContext(
  fs.readFileSync('assets/js/simple-jekyll-search.js', 'utf8'),
  { window, setTimeout, clearTimeout }
);

const search = window.SimpleJekyllSearch({
  searchInput: input,
  resultsContainer: results,
  json: '/search.json',
  debounceTime: 0,
  fuzzy: true,
  limit: 10
});

input.value = 'RNN';
input.listener({ which: 0, target: input });
assert.equal(results.innerHTML, 'Loading search index...');

pendingRequest.status = 200;
pendingRequest.readyState = 4;
pendingRequest.responseText = JSON.stringify([
  {
    title: 'RNN 개념 설명',
    category: 'SSAFY',
    tags: 'RNN, Hidden-State',
    url: '/rnn',
    headings: '순환 신경망 은닉 상태'
  },
  { title: 'Transformer 개념', url: '/transformer', headings: 'Self Attention' },
  { title: '경로에만 있는 단어', url: '/assets-only', headings: '' },
  ...Array.from({ length: 11 }, (_, index) => ({
    title: `Transformer 응용 ${index}`,
    url: `/transformer-${index}`,
    headings: 'Transformer'
  }))
]);
pendingRequest.onreadystatechange();

assert.match(results.innerHTML, /RNN 개념 설명/);

search.search('RNN SSAFY');
assert.match(results.innerHTML, /RNN 개념 설명/);

search.search('순환신경망');
assert.match(results.innerHTML, /RNN 개념 설명/);

search.search('순한신경망');
assert.match(results.innerHTML, /RNN 개념 설명/);

search.search('Transfomer');
assert.match(results.innerHTML, /Transformer 개념/);

search.search('assets-only');
assert.match(results.innerHTML, /No results found/);

search.search('Transformer');
assert.equal((results.innerHTML.match(/<li>/g) || []).length, 10);

const failedResults = { innerHTML: '' };
window.SimpleJekyllSearch({
  searchInput: { value: '', addEventListener() {} },
  resultsContainer: failedResults,
  json: '/missing-search.json'
});
pendingRequest.status = 500;
pendingRequest.readyState = 4;
pendingRequest.onreadystatechange();
assert.match(failedResults.innerHTML, /could not be loaded/);

console.log('search behavior: ok');
