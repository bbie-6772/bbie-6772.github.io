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

window.SimpleJekyllSearch({
  searchInput: input,
  resultsContainer: results,
  json: '/search.json',
  debounceTime: 0
});

input.value = 'RNN';
input.listener({ which: 0, target: input });
assert.equal(results.innerHTML, '');

pendingRequest.status = 200;
pendingRequest.readyState = 4;
pendingRequest.responseText = JSON.stringify([
  { title: 'RNN 개념 설명', url: '/rnn', content: '순환 신경망' }
]);
pendingRequest.onreadystatechange();

assert.match(results.innerHTML, /RNN 개념 설명/);
console.log('search loading race: ok');
