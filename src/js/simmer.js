/*global Barba*/
/*global Rellax*/

'use strict';

// nodelists to arrays
function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }


// dynamic favicon
document.head || (document.head = document.getElementsByTagName('head')[0]); // jshint ignore:line

function changeFavicon(src) {
  var link = document.createElement('link'),
      oldLink = document.getElementById('dynamic-favicon');
  link.id = 'dynamic-favicon';
  link.rel = 'shortcut icon';
  link.href = '/assets/img/favicons/favicon-' + src + '.ico';
  if (oldLink) {
    document.head.removeChild(oldLink);
  }
  document.head.appendChild(link);
}



function $$(query, context) {
  var arr = Array.prototype.slice.call(
    (context || document).querySelectorAll(query)
  );
  return arr;
}

function addBodyClass(classStr) {
  var body = document.querySelector('body');
  body.classList.add(classStr);
}
function removeBodyClass(classStr) {
  var body = document.querySelector('body');
  body.classList.remove(classStr);
}

function attachHoverListener(el) {
  el.addEventListener('mouseenter', function(ev){
    var projectClass = ev.target.parentNode.classList[0];
    addBodyClass('projects-hover');
    addBodyClass('projects--' + projectClass + '-hover');
  });
  el.addEventListener('mouseleave', function(ev){
    var projectClass = ev.target.parentNode.classList[0];
    removeBodyClass('projects-hover');
    removeBodyClass('projects--' + projectClass + '-hover');
  });
}

function addProjectHovers() {
  var projectList = document.querySelector('#project-list');
  var projectArray = $$('a', projectList);
  projectArray.forEach(function(project){
    attachHoverListener(project);
  });
}


// methods that require a ready DOM
function run() {

  // rellax
  var rellaxables = document.querySelectorAll('.rellax');
  if (rellaxables.length > 0) {
    var rellax = new Rellax('.rellax'); // jshint ignore:line
  }

  // fancy hovers
  addProjectHovers();


  // barba
  var newBodyClasses = [];

  Barba.Pjax.Dom.wrapperId = 'bw';
  Barba.Pjax.Dom.containerClass = 'bc';

  Barba.Pjax.start();
  Barba.Prefetch.init();

  var FadeTransition = Barba.BaseTransition.extend({
    start: function start() {
      Promise.all([this.newContainerLoading, this.fadeOut()]).then(this.fadeIn.bind(this));
    },

    fadeOut: function fadeOut() {
      var deferred = Barba.Utils.deferred();
      this.oldContainer.classList.add('fade-out');
      deferred.resolve();
      return deferred.promise;
    },

    fadeIn: function fadeIn() {
      // var _this = this;
      var newEl = this.newContainer;

      var body = document.querySelector('body');
      body.classList = newBodyClasses;
      var classNames = [].concat(_toConsumableArray(newBodyClasses));
      var projectStr = classNames.filter(function (c) {return /project-/.test(c);})[0];
      if (projectStr) {
        var projectSlug = projectStr.substring('project-'.length);
        changeFavicon(projectSlug);
      }
      else {
        changeFavicon('home');
      }

      this.oldContainer.classList.add('hide');
      newEl.classList.add('fade-in');
      window.scrollTo(0,0);

      this.done();
    }
  });

  Barba.Pjax.getTransition = function () {
    return FadeTransition;
  };

  Barba.Dispatcher.on('newPageReady', function (currentStatus, prevStatus, HTMLElementContainer, newPageRawHTML) {
    var response = newPageRawHTML.replace(/(<\/?)body( .+?)?>/gi, '$1notBody$2>');
    var responseFrag = document.createRange().createContextualFragment(response);
    newBodyClasses = responseFrag.querySelector('notBody').classList;
  });

  Barba.Dispatcher.on('transitionCompleted', function() {
    var rellaxables = document.querySelectorAll('.rellax');
    if (rellaxables.length > 0) {
      var rellax = new Rellax('.rellax'); // jshint ignore:line
    }
    addProjectHovers();
    setTimeout( function() {
      var logo = document.querySelector('.brand a');
      logo.blur();
    }, 1250);
  });

}

// in case the document is already rendered
if (document.readyState !== 'loading') {
  run();
}
// modern browsers
else if (document.addEventListener) {
  document.addEventListener('DOMContentLoaded', run);
}
// IE <= 8
else {
  document.attachEvent('onreadystatechange', function () {
    if (document.readyState === 'complete') {
      run();
    }
  });
}
