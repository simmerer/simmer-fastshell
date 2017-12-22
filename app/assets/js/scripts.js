/*!
 * simmer
 * Signature creative & technical work.
 * https://simmer.ooo
 * @author David Simmer
 * @version 5.0.1
 * Copyright 2017. CC BY-NC-ND licensed.
 */
/* jshint ignore:start */

// Generated by CoffeeScript 1.3.3

/*

  Harvey, A Second Face for Your Application's JavaScript

  Copyright 2012, Joschka Kintscher
  Released under the MIT License

  https://github.com/harvesthq/harvey/
*/


(function() {
  var State, _mediaQueryList;

  this.Harvey = (function() {

    function Harvey() {}

    Harvey.states = {};

    /*
        Creates a new State object for the given media query using the passed hash
        of callbacks and stores it in @states. The passed hash may contain up to
        three callbacks. See documentation of the State class for more information.
    */


    Harvey.attach = function(mediaQuery, callbacks) {
      var state;
      if (!this.states.hasOwnProperty(mediaQuery)) {
        this.states[mediaQuery] = [];
        this._add_css_for(mediaQuery);
      }
      state = new State(mediaQuery, callbacks != null ? callbacks.setup : void 0, callbacks != null ? callbacks.on : void 0, callbacks != null ? callbacks.off : void 0);
      if (!this.states[mediaQuery].length) {
        this._watch_query(mediaQuery);
      }
      this.states[mediaQuery].push(state);
      if (this._window_matchmedia(mediaQuery).matches) {
        this._update_states([state], true);
      }
      return state;
    };

    /*
        Removes a given State object from the @states hash.

        @param  object  state  A valid state object
    */


    Harvey.detach = function(state) {
      var i, s, _i, _len, _ref, _results;
      _ref = this.states[state.condition];
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        s = _ref[i];
        if (state === s) {
          _results.push(this.states[s.condition][i] = void 0);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    /*
        Create a new matchMediaListener for the passed media query.

        @param  string  mediaQuery  A valid CSS media query to watch
    */


    Harvey._watch_query = function(mediaQuery) {
      var _this = this;
      return this._window_matchmedia(mediaQuery).addListener(function(mql) {
        return _this._update_states(_this.states[mediaQuery], mql.matches);
      });
    };

    /*
        Activates/Deactivates every State object in the passed list.

        @param  array   states  A list of State objects to update
        @param  boolean active Whether to activate or deactivate the given states
    */


    Harvey._update_states = function(states, active) {
      var state, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = states.length; _i < _len; _i++) {
        state = states[_i];
        if (active) {
          _results.push(state.activate());
        } else {
          _results.push(state.deactivate());
        }
      }
      return _results;
    };

    /*
        BEWARE: You're at the edge of the map, mate. Here there be monsters!

        ------------------------------------------------------------------------------------

        Private methods to fix and polyfill the matchMedia interface for several engines

        * Inspired by Nicholas C. Zakas' article on the different problems with matchMedia
          http://www.nczonline.net/blog/2012/01/19/css-media-queries-in-javascript-part-2/

        * Implementing a modified coffeescript version of Scott Jehl's and Paul Irish's matchMedia.js polyfill
          https://github.com/paulirish/matchMedia.js
    */


    /*
        [FIX] for Firefox/Gecko browsers that lose reference to the
              MediaQueryList object unless it's being stored for runtime.
    */


    Harvey._mediaList = {};

    /*
        @param  string  mediaQuery      A valid CSS media query to monitor for updates
        @Return object  MediaQueryList  Depending on the browser and matchMedia support either a native
                                        mediaQueryList object or an instance of _mediaQueryList
    */


    Harvey._window_matchmedia = function(mediaQuery) {
      if (window.matchMedia && 'addListener' in window.matchMedia('all')) {
        if (!(mediaQuery in this._mediaList)) {
          this._mediaList[mediaQuery] = window.matchMedia(mediaQuery);
        }
        return this._mediaList[mediaQuery];
      }
      /*
            [POLYFILL] for all browsers that don't support matchMedia() at all (CSS media query support
                       is still mandatory though).
      */

      if (!this._listening) {
        this._listen();
      }
      if (!(mediaQuery in this._mediaList)) {
        this._mediaList[mediaQuery] = new _mediaQueryList(mediaQuery);
      }
      return this._mediaList[mediaQuery];
    };

    /*
        Add resize and orientationChange event listeners to the window element
        to monitor updates to the viewport
    */


    Harvey._listen = function() {
      var evt,
        _this = this;
      evt = window.addEventListener || window.attachEvent;
      evt('resize', function() {
        var mediaList, mediaQuery, _ref, _results;
        _ref = _this._mediaList;
        _results = [];
        for (mediaQuery in _ref) {
          mediaList = _ref[mediaQuery];
          _results.push(mediaList._process());
        }
        return _results;
      });
      evt('orientationChange', function() {
        var mediaList, mediaQuery, _ref, _results;
        _ref = _this._mediaList;
        _results = [];
        for (mediaQuery in _ref) {
          mediaList = _ref[mediaQuery];
          _results.push(mediaList._process());
        }
        return _results;
      });
      return this._listening = true;
    };

    /*
        [FIX] for Webkit engines that only trigger the MediaQueryListListener
              when there is at least one CSS selector for the respective media query

        @param  string  MediaQuery  The media query to inject CSS for
    */


    Harvey._add_css_for = function(mediaQuery) {
      if (!this.style) {
        this.style = document.createElement('style');
        this.style.setAttribute('type', 'text/css');
        document.getElementsByTagName('head')[0].appendChild(this.style);
      }
      mediaQuery = "@media " + mediaQuery + " {.harvey-test{}}";
      if (!this.style.styleSheet) {
        return this.style.appendChild(document.createTextNode(mediaQuery));
      }
    };

    return Harvey;

  })();

  /*
    A State allows to execute a set of callbacks for the given valid CSS media query.

    Callbacks are executed in the context of their state object to allow access to the
    corresponding media query of the State.

    States are not exposed to the global namespace. They can be used by calling the
    static Harvey.attach() and Harvey.detach() methods.
  */


  State = (function() {

    State.prototype.active = false;

    State.prototype.is_setup = false;

    /*
        Creates a new State object

        @param  string    condition The media query to check for
        @param  function  setup     Called the first time `condition` becomes valid
        @param  function  on        Called every time `condition` becomes valid
        @param  function  off       Called every time `condition` becomes invalid
    */


    function State(condition, setup, on, off) {
      this.condition = condition;
      this.setup = setup;
      this.on = on;
      this.off = off;
    }

    /*
        Activate this State object if it is currently deactivated. Also perform all
        set up tasks if this is the first time the State is activated
    */


    State.prototype.activate = function() {
      if (this.active) {
        return;
      }
      if (!this.is_setup) {
        if (typeof this.setup === "function") {
          this.setup();
        }
        this.is_setup = true;
      }
      if (typeof this.on === "function") {
        this.on();
      }
      return this.active = true;
    };

    /*
        Deactive this State object if it is currently active
    */


    State.prototype.deactivate = function() {
      if (!this.active) {
        return;
      }
      if (typeof this.off === "function") {
        this.off();
      }
      return this.active = false;
    };

    return State;

  })();

  /*
    [FIX] simple implemenation of the matchMedia interface to mimic the native
          matchMedia interface behaviour to work as a polyfill for Harvey
  */


  _mediaQueryList = (function() {
    /*
        Creates a new _mediaQueryList object

        @param  string  media  A valid CSS media query
    */

    function _mediaQueryList(media) {
      this.media = media;
      this._listeners = [];
      this.matches = this._matches();
    }

    /*
        Add a new listener to this mediaQueryList that will be called every time
        the media query becomes valid
    */


    _mediaQueryList.prototype.addListener = function(listener) {
      this._listeners.push(listener);
      return void 0;
    };

    /*
        Evaluate the media query of this mediaQueryList object and notify
        all registered listeners if the state has changed
    */


    _mediaQueryList.prototype._process = function() {
      var callback, current, _i, _len, _ref, _results;
      current = this._matches();
      if (this.matches === current) {
        return;
      }
      this.matches = current;
      _ref = this._listeners;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        callback = _ref[_i];
        _results.push(callback(this));
      }
      return _results;
    };

    /*
        Check whether the media query is currently valid
    */


    _mediaQueryList.prototype._matches = function() {
      if (!this._tester) {
        this._get_tester();
      }
      this._tester.innerHTML = '&shy;<style media="' + this.media + '">#harvey-mq-test{width:42px;}</style>';
      this._tester.removeChild(this._tester.firstChild);
      return this._tester.offsetWidth === 42;
    };

    /*
        Retrieve the element to test the media query on from the DOM or create
        it if it has not been injected into the page yet
    */


    _mediaQueryList.prototype._get_tester = function() {
      this._tester = document.getElementById('harvey-mq-test');
      if (!this._tester) {
        return this._build_tester();
      }
    };

    /*
        Create a new div with a unique id, move it outsite of the viewport and inject it into the DOM.
        This element will be used to check whether the registered media query is currently valid.
    */


    _mediaQueryList.prototype._build_tester = function() {
      this._tester = document.createElement('div');
      this._tester.id = 'harvey-mq-test';
      this._tester.style.cssText = 'position:absolute;top:-100em';
      return document.body.insertBefore(this._tester, document.body.firstChild);
    };

    return _mediaQueryList;

  })();

}).call(this);

/* jshint ignore:end */

/*!
 * simmer
 * Signature creative & technical work.
 * https://simmer.ooo
 * @author David Simmer
 * @version 5.0.1
 * Copyright 2017. CC BY-NC-ND licensed.
 */
/* jshint ignore:start */

// ------------------------------------------
// Rellax.js - v1.0.0
// Buttery smooth parallax library
// Copyright (c) 2016 Moe Amaya (@moeamaya)
// MIT license
//
// Thanks to Paraxify.js and Jaime Cabllero
// for parallax concepts
// ------------------------------------------

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Rellax = factory();
  }
}(this, function () {
  var Rellax = function(el, options){
    "use strict";

    var self = Object.create(Rellax.prototype);

    var posY = 0; // set it to -1 so the animate function gets called at least once
    var screenY = 0;
    var posX = 0;
    var screenX = 0;
    var blocks = [];
    var pause = false;

    // check what requestAnimationFrame to use, and if
    // it's not supported, use the onscroll event
    var loop = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      function(callback){ setTimeout(callback, 1000 / 60); };

    // check which transform property to use
    var transformProp = window.transformProp || (function(){
        var testEl = document.createElement('div');
        if (testEl.style.transform == null) {
          var vendors = ['Webkit', 'Moz', 'ms'];
          for (var vendor in vendors) {
            if (testEl.style[ vendors[vendor] + 'Transform' ] !== undefined) {
              return vendors[vendor] + 'Transform';
            }
          }
        }
        return 'transform';
      })();

    // limit the given number in the range [min, max]
    var clamp = function(num, min, max) {
      return (num <= min) ? min : ((num >= max) ? max : num);
    };

    // Default Settings
    self.options = {
      speed: -2,
      center: false,
      round: true,
      vertical: true,
      horizontal: false,
      callback: function() {},
    };

    // User defined options (might have more in the future)
    if (options){
      Object.keys(options).forEach(function(key){
        self.options[key] = options[key];
      });
    }

    // If some clown tries to crank speed, limit them to +-10
    self.options.speed = clamp(self.options.speed, -10, 10);

    // By default, rellax class
    if (!el) {
      el = '.rellax';
    }

    var elements = document.querySelectorAll(el);

    // Now query selector
    if (elements.length > 0) {
      self.elems = elements;
    }

    // The elements don't exist
    else {
      throw new Error("The elements you're trying to select don't exist.");
    }


    // Let's kick this script off
    // Build array for cached element values
    // Bind scroll and resize to animate method
    var init = function() {
      screenY = window.innerHeight;
      screenX = window.innerWidth;
      setPosition();

      // Get and cache initial position of all elements
      for (var i = 0; i < self.elems.length; i++){
        var block = createBlock(self.elems[i]);
        blocks.push(block);
      }

      window.addEventListener('resize', function(){
        animate();
      });

      // Start the loop
      update();

      // The loop does nothing if the scrollPosition did not change
      // so call animate to make sure every element has their transforms
      animate();
    };


    // We want to cache the parallax blocks'
    // values: base, top, height, speed
    // el: is dom object, return: el cache values
    var createBlock = function(el) {
      var dataPercentage = el.getAttribute( 'data-rellax-percentage' );
      var dataSpeed = el.getAttribute( 'data-rellax-speed' );
      var dataZindex = el.getAttribute( 'data-rellax-zindex' ) || 0;

      // initializing at scrollY = 0 (top of browser), scrollX = 0 (left of browser)
      // ensures elements are positioned based on HTML layout.
      //
      // If the element has the percentage attribute, the posY and posX needs to be
      // the current scroll position's value, so that the elements are still positioned based on HTML layout
      var posY = self.options.vertical ? ( dataPercentage || self.options.center ? (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) : 0 ) : 0;
      var posX = self.options.horizontal ? ( dataPercentage || self.options.center ? (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft) : 0 ) : 0;

      var blockTop = posY + el.getBoundingClientRect().top;
      var blockHeight = el.clientHeight || el.offsetHeight || el.scrollHeight;

      var blockLeft = posX + el.getBoundingClientRect().left;
      var blockWidth = el.clientWidth || el.offsetWidth || el.scrollWidth;

      // apparently parallax equation everyone uses
      var percentageY = dataPercentage ? dataPercentage : (posY - blockTop + screenY) / (blockHeight + screenY);
      var percentageX = dataPercentage ? dataPercentage : (posX - blockLeft + screenX) / (blockWidth + screenX);
      if(self.options.center){ percentageX = 0.5; percentageY = 0.5; }

      // Optional individual block speed as data attr, otherwise global speed
      // Check if has percentage attr, and limit speed to 5, else limit it to 10
      var speed = dataSpeed ? clamp(dataSpeed, -10, 10) : self.options.speed;
      if (dataPercentage || self.options.center) {
        speed = clamp(dataSpeed || self.options.speed, -5, 5);
      }

      var bases = updatePosition(percentageX, percentageY, speed);

      // ~~Store non-translate3d transforms~~
      // Store inline styles and extract transforms
      var style = el.style.cssText;
      var transform = '';

      // Check if there's an inline styled transform
      if (style.indexOf('transform') >= 0) {
        // Get the index of the transform
        var index = style.indexOf('transform');

        // Trim the style to the transform point and get the following semi-colon index
        var trimmedStyle = style.slice(index);
        var delimiter = trimmedStyle.indexOf(';');

        // Remove "transform" string and save the attribute
        if (delimiter) {
          transform = " " + trimmedStyle.slice(11, delimiter).replace(/\s/g,'');
        } else {
          transform = " " + trimmedStyle.slice(11).replace(/\s/g,'');
        }
      }

      return {
        baseX: bases.x,
        baseY: bases.y,
        top: blockTop,
        left: blockLeft,
        height: blockHeight,
        width: blockWidth,
        speed: speed,
        style: style,
        transform: transform,
        zindex: dataZindex
      };
    };

    // set scroll position (posY, posX)
    // side effect method is not ideal, but okay for now
    // returns true if the scroll changed, false if nothing happened
    var setPosition = function() {
      var oldY = posY;
      var oldX = posX;

      if (window.pageYOffset !== undefined) {
        posY = window.pageYOffset;
      } else {
        posY = (document.documentElement || document.body.parentNode || document.body).scrollTop;
      }

      if (window.pageXOffset !== undefined) {
        posX = window.pageXOffset;
      } else {
        posX = (document.documentElement || document.body.parentNode || document.body).scrollLeft;
      }

      if (oldY != posY && self.options.vertical) {
        // scroll changed, return true
        return true;
      }

      if (oldX != posX && self.options.horizontal) {
        // scroll changed, return true
        return true;
      }

      // scroll did not change
      return false;
    };


    // Ahh a pure function, gets new transform value
    // based on scrollPosition and speed
    // Allow for decimal pixel values
    var updatePosition = function(percentageX, percentageY, speed) {
      var result = {};
      var valueX = (speed * (100 * (1 - percentageX)));
      var valueY = (speed * (100 * (1 - percentageY)));

      result.x = self.options.round ? Math.round(valueX) : Math.round(valueX * 100) / 100;
      result.y = self.options.round ? Math.round(valueY) : Math.round(valueY * 100) / 100;

      return result;
    };


    //
    var update = function() {
      if (setPosition() && pause === false) {
        animate();
      }

      // loop again
      loop(update);
    };

    // Transform3d on parallax element
    var animate = function() {
      for (var i = 0; i < self.elems.length; i++){
        var percentageY = ((posY - blocks[i].top + screenY) / (blocks[i].height + screenY));
        var percentageX = ((posX - blocks[i].left + screenX) / (blocks[i].width + screenX));

        // Subtracting initialize value, so element stays in same spot as HTML
        var positions = updatePosition(percentageX, percentageY, blocks[i].speed);// - blocks[i].baseX;
        var positionY = positions.y - blocks[i].baseY;
        var positionX = positions.x - blocks[i].baseX;

        var zindex = blocks[i].zindex;

        // Move that element
        // (Set the new translation and append initial inline transforms.)
        var translate = 'translate3d(' + (self.options.horizontal ? positionX : '0') + 'px,' + (self.options.vertical ? positionY : '0') + 'px,' + zindex + 'px) ' + blocks[i].transform;
        self.elems[i].style[transformProp] = translate;
      }
      self.options.callback(positions);
    };


    self.destroy = function() {
      for (var i = 0; i < self.elems.length; i++){
        self.elems[i].style.cssText = blocks[i].style;
      }
      pause = true;
    };


    init();
    return self;
  };
  return Rellax;
}));

/*!
 * simmer
 * Signature creative & technical work.
 * https://simmer.ooo
 * @author David Simmer
 * @version 5.0.1
 * Copyright 2017. CC BY-NC-ND licensed.
 */
/*global Barba*/
/*global Rellax*/

'use strict';

// nodelists to arrays
function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }


// dynamic favicon
document.head || (document.head = document.getElementsByTagName('head')[0]);

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


// methods that require a ready DOM
function run() {

  var rellaxables = document.querySelectorAll('.rellax');
  if (rellaxables.length > 0) {
    var rellax = new Rellax('.rellax'); // jshint ignore:line
  }

  // var getUrl = window.location;
  // var getHomeUrl = getUrl.protocol + '//' + getUrl.host;
  var newBodyClasses = [];

  // •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
  // Barba.js
  // •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
  Barba.Pjax.Dom.wrapperId = 'bw';
  Barba.Pjax.Dom.containerClass = 'bc';

  Barba.Pjax.start();
  // Barba.Prefetch.init();

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
      var clientStr = classNames.filter(function (c) {return /client-/.test(c);})[0];
      if (clientStr) {
        var clientSlug = clientStr.substring('client-'.length);
        changeFavicon(clientSlug);
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
