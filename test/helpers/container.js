var domify = require('domify')

var $ = function(selector) { return document.querySelector(selector) }

var container = {
  init: function() {
    document.body.appendChild(domify('<div id="container">'))
  },

  el: function() {
    return $('#container')
  },

  inject: function(el){
    if(typeof el == 'string') {
      el = domify(el)
    }
    self.el().appendChild(el)
    return el
  },

  reset: function() {
    var element = self.el()
    if (element) {
      Array.prototype.forEach.call(element.children, function(child) {
        element.removeChild(child)
      })
    }

    return element
  }
}

module.exports = self = container
