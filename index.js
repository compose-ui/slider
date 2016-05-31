var Event = require('compose-event')

// Improves the utility and user interface for range inputs

var RangeInputHelper = {
  listen: function(){
    Event.on(document, "input toggler:show", "[type=range]", RangeInputHelper.change)
    Event.on(document, "click change input", "[type=range]", RangeInputHelper.focus)
  },

  change: function(event) {
    RangeInputHelper.refresh(event.currentTarget)
  },

  refresh: function (slider) {
    RangeInputHelper.setLabels(slider)
    RangeInputHelper.setInput(slider)
  },
  
  focus: function(event){
    event.currentTarget.focus()
  },
                              
  setup: function(){
    var ranges = document.querySelectorAll('[type=range]:not(.range-input)')
    Array.prototype.forEach.call(ranges, RangeInputHelper.initSlider)
  },
  
  initSlider: function(slider){
    slider.className += ' range-input'
    slider.dataset.id = String(parseInt(Math.random() * 10000))
    RangeInputHelper.cacheSet(slider)

    slider.insertAdjacentHTML('beforebegin', RangeInputHelper.template(slider))
    RangeInputHelper.refresh(slider)

    slider.remove()
  },

  cacheSet: function(slider) {
    var labels = RangeInputHelper.getLabels(slider)
    slider.dataset.cache = JSON.stringify({
      labels: labels,
      externalLabels: RangeInputHelper.extractLabels(slider, 'data-external-label-'),
    })
  },
  
  template: function(slider){

    var inputTemplate = RangeInputHelper.inputTemplate(slider)
    var rangeTemplate = RangeInputHelper.rangeTemplate(slider)

    return inputTemplate + rangeTemplate
  },
  
  rangeTemplate: function(slider){
    var html = ""
    var lineLabels = RangeInputHelper.lineLabels(slider)
    
    if (slider.dataset.mark || slider.dataset.lineLabels) {
      var segments = RangeInputHelper.segments(slider)
      var mark = []

      if (slider.dataset.mark) {
        mark = slider.dataset.mark.split(',').map(Number)
      }
      
      for(var i = 1; i <= segments; i++) {
        var markClass = ((mark.indexOf(i) != -1) ? ' mark' : '')
        var lineLabel = lineLabels[String(i)]
        
        html += "<div class='range-segment'><span class='range-segment-content'>"
        if (mark.indexOf(i) != -1){
          html += "<span class='range-segment-mark'></span>"
        }
        if (lineLabel) {
          html += "<span class='range-line-label'>"+lineLabel+"</span>"
        }
        html += "</span></div>"
      }
    }

    slider.className += ' range-input-slider'
    html = "<div class='range-input-container'>" + slider.outerHTML + "<div class='range-track'>" + html + "</div><div class='range-track-bg'></div></div>"

    var labelHTML = RangeInputHelper.labelTemplate(slider)
    
    return "<div class='slider-container"
    + (RangeInputHelper.objectSize(lineLabels) > 0 ? " line-labels" : "")
    + (labelHTML.length > 0 ? " with-label" : " without-label")
    + "' id='slider-"+ slider.dataset.id +"' >"
    + html
    + labelHTML
    + "</div>"
  },

  lineLabels: function(slider){
    var lineLabels = {}
    if(slider.dataset.lineLabels) {
      slider.dataset.lineLabels.split(';').map(function(labels){
        var l = labels.split(':')
        lineLabels[l[0]] = l[1]
      })
    }
    return lineLabels
  },
  
  labelTemplate: function(slider){
    var html = ""
    var labels = JSON.parse(slider.dataset.cache).labels

    for(var key in labels){
      var altKey = RangeInputHelper.camelCase(key)
      var before = slider.dataset.beforeLabel || slider.dataset[altKey+'BeforeLabel']
      var after  = slider.dataset.afterLabel || slider.dataset[altKey+'AfterLabel']

      html += "<span class='range-label-"+key+"'>"
      if (before) { html += "<span class='before-label'>"+before+"</span>" }
      html += "<span data-label='"+key+"'></span>"
      if (after)  { html += "<span class='after-label'>"+after+"</span>" }
      html += "</span> "
    }

    if (html.length > 0) {
      html = "<div class='range-label'>" + html + "</div>"
    }

    return html
  },

  inputTemplate: function(slider) {
    if (slider.dataset.input && slider.dataset.values) {
      // Generate a class name for querying later (because some name attributes contain illegal characters for queries)
      var classname = slider.dataset.input.replace(/\W/g,'-')

      var input = this.existingInput(slider)

      if (input) {
        input.classList.add(classname)
        return ""
      }
      
      return "<input class='"+classname+"' type='hidden' name='"+slider.dataset.input+"' value='"+slider.value+"'>"
    } else return ""
  },

  existingInput: function(slider) {
    return this.scope(slider).querySelector('input[name="'+slider.dataset.input+'"]')
  },

  scope: function(slider) {
    var el = slider

    while (el && el.tagName != "FORM") {
      el = el.parentNode
    }

    return el || document
  },

  getLabels: function(slider) {
    var labels = {}

    if (slider.dataset.label == 'false')
      return labels
  
    labels = RangeInputHelper.extractLabels(slider, 'data-label-')
    
    if (RangeInputHelper.objectSize(labels) == 0) {
      if (slider.dataset.label) {
        labels['default'] = slider.dataset.label.split(';')
      } else if(slider.dataset.values){
        labels['default'] = slider.dataset.values.split(',')
      } else {
        labels['default'] = RangeInputHelper.valueLabels(slider)
      }
    }

    return labels
  },

  extractLabels: function(slider, pattern) {
    var labels = {}

    for (var i = 0; i < slider.attributes.length; i++){
      var name = slider.attributes[i].nodeName

      if(new RegExp("^"+pattern).test(name)) {
        name = name.replace(pattern, '')
        labels[name] = slider.attributes[i].nodeValue.split(';')
      }
    }
    return labels
  },

  setLabels: function(slider) {
    var labels = JSON.parse(slider.dataset.cache).labels
    var externalLabels = JSON.parse(slider.dataset.cache).externalLabels

    RangeInputHelper.updateLabels(slider, labels)
    RangeInputHelper.updateLabels(slider, externalLabels, 'external')
  },

  updateLabels: function(slider, labels, type) {
    for (var key in labels) {
      var elements = RangeInputHelper.labelElements(slider, type, key)

      Array.prototype.forEach.call(elements, function(target) {
        var index = RangeInputHelper.rangeValueIndex(slider)
        target.innerHTML = RangeInputHelper.getLabelsAtIndex(labels, index)[key]
      })
    }
  },

  labelElements: function(slider, type, key) {
    var selector = ''

    if (type == 'external')
      selector = '[data-range-label='+key+']'
    else
      selector = '#slider-'+slider.dataset.id+' [data-label='+key+']'

    return document.querySelectorAll(selector)
  },

  setInput: function(slider) {
    if (slider.offsetParent === null) { return }
    if (slider.dataset.input && slider.dataset.values) {
      var value = slider.dataset.values.split(',')[RangeInputHelper.rangeValueIndex(slider)]
      var selector = "."+slider.dataset.input.replace(/\W/g,'-')
      var inputs = this.scope(slider).querySelectorAll(selector)

      Array.prototype.forEach.call(inputs, function(input){
        input.value = value
      })
    }
  },

  getLabelsAtIndex: function(labels, index){
    var set = {}
    for (var key in labels) {
      set[key] = labels[key][index]
    }
    return set
  }, 

  segments: function(slider){
    return Number(slider.getAttribute('max') || 100) - Number(slider.getAttribute('min') || 0) + 1
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

Event.ready(RangeInputHelper.listen)
Event.change(RangeInputHelper.setup)

