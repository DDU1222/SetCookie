'use strict';


function sortedKeys(array) {
  var keys = [];
  for (var i in array) {
    keys.push(i);
  }
  keys.sort();
  return keys;
}

function CookieCache() {
  this.cookies_ = {};

  this.reset = function() {
    this.cookies_ = {};
  }

  this.add = function(cookie) {
    var domain = cookie.domain;
    if (!this.cookies_[domain]) {
      this.cookies_[domain] = [];
    }
    this.cookies_[domain].push(cookie);
  };

  this.remove = function(cookie) {
    var domain = cookie.domain;
    if (this.cookies_[domain]) {
      var i = 0;
      while (i < this.cookies_[domain].length) {
        if (cookieMatch(this.cookies_[domain][i], cookie)) {
          this.cookies_[domain].splice(i, 1);
        } else {
          i++;
        }
      }
      if (this.cookies_[domain].length == 0) {
        delete this.cookies_[domain];
      }
    }
  };


  this.getDomains = function(filter, name) {
    var result = [];
    sortedKeys(this.cookies_).forEach(function(domain) {
      if (!filter || domain.indexOf(filter) != -1) {
        result.push(domain);
      }
    });
    return result;
  }

  this.getCookies = function(domain) {
    return this.cookies_[domain];
  };
}

var cache = new CookieCache();

chrome.cookies.getAll({}, function(cookies) {
  for (var i in cookies) {
    cache.add(cookies[i]);
  }
});

chrome.omnibox.setDefaultSuggestion({
  description: '<match><url>keyword of host</url></match><dim> [</dim>baidu | baidu.com<dim>]</dim>'
});

var searchConfig = {}

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    var domains = cache.getDomains(text);
    var results = []
    domains.forEach(function(domain) {
      results.push({content: domain, description: domain})
    });
    suggest(results);
  });

chrome.omnibox.onInputEntered.addListener(
  function(text) {
    chrome.cookies.getAll({domain: text}, function(cookies) {
      cookies.forEach(function(cookie) {
        var newCookie = {
          url: 'http://localhost',
          domain: 'localhost',
          name: cookie.name,
          value: cookie.value,
          httpOnly: cookie.httpOnly,
          expirationDate: cookie.expirationDate,
        }
        chrome.cookies.set(newCookie)
      })
    })
  });