# frozen_string_literal: true

source "https://rubygems.org"
gemspec

gem "jekyll"

group :jekyll_plugins do
  gem "jekyll-paginate"  # 이 줄을 추가합니다.
end

# Windows에서 _config.yml의 timezone 을 읽으려면 필요하다 (Jekyll 공식 Windows 안내)
gem "tzinfo", "~> 2.0"
gem "tzinfo-data", platforms: %i[windows jruby]