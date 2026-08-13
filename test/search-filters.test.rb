# frozen_string_literal: true

module Liquid
  class Template
    def self.register_filter(_filter); end
  end
end

require_relative "../_plugins/search_filters"

filter = Object.new.extend(Jekyll::SearchFilters)
html = <<~HTML
  <h2 id="confusion-matrix">8. 분류의 평가 ② 혼동행렬</h2>
  <pre><code># 코드 주석은 제목이 아니다</code></pre>
  <h3>정밀도, <em>재현율</em> &amp; F1</h3>
HTML

expected = "8. 분류의 평가 ② 혼동행렬 정밀도, 재현율 & F1"
actual = filter.search_headings(html)

abort("expected #{expected.inspect}, got #{actual.inspect}") unless actual == expected

puts "search heading filter: ok"
