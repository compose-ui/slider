require ('./lib/object.assign')

var Event = require('compose-event')
// Improves the utility and user interface for range inputs

var sliders = []
var listening

var Slider = {
  // When a slider is changed, update the associated label and input.
  change: function(event) {
    self.refresh(event.currentTarget)
  },

  // Update labels and inputs
  refresh: function (slider) {
    self.setLabels(slider)
    self.setInput(slider)
    self.setFill(slider)
    self.setState(slider)
  },
  
  // Some browsers don't focus when a slider input is changed, this lets us force focus.
  focus: function(event){
    if ( event.isTrusted ) { // Do not focus on "artificially triggered" events
      event.currentTarget.focus()
    }
  },
                              
  // Inject slider templates into the DOM
  setup: function(){

    if (!listening) {
      Event.on(document, "input toggler:show", "[type=range]", self.change, { useCapture: true })
      Event.on(document, "click change input", "[type=range]", self.focus, { useCapture: true })
      listening = true
    }

    var ranges = document.querySelectorAll('[type=range]:not(.slider-input)')

    Array.prototype.forEach.call(ranges, function(slider){

      var data = self.data(slider)
      sliders.push(data)

      slider.dataset.id = data.id
      slider.dataset.initialValue = slider.value

      // Inject template and set inputs
      slider = self.template(slider)
      self.refresh(slider)

    })
  },

  data: function(el) {
    var data = {
      // Assign an incremental ID to track this slider with its data
      id: sliders.length,
      min: Number(el.getAttribute('min')) || 0,
      max: Number(el.getAttribute('max')) || 100,
      labels: {},
      externalLabels: {}
    }

    // Gets dataset as a hash
    Object.assign(data, self.extractData(el))

    data = self.extractValues(data)
    data = self.getLabels(data)

    if (data.values)
      data.max = (data.min + data.values.length - 1)

    data.segments = data.max - data.min + 1

    for (var key in data) {
      if(key.match(/-/)){
        data[this.camelCase(key)] = data[key]
        delete data[key]
      }
    }

    // Allow data-input or name attribute to set value for hidden input.
    //
    if (!data.input && el.getAttribute('name')) {
      data.input = el.getAttribute('name')
      el.removeAttribute('name')
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
      // Don't bother processing disabled labels
      if (data[val] === false) { continue }

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

    slider.setAttribute('min', data.min)
    slider.setAttribute('max', data.max)

    slider.classList.add('slider-input')

    if(slider.classList.contains('left-label'))
      slider.classList.remove('left-label')

    var containerHTML = self.templateHTML(data)

    var classes = ['slider-container']

    if (containerHTML.match('slider-line-label'))
      classes.push('line-labels')

    if (containerHTML.match('slider-label'))
      classes.push("with-label")
    else
      classes.push("without-label")

    containerHTML = '<div class="'+classes.join(' ')+'" id="slider'+data.id+'">'
      + containerHTML
      +'</div>'

    slider.insertAdjacentHTML('beforebegin', containerHTML)
    var container = slider.previousSibling
    container.querySelector('.slider-input-container').insertAdjacentHTML('afterbegin', slider.outerHTML)
    slider.parentNode.removeChild(slider)

    slider = container.querySelector('.slider-input')
    
    // Update attributes from processed data
    //
    if(!slider.getAttribute('value'))
      slider.value = data.value || data.min
    return slider
  },
  
  templateHTML: function(data){
    var html = ""
    var fills = ""
    
    if (data.mark || data.lineLabels) {
      for(var i = 1; i <= data.segments; i++) {
        
        html += "<div class='slider-segment'><span class='slider-segment-content'>"

        if (data.mark && data.mark.indexOf(i) != -1)
          html += "<span class='slider-segment-mark' data-index='"+i+"'></span>"

        if (data.lineLabels && data.lineLabels[i]) 
          html += "<span class='slider-line-label'>"+data.lineLabels[i]+"</span>"

        html += "</span></div>"
      }
    }

    // one less
    for(var i = 1; i < data.segments; i++) {
      fills += "<span class='slider-fill' data-index='"+i+"'></span>"
    }

    html = "<div class='slider-input-container'>"
      + "<div class='slider-track'>" + html + "</div>"
      + "<div class='slider-fills'>" + fills + "</div>"
      + "</div>"
      + self.labelTemplate(data)

    if (!data.inputExists && data.inputClass) {
      html += "<input class='"+data.inputClass+"' type='hidden' name='"+data.input+"' value=''>"
    }

    return html
    
  },

  labelTemplate: function(data){
    var html = ""

    if (data.label == false) { return html }

    for(var key in data.labels){
      html += '<span class="slider-label-'+key+' internal-label" data-slider-label="'+key+'">'
      html += self.labelHTML(data, key, '')
      html += '</span></span> '
    }

    if (html.length > 0) {
      html = "<div class='slider-label align-"+(data.positionLabel || 'right')+"'>" + html + "</div>"
    }

    return html
  },

  labelHTML: function(data, key, label) {
    return self.labelMeta(data, key, 'before')
    + "<span class='label-content'>" + label + "</span>"
    + self.labelMeta(data, key, 'after')
  },

  // Grab all prefixes or suffixes, for example:
  // - data-before-label='$'
  // - data-after-label='/mo'
  // - data-after-label-size='GB'
  //
  labelMeta: function(data, key, position) {
    var altKey = self.camelCase('-label-'+key)
    var meta = data[position+altKey] || data[position+'Label']
    if (meta)
      return "<span class='"+position+"-label'>"+meta+"</span>"
    else
      return ''
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

  getChange: function( slider ) {
    var initial = Number(slider.dataset.initialValue)

    if ( initial < slider.value ) {
      return "increased"
    } else if ( slider.value < initial ) {
      return "decreased"
    } else {
      return "initial"
    }
  },

  labelElements: function(id, key, external) {
    var selector = '[data-slider-label='+key+']'
    var internalSelector = "#slider"+id + ' ' + selector
    var externalSelector = selector += ':not(.internal-label)' 
    if (external) { 
      selector = externalSelector
    } else {
      selector = internalSelector + ', ' + externalSelector
    }

    return document.querySelectorAll(selector)
  },

  setState: function( slider ) {
    var data = self.getData( slider ),
        stateElements = document.querySelectorAll( '[data-track-slider-state="#'+slider.id+'"]' ),
        change = self.getChange( slider )

    document.querySelector('#slider'+data.id).dataset.sliderState = change

    Array.prototype.forEach.call( stateElements, function(el) {
      el.dataset.sliderState = change
    })
  },

  setFill: function(slider) {
    var data = self.getData(slider)
    var segments = document.querySelectorAll('#slider'+data.id+' .slider-segment')
    var fills = document.querySelectorAll('#slider'+data.id+' .slider-fill')
    var sliderIndex = self.sliderIndex(slider)
    
    Array.prototype.forEach.call(fills, function(fill, index){
      if (fill.dataset.index <= sliderIndex) {
        fill.classList.add('filled')
        if(segments[index]) {
          segments[index].classList.add('filled')
        }
      } else {
        fill.classList.remove('filled')
        if(segments[index]) {
          segments[index].classList.remove('filled')
        }
      }
    })
    
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

    if (slider.offsetParent === null) { return }

    Array.prototype.forEach.call(['labels', 'externalLabels'], function(type) {
      var external = (type == 'externalLabels')

      for (var key in data[type]) {
        var labelEls = self.labelElements(data.id, key, external)
        var labels = self.labelAtIndex(data[type], index)

        Array.prototype.forEach.call(labelEls, function(el) {
          var container = el.querySelector('.label-content')

          if ( container ) { container.innerHTML = labels[key] }
          else { el.innerHTML = self.labelHTML(data, key, labels[key]) }

          el.classList.toggle('empty-label', labels[key] === '')
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

Event.change(Slider.setup)

module.exports = Slider
