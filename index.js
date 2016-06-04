require ('./lib/object.assign')

var Event = require('compose-event')
var domify = require('domify')

// Improves the utility and user interface for range inputs

var sliders = []

var Slider = {
  listen: function(){
    Event.on(document, "input toggler:show", "[type=range]", self.change)
    Event.on(document, "click change input", "[type=range]", self.focus)
  },

  change: function(event) {
    self.refresh(event.currentTarget)
  },

  refresh: function (slider) {
    self.setLabels(slider)
    self.setInput(slider)
  },
  
  focus: function(event){
    event.currentTarget.focus()
  },
                              
  setup: function(){
    var ranges = document.querySelectorAll('[type=range]:not(.range-input)')
    Array.prototype.forEach.call(ranges, self.initSlider)
  },
  
  initSlider: function(slider){

    var data = self.data(slider)

    slider.setAttribute('min', data.min)
    slider.setAttribute('max', data.max)
    slider.dataset.id = data.id

    sliders.push(data)

    self.template(slider)
    self.refresh(slider)
  },

  data: function(el) {

    var data = {
      // Assign an incremental ID to track this slider with its data
      id: sliders.length,
      min: el.getAttribute('min') || 0,
      max: el.getAttribute('max') || 100,
      labels: {},
      externalLabels: {}
    }

    // Gets dataset as a hash
    Object.assign(data, self.extractData(el))

    data = self.extractValues(data)
    data = self.getLabels(data)

    data.max = (data.min + data.values.length - 1)
    data.segments = Number(data.max) - Number(data.min) + 1

    for (var key in data) {
      if(key.match(/-/)){
        data[this.camelCase(key)] = data[key]
        delete data[key]
      }
    }

    if (data.input) {
      // Generate a class name for querying later (because some name attributes 
      // contain illegal characters for queries)
      data.inputClass = data.input.replace(/\W/g,'-')
      data.inputExists = self.inputExists(el, data)
    }

    data.lineLabels = self.getLineLabels(data)

    if (data.mark) { 
      data.mark = data.mark.split(',').map(Number) 
    }

    return data
  },

  getData: function(slider) {
    if (typeof slider != 'string' && slider.dataset) {
      slider = slider.dataset.id
    }
    return sliders[slider]
  },

  extractValues: function(data) {
    if (data.values) { 
      data.values = data.values.split(',').map(self.trim)
    } else {
      data.values = []
      for (var i = data.min; i <= data.max; i++ ) {
        data.values.push(i)
      }
    }

    return data
  },

  getLabels: function(data) {
    var noLabel = (data.label && data.label.match(/false|none/))

    // Unless labels have been disabed with data-label='false'
    for (var val in data) {
      // Ignore non-native methods injected by some wayward lib
      if (!data.hasOwnProperty(val)) { continue }

      // Match properties: label, label-id, external-label-id
      var match = val.match(/label-(.+)|^label$/)

      if(match) {
        // Some labels may include commas, allow semicolons as an alternate separator
        //
        var delimiter = data[val].match(/;/) ? ';' : ','
        var labels    = data[val].split(delimiter).map(self.trim)
        var name      = match[1]

        if(val.match(/^external/)){
          data.externalLabels[name] = labels
        } else if (!noLabel) {
          if (val == 'label')
            data.labels.default = labels
          else
            data.labels[name] = labels
        }

        delete data[val]
      }

      var labelSize = self.objectSize(data.labels)

      if (labelSize == 0) 
        data.labels.default = data.values

      else if (labelSize > 1)
        delete data.labels.default
    }

    return data
  },

  getLineLabels: function(data){
    var lineLabels = {}

    if(data.lineLabels) {
      var delimiter = data.lineLabels.match(/;/) ? ';' : ','
      data.lineLabels.split(delimiter).map(function(labels, index){
        var l = labels.split(':')
        lineLabels[Number(l[0] || index)] = l[1]
      })
      return lineLabels
    }
  },
  

  trim: function(name){ 
    return name.trim()
  },

  template: function(slider){
    var data = self.getData(slider)

    slider.classList.add('range-input-slider', 'range-slider')

    var container = domify(
      '<div class="slider-container" id="slider'+data.id+'">'
      + self.templateHTML(data)
      +'</div>')

    if (container.querySelector('.range-line-label')) {
      container.classList.add('line-labels')
    }

    if (container.querySelector('.range-label')) {
      container.classList.add("with-label")
    } else {
      container.classList.add("without-label")
    }

    slider.insertAdjacentElement('beforebegin', container)
    container.querySelector('.range-input-container').insertAdjacentElement('afterbegin', slider)

    return container
  },
  
  templateHTML: function(data){
    var html = ""
    
    if (data.mark || data.lineLabels) {
      for(var i = 1; i <= data.segments; i++) {
        
        html += "<div class='range-segment'><span class='range-segment-content'>"

        if (data.mark.indexOf(i) != -1)
          html += "<span class='range-segment-mark'></span>"

        if (data.lineLabels && data.lineLabels[i]) 
          html += "<span class='range-line-label'>"+data.lineLabels[i]+"</span>"

        html += "</span></div>"
      }
    }

    html = "<div class='range-input-container'>"
      + "<div class='range-track'>" + html + "</div>"
      + "<div class='range-track-bg'></div>"
      + "</div>"
      + self.labelTemplate(data)

    if (!data.inputExists && data.inputClass) {
      html += "<input class='"+data.inputClass+"' type='hidden' name='"+data.input+"' value=''>"
    }

    return html
    
  },

  labelTemplate: function(data){
    var html = ""

    for(var key in data.labels){
      var altKey = self.camelCase(key)
      var before = data.beforeLabel || data[altKey+'BeforeLabel']
      var after  = data.afterLabel || data[altKey+'AfterLabel']

      html += "<span class='range-label-"+key+"'>"
      if (before) { html += "<span class='before-label'>"+before+"</span>" }
      html += "<span data-range-label='"+key+"'></span>"
      if (after)  { html += "<span class='after-label'>"+after+"</span>" }
      html += "</span> "
    }

    if (html.length > 0) {
      html = "<div class='range-label'>" + html + "</div>"
    }

    return html
  },

  inputExists: function(slider, data) {
    if (data.inputClass) {
      var input = self.scope(slider).querySelector('input[name="'+data.input+'"]')

      if(input) {
        input.classList.add(data.inputClass)
        return true
      }
    }
  },

  scope: function(slider) {
    var el = slider

    while (el && el.tagName != "FORM") {
      el = el.parentNode
    }

    return el || document
  },

  extractData: function(el) {
    var pattern = 'data-'
    var data = {}

    for (var i = 0; i < el.attributes.length; i++){
      var name = el.attributes[i].nodeName

      if(new RegExp("^"+pattern).test(name)) {
        name = name.replace(pattern, '')
        data[name] = el.attributes[i].nodeValue
      }
    }
    return data
  },

  setLabels: function(slider) {
    var data = self.getData(slider)
    var index = self.rangeValueIndex(slider)

    Array.prototype.forEach.call(['labels', 'externalLabels'], function(type) {
      for (var key in data[type]) {
        var labelEls = self.findLabels(data, type, key)
        var labels = self.labelAtIndex(data[type], index)

        Array.prototype.forEach.call(labelEls, function(el) {
          el.innerHTML = labels[key]
        })
      }
    })
  },

  findLabels: function(data, type, key) {
    var selector = '[data-range-label='+key+']'
    var scopedSelector = '#slider'+data.id+' '+ selector

    selector = (type == 'external' ? selector : scopedSelector)

    return document.querySelectorAll(selector)
  },

  setInput: function(slider) {
    var data = sliders[slider.dataset.id]
    if (slider.offsetParent === null) { return }
    if (data.input && data.values) {
      var value = data.values[self.rangeValueIndex(slider)]
      var selector = "."+data.input.replace(/\W/g,'-')
      var inputs = self.scope(slider).querySelectorAll(selector)

      Array.prototype.forEach.call(inputs, function(input){
        input.value = value
      })
    }
  },

  labelAtIndex: function(labels, index){
    var set = {}
    for (var key in labels) {
      set[key] = labels[key][index]
    }
    return set
  }, 

  valueLabels: function(slider) {
    var values = []
    var start = Number(slider.getAttribute('min')) || 0
    var end = Number(slider.getAttribute('max')) || 100

    for (var i = start; i <= end; i++ ) {
      values[i] = i
    }

    return values
  },
  
  rangeValueIndex: function(slider){
    return Number(slider.value) - Number(slider.getAttribute('min'))
  },

  objectSize: function(object) {
    var length = 0; for(var i in object) { length++ }
    return length
  },

  camelCase: function(input) {
    return input.toLowerCase().replace(/-(.)/g, function(match, group) {
      return group.toUpperCase();
    });
  }
}

var self = Slider

Event.ready(Slider.listen)
Event.change(Slider.setup)

module.exports = Slider
