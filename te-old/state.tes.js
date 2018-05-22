var assert = require('chai').assert
var Slider = require('../')
var Event = require('compose-event')

var input = require('./helpers/input')
var container = require('./helpers/container')
var $ = function(selector) { return document.querySelector(selector) }
var $$ = function(selector) { return document.querySelectorAll(selector) }

describe('Slider', function(){
  before(function(){
    container.init()
    Event.fire(document, 'DOMContentLoaded')
  })

  afterEach(container.reset)

  it('Updates slider state', function(){
    input.add({value: 20})
    assert.equal(input.state(), 'initial')

    input.set(5)
    assert.equal(input.state(), 'decreased')

    input.set(25)
    assert.equal(input.state(), 'increased')
  })

  it('Updates external slider state', function(){
    var externalState = container.inject('<span data-track-slider-state="#state-test"></span>')

    input.add({value: 20, id: 'state-test'})
    assert.equal(externalState.dataset.sliderState, 'initial')

    input.set(5)
    assert.equal(externalState.dataset.sliderState, 'decreased')

    input.set(25)
    assert.equal(externalState.dataset.sliderState, 'increased')
  })
})
