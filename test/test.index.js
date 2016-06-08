var assert = require('chai').assert
var domify = require('domify')
var Slider = require('../')
var Event = require('compose-event')

var input = require('./helpers/index')
var container = function() {
  return document.querySelector('.range-input-container')
}
var $ = function(selector) { return document.querySelector(selector) }
var $$ = function(selector) { return document.querySelectorAll(selector) }

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

  // Complex labels and prefixes and suffixes
  it('adds a multiple labels with a prefixes and suffixes', function(){
    input.add({
      data: {
        beforeLabelA: 'a', afterLabelA: 'a', beforeLabelB: 'b', afterLabelB: 'b',
        label: ['a','b','c','d','e'],
        labelA: [1,2,3,4,5],
        labelB: [6,7,8,9,10]
      }
    })
    // Ensure that a default label is never displayed when
    // multiple lables are set
    assert.isNull($('.slider-label-default'))

    assert.equal(input.label('a'), 'a1a')
    assert.equal(input.label('b'), 'b6b')
    input.setValue(4)
    assert.equal(input.label('a'), 'a5a')
    assert.equal(input.label('b'), 'b10b')
  })

  it('sets labels from values when labels are not present', function(){
    var slider = input.add({
      data: {
        values: ['poor', 'fair', 'good', 'great', 'awesome'],
        input: 'test'
      }
    })
    assert.equal(input.data().segments, 5)
    assert.equal(input.label(), 'poor')
    input.setValue(4)
    assert.equal(input.label(), 'awesome')
  })

  it('adds marks', function(){
    var slider = input.add({
      data: {
        mark: [1, 10, 100]
      }
    })

    assert.equal($$('.slider-segment-mark').length, 3)

    var segments = $$('.slider-segment-content')

    // Ensure that the indexes where the marks are set are correct
    assert.isNotNull(segments[0].querySelector('.slider-segment-mark'))
    assert.isNotNull(segments[9].querySelector('.slider-segment-mark'))
    assert.isNotNull(segments[99].querySelector('.slider-segment-mark'))
  })

  it('adds line labels', function(){
    var slider = input.add({
      max: 10,
      data: {
        lineLabels: ['1:a', '6:b', '11:c']
      }
    })

    var lineLabels = $$('.slider-line-label')
    assert.equal(lineLabels.length, 3)
    
    assert.equal(lineLabels[0].innerHTML, 'a')
    assert.equal(lineLabels[1].innerHTML, 'b')
    assert.equal(lineLabels[2].innerHTML, 'c')

    var segments = $$('.slider-segment-content')
    // Ensure that the indexes where the labels are set are correct
    assert.equal(segments[0].textContent, 'a')
    assert.equal(segments[5].textContent, 'b')
    assert.equal(segments[10].textContent, 'c')
  })

  it('adds line labels with defaulted indexes', function(){
    var slider = input.add({
      max: 10,
      data: {
        lineLabels: ['a', 'b', 'c']
      }
    })

    var segments = $$('.slider-segment-content')
    // Ensure that the indexes where the labels are set are correct
    assert.equal(segments[0].textContent, 'a')
    assert.equal(segments[1].textContent, 'b')
    assert.equal(segments[2].textContent, 'c')
  })

  it('adds complex line labels', function(){
    var slider = input.add({
      max: 10,
      data: {
        lineLabels: '10,000;20,000;30,000'
      }
    })

    var segments = $$('.slider-segment-content')
    // Ensure that the indexes where the labels are set are correct
    assert.equal(segments[0].textContent, '10,000')
    assert.equal(segments[1].textContent, '20,000')
    assert.equal(segments[2].textContent, '30,000')
  })


  it('updates external labels', function(){
    var slider = input.add({
      max: 4,
      data: {
        externalLabelA: '1,2,3,4,5',
        externalLabelB: '6,7,8,9,10'
      }
    })

    var labelA = input.inject('<span data-slider-label="a">')
    var labelB = input.inject('<span data-slider-label="b">')

    input.setValue(1)

    assert.equal(labelA.textContent, 2)
    assert.equal(labelB.textContent, 7)
  })

})
