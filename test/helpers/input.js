var Event = require('compose-event')
var Slider = require('../../')
var container = require('./container')

var $ = function(selector) { return document.querySelector(selector) }

var input = {
  el: function() {
    return $('input[type="range"]')
  },

  new: function (options) {
    options = options || {}
    document.body.insertAdjacentHTML('beforeend', '<input type="range">')
    var range = document.body.lastChild
    document.body.removeChild(range)

    Array.prototype.forEach.call(['id', 'name', 'min', 'max', 'value'], function(att) {
      if(options[att]) {
        range.setAttribute(att, options[att])
      }
    })

    if ( options.value ) range.value = options.value

    for(var item in options.data) {
      if(!options.data.hasOwnProperty(item)){ continue }

      range.dataset[item] = options.data[item]
    }

    return range
  },

  add: function(options) {
    var slider = this.new(options)
    container.inject(slider)
    Event.fire(document, 'page:change')

    return slider
  },

  data: function() {
    return Slider.getData(this.el())
  },

  set: function(val) {
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
    var el = $('.slider-label-'+type)
    if (el) {
      return this.parseVal(el.textContent)
    } else {
      console.error('Value not found for '+type+' label.')
    }
  },

  parseVal: function(val) {
    return (val).match(/^d+$/) ? Number(val) : val
  },

  state: function() {
    var id = this.el().dataset.id,
        parent = document.querySelector('#slider'+id)
    return parent.dataset.sliderState
  }
}

module.exports = input
