var domify = require('domify')
var Event = require('compose-event')
var Slider = require('../../')

var $ = function(selector) { return document.querySelector(selector) }

var helpers = {
  el: function() {
    return $('input[type="range"]')
  },

  container: function() {
    return $('#container')
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
    var element = $(selector)
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

  data: function() {
    return Slider.getData(this.el())
  },

  setValue: function(val) {
    var slider = this.el()
    slider.value = val
    Event.fire(slider, 'input')
  },

  value: function(){
    var hidden = $('input[type="hidden"]')
    if(hidden) {
      return this.parseVal(hidden.value)
    } else {
      return this.parseVal(this.el().value)
    }
  },

  label: function(type) {
    type = type || 'default'
    return this.parseVal($('.slider-label-'+type).textContent)
  },

  parseVal: function(val) {
    return (val).match(/^d+$/) ? Number(val) : val
  }
}

module.exports = helpers
