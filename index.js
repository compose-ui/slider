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

  // When a slider is changed, update the associated label and input.
  change: function(event) {
    self.refresh(event.currentTarget)
  },

  // Update labels and inputs
  refresh: function (slider) {
    self.setLabels(slider)
    self.setInput(slider)
  },
  
  // Some browsers don't focus when a slider input is changed, this lets us force focus.
  focus: function(event){
    event.currentTarget.focus()
  },
                              
  // Inject slider templates into the DOM
  setup: function(){
    var ranges = document.querySelectorAll('[type=range]:not(.slider-input)')

    Array.prototype.forEach.call(ranges, function(slider){

      var data = self.data(slider)
      sliders.push(data)

      slider.dataset.id = data.id

      // Inject template and set inputs
      self.template(slider)
      self.refresh(slider)

    })
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
      // Generate a class name for querying later (because some name attributes contain illegal characters for queries)
      data.inputClass = data.input.replace(/\W/g,'-')
      data.inputExists = self.inputExists(el, data)
    }

    data = self.getLineLabels(data)

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

  // Convert dataset strings into hashes of arrays
  // examples:
  //  - data-label='one,two,three' => data.labels.default = ['one','two','three']
  //  - data.external-label-awesome='one;two;three' => data.externalLabels.awesome = ['one','two','three']
  //
  //  If labels have not been disabled (data-label='false') and there are no data labels,
  //  an array of values is set to data.labels.default
  //
  getLabels: function(data) {
    if (data.label && data.label.match(/false|none/))
      data.label = false

    // Unless labels have been disabed with data-label='false'
    for (var val in data) {
      // Ignore non-native methods injected by some wayward lib
      if (!data.hasOwnProperty(val)) { continue }
      if (data[val] === false) { 
        delete data[val]
        continue 
      }

      // Match properties: label, label-id, external-label-id
      var match = val.match(/^(external-)?label-(.+)|^label$/)

      if(match) {
        // Some labels may include commas, allow semicolons as an alternate separator
        //
        var delimiter = data[val].match(/;/) ? ';' : ','
        var labels    = data[val].split(delimiter).map(self.trim)
        var external  = match[1]
        var name      = match[2]

        if(external){
          data.externalLabels[name] = labels
        } else if (val == 'label') {
          data.labels.default = labels
          delete data.label
        } else {
          data.labels[name] = labels
        }

        delete data[val]
      }

      var labelCount = self.objectSize(data.labels)

      // If there are no labels, use values for a label
      if (labelCount == 0)
        data.labels.default = data.values

      if (labelCount > 1)
        delete data.labels.default
    }

    return data
  },

  getLineLabels: function(data){
    var lineLabels = {}

    // Line labels may be in the following formats:
    // - 1:start,11:end              - index specified, comma separated
    // - first,second,third,11:last  - default to index for some labels
    // - 10,000;20,000;30,000        - semicolon separated
    //
    if(data.lineLabels) {
      var delimiter = data.lineLabels.match(/;/) ? ';' : ','
      data.lineLabels.split(delimiter).map(function(labels, index){
        var l = labels.split(':')
        label = (!l[1] ? l[0] : l[1])
        index = (!l[1] ? index + 1 : l[0])
        lineLabels[index] = label
      })
      data.lineLabels = lineLabels
    }

    return data
  },

  // 
  template: function(slider){
    var data = self.getData(slider)
    //
    // Update attributes from processed data
    if(!slider.getAttribute('value'))
      slider.value = data.min

    slider.setAttribute('min', data.min)
    slider.setAttribute('max', data.max)

    slider.classList.add('slider-input')

    var container = domify(
      '<div class="slider-container" id="slider'+data.id+'">'
      + self.templateHTML(data)
      +'</div>')

    if (container.querySelector('.slider-line-label')) {
      container.classList.add('line-labels')
    }

    if (container.querySelector('.slider-label')) {
      container.classList.add("with-label")
    } else {
      container.classList.add("without-label")
    }

    slider.insertAdjacentElement('beforebegin', container)
    container.querySelector('.slider-input-container').insertAdjacentElement('afterbegin', slider)

    return container
  },
  
  templateHTML: function(data){
    var html = ""
    
    if (data.mark || data.lineLabels) {
      for(var i = 1; i <= data.segments; i++) {
        
        html += "<div class='slider-segment'><span class='slider-segment-content'>"

        if (data.mark && data.mark.indexOf(i) != -1)
          html += "<span class='slider-segment-mark'></span>"

        if (data.lineLabels && data.lineLabels[i]) 
          html += "<span class='slider-line-label'>"+data.lineLabels[i]+"</span>"

        html += "</span></div>"
      }
    }

    html = "<div class='slider-input-container'>"
      + "<div class='slider-track'>" + html + "</div>"
      + "<div class='slider-track-bg'></div>"
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
      // Grab all prefixes or suffixes, examples:
      // - data-before-label='$'
      // - data-after-label='/mo'
      // - data-after-label-size='GB'
      //
      var altKey = self.camelCase('-label-'+key)
      var before = data.beforeLabel || data['before'+altKey]
      var after  = data.afterLabel || data['after'+altKey]

      html += "<span class='slider-label-"+key+"'>"
      if (before) { html += "<span class='before-label'>"+before+"</span>" }
      html += "<span data-slider-label='"+key+"'></span>"
      if (after)  { html += "<span class='after-label'>"+after+"</span>" }
      html += "</span> "
    }

    if (html.length > 0) {
      html = "<div class='slider-label'>" + html + "</div>"
    }

    return html
  },

  // Is there already an input matching this name?
  inputExists: function(slider, data) {
    if (data.inputClass) {
      var input = self.scope(slider).querySelector('input[name="'+data.input+'"]')

      if(input) {
        input.classList.add(data.inputClass)
        return true
      }
    }
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

  labelElements: function(id, key, external) {
    var selector = '[data-slider-label='+key+']'
    var scopedSelector = '#slider'+id+' '+ selector

    selector = (external ? selector : scopedSelector)

    return document.querySelectorAll(selector)
  },

  setInput: function(slider) {
    var data = self.getData(slider)

    // Don't update hidden sliders
    if (slider.offsetParent === null) { return }

    if (data.input && data.values) {
      var value = data.values[self.sliderIndex(slider)]
      var selector = "."+data.input.replace(/\W/g,'-')
      var inputs = self.scope(slider).querySelectorAll(selector)

      Array.prototype.forEach.call(inputs, function(input){
        input.value = value
      })
    }
  },

  setLabels: function(slider) {
    var data = self.getData(slider)
    var index = self.sliderIndex(slider)

    Array.prototype.forEach.call(['labels', 'externalLabels'], function(type) {
      for (var key in data[type]) {
        var labelEls = self.labelElements(data.id, key, type == 'externalLabels')
        var labels = self.labelAtIndex(data[type], index)

        Array.prototype.forEach.call(labelEls, function(el) {
          el.innerHTML = labels[key]
        })
      }
    })
  },

  // Get all labels for the current slider position
  labelAtIndex: function(labels, index){
    var set = {}
    for (var key in labels) {
      set[key] = labels[key][index]
    }
    return set
  }, 

  // Normalize the slider value by the minimum value
  sliderIndex: function(slider){
    return Number(slider.value) - Number(slider.getAttribute('min'))
  },

  // If slider is in a form, return that form.
  // This alows us to be sure that sliders in one
  // form do not update labels with the same name
  // in another form.
  //
  scope: function(slider) {
    var el = slider

    while (el && el.tagName != "FORM") {
      el = el.parentNode
    }

    return el || document
  },

  // Function for easy maping, as in: someArray.map(self.trim)
  trim: function(name){ 
    return name.trim()
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
