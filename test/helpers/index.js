var domify = require('domify')
var Event = require('compose-event')

var helpers = {
  el: function() {
    return document.querySelector('input[type="range"]')
  },

  container: function() {
    return document.querySelector('#container')
  },

  new: function (options) {
    options = options || {}
    range = domify('<input type="range">')

    Array.prototype.forEach.call(['name', 'min', 'max', 'value'], function(att) {
      if(options[att]) {
        range.setAttribute(att, options[att])
      }
    })

    for(var item in options.data) {
      if(!options.data.hasOwnProperty(item)){ continue }

      range.dataset[item] = options.data[item]
    }

    return range
  },

  remove: function(selector) {
    var element = document.querySelector(selector)
    if (element) {
      Array.prototype.forEach.call(element.children, function(child) {
        element.removeChild(child)
      })
    }

    return element
  },

  add: function(options) {
    var el = this.remove('#container')
    var slider = this.new(options)
    el.appendChild(slider)
    Event.fire(document, 'page:change')

    return slider
  },

  setValue: function(val) {
    var slider = this.el()
    slider.value = val
    Event.fire(slider, 'input')
  },

  getValue: function(){
    var hidden = document.querySelector('input[type="hidden"]')
    if(hidden) {
      return hidden.value
    } else {
      return this.el().value
    }
  }

}

module.exports = helpers
