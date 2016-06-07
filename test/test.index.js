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

  it('sets label to value', function(){
    input.add({value: 20})
    assert.equal(input.label(), 20)
    assert.equal(input.value(), 20)
    input.setValue(5)
    assert.equal(input.label(), 5)
    assert.equal(input.value(), 5)
  })

  it('adds a label with a prefix and suffix', function(){
    input.add({data: { beforeLabel: 'Disk: ', afterLabel: 'MB'}})
    assert.equal(input.label(), 'Disk: 0MB')
    assert.equal(input.data().segments, 101)
  })

  it('adds a multiple labels with a prefixes and suffixes', function(){
    input.add({
      data: { 
        aBeforeLabel: 'a', aAfterLabel: 'a', bBeforeLabel: 'b', bAfterLabel: 'b',
        labelA: [1,2,3,4,5],
        labelB: [6,7,8,9,10]
      }
    })
    assert.equal(input.label('a'), 'a1a')
    assert.equal(input.label('b'), 'b6b')
  })

  it('Default labels are not added when custom labels are present', function(){
    input.add({
      data: { 
        aBeforeLabel: 'a', aAfterLabel: 'a', bBeforeLabel: 'b', bAfterLabel: 'b',
        label: ['a','b','c','d','e'],
        labelA: [1,2,3,4,5],
        labelB: [6,7,8,9,10]
      }
    })
    assert.isNull($('.slider-label-default'))
  })

  it('sets labels based on values', function(){
    var slider = input.add({
      data: {
        values: ['poor', 'fair', 'good', 'great', 'awesome'],
        input: 'test'
      }
    })
    assert.equal(input.data().segments, 5)
    assert.equal(input.el().value, 0)
    assert.equal(input.label(), 'poor')
  })

  it('updates input with values setting', function(){
    var slider = input.add({
      data: {
        values: ['poor', 'fair', 'good', 'great', 'awesome'],
        input: 'test'
      }
    })
    input.setValue(5)
    assert.equal(input.value(), 'awesome')
  })
})

// Test labels
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
