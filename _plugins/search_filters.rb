# frozen_string_literal: true

require "cgi"

module Jekyll
  module SearchFilters
    def search_headings(content)
      content.to_s
        .scan(/<h[1-6]\b[^>]*>(.*?)<\/h[1-6]>/im)
        .flatten
        .map do |heading|
          CGI.unescapeHTML(heading)
          .gsub(/<[^>]+>/, " ")
          .gsub(/\s+/, " ")
          .strip
        end
        .reject(&:empty?)
        .join(" ")
    end
  end
end

Liquid::Template.register_filter(Jekyll::SearchFilters)
