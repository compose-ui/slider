var assert = require('chai').assert
var domify = require('domify')
var Slider = require('../')
var Event = require('compose-event')

var input = require('./helpers/index')
var container = function() {
  return document.querySelector('.range-input-container')
}
var $ = function(selector) { return document.querySelector(selector) }

describe('Slider', function(){
  before(function(){
    document.body.appendChild(domify('<div id="container">'))
    Event.fire(document, 'DOMContentLoaded')
  })

  describe('setup', function(){
    it('sets up basic label', function(){
      input.add()
      assert.equal($('[data-range-label]').innerHTML, '50')
    })

    it('sets label to half of max value', function(){
      input.add({max: 20})
      assert.equal($('[data-range-label]').innerHTML, '10')
    })
    
    it('sets label to value', function(){
      input.add({value: 20})
      assert.equal($('[data-range-label]').innerHTML, '20')
    })

    it('updates label when value changes', function(){
      input.add()
      assert.equal($('[data-range-label]').innerHTML, '50')
      input.setValue(5)
      assert.equal($('[data-range-label]').innerHTML, '5')
    })

    it('sets values based in label count', function(){
      var slider = input.add({
        data: {
          values: ['poor', 'fair', 'awesome', 'good', 'great']
        }
      })
      assert.equal($('[data-range-label]').innerHTML, 'awesome')
    })
  })

})

// Test getLabels
//
// Test extractLabels
//
// Test inputTemplate
// 
// Test rangeTemplate
//
// Test lineLabels
//
// test labelTemplate
