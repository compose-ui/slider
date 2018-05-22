var $ = function(selector) { return document.querySelector(selector) }

var container = {
  init: function() {
    document.body.insertAdjacentHTML('beforeend', '<div id="container">')
  },

  el: function() {
    return $('#container')
  },

  inject: function(el){

    if(typeof el == 'string') {
      self.el().insertAdjacentHTML('beforeend', el)
      el = self.el().lastElementChild
    } else {
      self.el().appendChild(el)
    }

    return el
  },

  reset: function() {
    var element = self.el()
    if (element) {
      Array.prototype.forEach.call(element.children, function(child) {
        element.removeChild(child)
      })
    }

    return element
  }
}

module.exports = self = container
