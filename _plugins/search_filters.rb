# frozen_string_literal: true

module Jekyll
  module SearchFilters
    def search_headings(content)
      content.to_s.each_line.filter_map do |line|
        match = line.match(/^\s{0,3}\#{1,6}\s+(.+?)\s*\#*\s*$/)
        next unless match

        match[1]
          .gsub(/!\[[^\]]*\]\([^)]*\)/, " ")
          .gsub(/\[([^\]]+)\]\([^)]*\)/, '\\1')
          .gsub(/<[^>]+>/, " ")
          .gsub(/[`*_~]/, "")
          .gsub(/\s+/, " ")
          .strip
      end.reject(&:empty?).join(" ")
    end
  end
end

Liquid::Template.register_filter(Jekyll::SearchFilters)
