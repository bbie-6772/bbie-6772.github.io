/*!
  * Simple-Jekyll-Search
  * Copyright 2015-2020, Christian Fei
  * Licensed under the MIT License.
  */

(function () {
    'use strict'

    var _$Templater_7 = {
        compile: compile,
        setOptions: setOptions
    }

    const options = {}
    options.pattern = /\{(.*?)\}/g
    options.template = ''
    options.middleware = function () { }

    function setOptions(_options) {
        options.pattern = _options.pattern || options.pattern
        options.template = _options.template || options.template
        if (typeof _options.middleware === 'function') {
            options.middleware = _options.middleware
        }
    }

    function compile(data) {
        return options.template.replace(options.pattern, function (match, prop) {
            const value = options.middleware(prop, data[prop], options.template)
            if (typeof value !== 'undefined') {
                return value
            }
            return data[prop] || match
        })
    }

    'use strict';

    function normalizeSearchText(value) {
        var text = String(value || '').toLowerCase()
        if (typeof text.normalize === 'function') {
            text = text.normalize('NFKC')
        }
        return text.replace(/[\s_-]+/g, ' ').trim()
    }

    function compactSearchText(value) {
        return normalizeSearchText(value).replace(/\s+/g, '')
    }

    function tokenizeSearchText(value) {
        return normalizeSearchText(value).match(/[\p{L}\p{N}+#.]+/gu) || []
    }

    function allowedEditDistance(term) {
        var length = compactSearchText(term).length
        if (length <= 3) return 0
        if (length <= 7) return 1
        return 2
    }

    function isWithinEditDistance(left, right, maximum) {
        if (Math.abs(left.length - right.length) > maximum) return false

        var previous = []
        for (var column = 0; column <= right.length; column++) previous[column] = column

        for (var row = 1; row <= left.length; row++) {
            var current = [row]
            var smallest = current[0]
            for (var index = 1; index <= right.length; index++) {
                var cost = left[row - 1] === right[index - 1] ? 0 : 1
                current[index] = Math.min(
                    current[index - 1] + 1,
                    previous[index] + 1,
                    previous[index - 1] + cost
                )
                smallest = Math.min(smallest, current[index])
            }
            if (smallest > maximum) return false
            previous = current
        }
        return previous[right.length] <= maximum
    }

    function isFuzzyTermMatch(text, term) {
        var compactTerm = compactSearchText(term)
        var maximum = allowedEditDistance(compactTerm)
        if (!compactTerm || maximum === 0) return false

        var candidates = tokenizeSearchText(text).map(compactSearchText)
        for (var start = 0; start < candidates.length; start++) {
            var combined = ''
            for (var end = start; end < candidates.length && end < start + 3; end++) {
                combined += candidates[end]
                if (combined.length > compactTerm.length + maximum) break
                if (isWithinEditDistance(combined, compactTerm, maximum)) return true
            }
        }
        return false
    }

    function matchesSearchText(text, query, allowFuzzy) {
        var compactText = compactSearchText(text)
        var compactQuery = compactSearchText(query)
        var textTerms = tokenizeSearchText(text)
        var queryTerms = tokenizeSearchText(query)

        if (!compactQuery || queryTerms.length === 0) return false
        if (compactText.indexOf(compactQuery) >= 0) return true

        return queryTerms.every(function (queryTerm) {
            var compactTerm = compactSearchText(queryTerm)
            var exact = textTerms.some(function (textTerm) {
                return compactSearchText(textTerm).indexOf(compactTerm) >= 0
            })
            return exact || (allowFuzzy && isFuzzyTermMatch(text, queryTerm))
        })
    }

    'use strict'

/* removed: const _$fuzzysearch_1 = require('fuzzysearch') */;

    var _$FuzzySearchStrategy_5 = new FuzzySearchStrategy()

    function FuzzySearchStrategy() {
        this.matches = function (string, crit) {
            return matchesSearchText(string, crit, true)
        }
    }

    'use strict'

    var _$LiteralSearchStrategy_6 = new LiteralSearchStrategy()

    function LiteralSearchStrategy() {
        this.matches = function (str, crit) {
            return matchesSearchText(str, crit, false)
        }
    }

    'use strict'

    var _$Repository_4 = {
        put: put,
        clear: clear,
        search: search,
        setOptions: __setOptions_4
    }

/* removed: const _$FuzzySearchStrategy_5 = require('./SearchStrategies/FuzzySearchStrategy') */;
/* removed: const _$LiteralSearchStrategy_6 = require('./SearchStrategies/LiteralSearchStrategy') */;

    function NoSort() {
        return 0
    }

    const data = []
    let opt = {}

    opt.fuzzy = false
    opt.limit = 10
    opt.searchStrategy = opt.fuzzy ? _$FuzzySearchStrategy_5 : _$LiteralSearchStrategy_6
    opt.sort = NoSort
    opt.exclude = []
    opt.searchableFields = ['title', 'tags', 'category', 'desc', 'headings']

    function put(data) {
        if (isObject(data)) {
            return addObject(data)
        }
        if (isArray(data)) {
            return addArray(data)
        }
        return undefined
    }
    function clear() {
        data.length = 0
        return data
    }

    function isObject(obj) {
        return Boolean(obj) && Object.prototype.toString.call(obj) === '[object Object]'
    }

    function isArray(obj) {
        return Boolean(obj) && Object.prototype.toString.call(obj) === '[object Array]'
    }

    function addObject(_data) {
        data.push(_data)
        return data
    }

    function addArray(_data) {
        const added = []
        clear()
        for (let i = 0, len = _data.length; i < len; i++) {
            if (isObject(_data[i])) {
                added.push(addObject(_data[i]))
            }
        }
        return added
    }

    function search(crit) {
        if (!crit) {
            return []
        }
        return findMatches(data, crit, opt.searchStrategy, opt)
            .sort(function (a, b) { return opt.sort(a, b, crit) })
            .slice(0, opt.limit)
    }

    function __setOptions_4(_opt) {
        opt = _opt || {}

        opt.fuzzy = _opt.fuzzy || false
        opt.limit = _opt.limit || 10
        opt.searchStrategy = _opt.fuzzy ? _$FuzzySearchStrategy_5 : _$LiteralSearchStrategy_6
        opt.sort = _opt.sort || NoSort
        opt.exclude = _opt.exclude || []
        opt.searchableFields = _opt.searchableFields || ['title', 'tags', 'category', 'desc', 'headings']
    }

    function findMatches(data, crit, strategy, opt) {
        const matches = []
        for (let i = 0; i < data.length; i++) {
            const match = findMatchesInObject(data[i], crit, strategy, opt)
            if (match) {
                matches.push(match)
            }
        }
        return matches
    }

    function findMatchesInObject(obj, crit, strategy, opt) {
        const searchableText = opt.searchableFields
            .map(function (field) { return obj[field] || '' })
            .filter(function (value) { return !isExcluded(value, opt.exclude) })
            .join(' ')
        if (strategy.matches(searchableText, crit)) return obj
    }

    function isExcluded(term, excludedTerms) {
        for (let i = 0, len = excludedTerms.length; i < len; i++) {
            const excludedTerm = excludedTerms[i]
            if (new RegExp(excludedTerm).test(term)) {
                return true
            }
        }
        return false
    }

    /* globals ActiveXObject:false */

    'use strict'

    var _$JSONLoader_2 = {
        load: load
    }

    function load(location, callback) {
        const xhr = getXHR()
        xhr.open('GET', location, true)
        xhr.onreadystatechange = createStateChangeListener(xhr, callback)
        xhr.send()
    }

    function createStateChangeListener(xhr, callback) {
        return function () {
            if (xhr.readyState !== 4) return
            if (xhr.status !== 200) {
                return callback(new Error('HTTP ' + xhr.status), null)
            }
            try {
                callback(null, JSON.parse(xhr.responseText))
            } catch (err) {
                callback(err, null)
            }
        }
    }

    function getXHR() {
        return window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP')
    }

    'use strict'

    var _$OptionsValidator_3 = function OptionsValidator(params) {
        if (!validateParams(params)) {
            throw new Error('-- OptionsValidator: required options missing')
        }

        if (!(this instanceof OptionsValidator)) {
            return new OptionsValidator(params)
        }

        const requiredOptions = params.required

        this.getRequiredOptions = function () {
            return requiredOptions
        }

        this.validate = function (parameters) {
            const errors = []
            requiredOptions.forEach(function (requiredOptionName) {
                if (typeof parameters[requiredOptionName] === 'undefined') {
                    errors.push(requiredOptionName)
                }
            })
            return errors
        }

        function validateParams(params) {
            if (!params) {
                return false
            }
            return typeof params.required !== 'undefined' && params.required instanceof Array
        }
    }

    'use strict'

    var _$utils_9 = {
        merge: merge,
        isJSON: isJSON
    }

    function merge(defaultParams, mergeParams) {
        const mergedOptions = {}
        for (const option in defaultParams) {
            mergedOptions[option] = defaultParams[option]
            if (typeof mergeParams[option] !== 'undefined') {
                mergedOptions[option] = mergeParams[option]
            }
        }
        return mergedOptions
    }

    function isJSON(json) {
        try {
            if (json instanceof Object && JSON.parse(JSON.stringify(json))) {
                return true
            }
            return false
        } catch (err) {
            return false
        }
    }

    var _$src_8 = {};
    (function (window) {
        'use strict'

        let options = {
            searchInput: null,
            resultsContainer: null,
            json: [],
            success: Function.prototype,
            searchResultTemplate: '<li><a href="{url}" title="{desc}">{title}</a></li>',
            templateMiddleware: Function.prototype,
            sortMiddleware: function () {
                return 0
            },
            noResultsText: 'No results found',
            loadingText: 'Loading search index...',
            errorText: 'Search index could not be loaded.',
            limit: 10,
            fuzzy: false,
            debounceTime: null,
            exclude: []
        }

        let debounceTimerHandle
        let isSearchReady = false
        const debounce = function (func, delayMillis) {
            if (delayMillis) {
                clearTimeout(debounceTimerHandle)
                debounceTimerHandle = setTimeout(func, delayMillis)
            } else {
                func.call()
            }
        }

        const requiredOptions = ['searchInput', 'resultsContainer', 'json']

  /* removed: const _$Templater_7 = require('./Templater') */;
  /* removed: const _$Repository_4 = require('./Repository') */;
  /* removed: const _$JSONLoader_2 = require('./JSONLoader') */;
        const optionsValidator = _$OptionsValidator_3({
            required: requiredOptions
        })
  /* removed: const _$utils_9 = require('./utils') */;

        window.SimpleJekyllSearch = function (_options) {
            const errors = optionsValidator.validate(_options)
            if (errors.length > 0) {
                throwError('You must specify the following required options: ' + requiredOptions)
            }

            options = _$utils_9.merge(options, _options)

            _$Templater_7.setOptions({
                template: options.searchResultTemplate,
                middleware: options.templateMiddleware
            })

            _$Repository_4.setOptions({
                fuzzy: options.fuzzy,
                limit: options.limit,
                sort: options.sortMiddleware,
                exclude: options.exclude
            })

            registerInput()
            setResultsBusy(true)
            appendToResultsContainer(options.loadingText)

            if (_$utils_9.isJSON(options.json)) {
                initWithJSON(options.json)
            } else {
                initWithURL(options.json)
            }

            const rv = {
                search: search
            }

            typeof options.success === 'function' && options.success.call(rv)
            return rv
        }

        function initWithJSON(json) {
            _$Repository_4.put(json)
            isSearchReady = true
            setResultsBusy(false)
            emptyResultsContainer()
            search(options.searchInput.value)
        }

        function initWithURL(url) {
            _$JSONLoader_2.load(url, function (err, json) {
                if (err) {
                    setResultsBusy(false)
                    emptyResultsContainer()
                    appendToResultsContainer(options.errorText)
                    return
                }
                initWithJSON(json)
            })
        }

        function emptyResultsContainer() {
            options.resultsContainer.innerHTML = ''
        }

        function appendToResultsContainer(text) {
            options.resultsContainer.innerHTML += text
        }

        function setResultsBusy(isBusy) {
            if (typeof options.resultsContainer.setAttribute === 'function') {
                options.resultsContainer.setAttribute('aria-busy', String(isBusy))
            }
        }

        function registerInput() {
            options.searchInput.addEventListener('input', function (e) {
                if (isWhitelistedKey(e.which)) {
                    emptyResultsContainer()
                    if (isSearchReady) {
                        debounce(function () { search(e.target.value) }, options.debounceTime)
                    } else {
                        appendToResultsContainer(options.loadingText)
                    }
                }
            })
        }

        function search(query) {
            if (isValidQuery(query)) {
                emptyResultsContainer()
                render(_$Repository_4.search(query), query)
            }
        }

        function render(results, query) {
            const len = results.length
            if (len === 0) {
                return appendToResultsContainer(options.noResultsText)
            }
            for (let i = 0; i < len; i++) {
                results[i].query = query
                appendToResultsContainer(_$Templater_7.compile(results[i]))
            }
        }

        function isValidQuery(query) {
            return query && query.length > 0
        }

        function isWhitelistedKey(key) {
            return [13, 16, 20, 37, 38, 39, 40, 91].indexOf(key) === -1
        }

        window.SimpleJekyllSearch.normalize = normalizeSearchText
        window.SimpleJekyllSearch.compact = compactSearchText
        window.SimpleJekyllSearch.tokenize = tokenizeSearchText
        window.SimpleJekyllSearch.isFuzzyMatch = isFuzzyTermMatch

        function throwError(message) {
            throw new Error('SimpleJekyllSearch --- ' + message)
        }
    })(window)

}());
