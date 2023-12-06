var nextCloudClient = (function (exports, axios) {
  'use strict';

  var domain;

  // This constructor is used to store event handlers. Instantiating this is
  // faster than explicitly calling `Object.create(null)` to get a "clean" empty
  // object (tested with v8 v4.9).
  function EventHandlers() {}
  EventHandlers.prototype = Object.create(null);

  function EventEmitter() {
    EventEmitter.init.call(this);
  }

  // nodejs oddity
  // require('events') === require('events').EventEmitter
  EventEmitter.EventEmitter = EventEmitter;

  EventEmitter.usingDomains = false;

  EventEmitter.prototype.domain = undefined;
  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._maxListeners = undefined;

  // By default EventEmitters will print a warning if more than 10 listeners are
  // added to it. This is a useful default which helps finding memory leaks.
  EventEmitter.defaultMaxListeners = 10;

  EventEmitter.init = function() {
    this.domain = null;
    if (EventEmitter.usingDomains) {
      // if there is an active domain, then attach to it.
      if (domain.active ) ;
    }

    if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
      this._events = new EventHandlers();
      this._eventsCount = 0;
    }

    this._maxListeners = this._maxListeners || undefined;
  };

  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || isNaN(n))
      throw new TypeError('"n" argument must be a positive number');
    this._maxListeners = n;
    return this;
  };

  function $getMaxListeners(that) {
    if (that._maxListeners === undefined)
      return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }

  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return $getMaxListeners(this);
  };

  // These standalone emit* functions are used to optimize calling of event
  // handlers for fast cases because emit() itself often has a variable number of
  // arguments and can be deoptimized because of that. These functions always have
  // the same number of arguments and thus do not get deoptimized, so the code
  // inside them can execute faster.
  function emitNone(handler, isFn, self) {
    if (isFn)
      handler.call(self);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self);
    }
  }
  function emitOne(handler, isFn, self, arg1) {
    if (isFn)
      handler.call(self, arg1);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1);
    }
  }
  function emitTwo(handler, isFn, self, arg1, arg2) {
    if (isFn)
      handler.call(self, arg1, arg2);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2);
    }
  }
  function emitThree(handler, isFn, self, arg1, arg2, arg3) {
    if (isFn)
      handler.call(self, arg1, arg2, arg3);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2, arg3);
    }
  }

  function emitMany(handler, isFn, self, args) {
    if (isFn)
      handler.apply(self, args);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].apply(self, args);
    }
  }

  EventEmitter.prototype.emit = function emit(type) {
    var er, handler, len, args, i, events, domain;
    var doError = (type === 'error');

    events = this._events;
    if (events)
      doError = (doError && events.error == null);
    else if (!doError)
      return false;

    domain = this.domain;

    // If there is no 'error' event listener then throw.
    if (doError) {
      er = arguments[1];
      if (domain) {
        if (!er)
          er = new Error('Uncaught, unspecified "error" event');
        er.domainEmitter = this;
        er.domain = domain;
        er.domainThrown = false;
        domain.emit('error', er);
      } else if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
      return false;
    }

    handler = events[type];

    if (!handler)
      return false;

    var isFn = typeof handler === 'function';
    len = arguments.length;
    switch (len) {
      // fast cases
      case 1:
        emitNone(handler, isFn, this);
        break;
      case 2:
        emitOne(handler, isFn, this, arguments[1]);
        break;
      case 3:
        emitTwo(handler, isFn, this, arguments[1], arguments[2]);
        break;
      case 4:
        emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
        break;
      // slower
      default:
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        emitMany(handler, isFn, this, args);
    }

    return true;
  };

  function _addListener(target, type, listener, prepend) {
    var m;
    var events;
    var existing;

    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');

    events = target._events;
    if (!events) {
      events = target._events = new EventHandlers();
      target._eventsCount = 0;
    } else {
      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (events.newListener) {
        target.emit('newListener', type,
                    listener.listener ? listener.listener : listener);

        // Re-assign `events` because a newListener handler could have caused the
        // this._events to be assigned to a new object
        events = target._events;
      }
      existing = events[type];
    }

    if (!existing) {
      // Optimize the case of one listener. Don't need the extra array object.
      existing = events[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === 'function') {
        // Adding the second element, need to change to array.
        existing = events[type] = prepend ? [listener, existing] :
                                            [existing, listener];
      } else {
        // If we've already got an array, just append.
        if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
      }

      // Check for listener leak
      if (!existing.warned) {
        m = $getMaxListeners(target);
        if (m && m > 0 && existing.length > m) {
          existing.warned = true;
          var w = new Error('Possible EventEmitter memory leak detected. ' +
                              existing.length + ' ' + type + ' listeners added. ' +
                              'Use emitter.setMaxListeners() to increase limit');
          w.name = 'MaxListenersExceededWarning';
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          emitWarning(w);
        }
      }
    }

    return target;
  }
  function emitWarning(e) {
    typeof console.warn === 'function' ? console.warn(e) : console.log(e);
  }
  EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.prependListener =
      function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };

  function _onceWrap(target, type, listener) {
    var fired = false;
    function g() {
      target.removeListener(type, g);
      if (!fired) {
        fired = true;
        listener.apply(target, arguments);
      }
    }
    g.listener = listener;
    return g;
  }

  EventEmitter.prototype.once = function once(type, listener) {
    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.prependOnceListener =
      function prependOnceListener(type, listener) {
        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };

  // emits a 'removeListener' event iff the listener was removed
  EventEmitter.prototype.removeListener =
      function removeListener(type, listener) {
        var list, events, position, i, originalListener;

        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');

        events = this._events;
        if (!events)
          return this;

        list = events[type];
        if (!list)
          return this;

        if (list === listener || (list.listener && list.listener === listener)) {
          if (--this._eventsCount === 0)
            this._events = new EventHandlers();
          else {
            delete events[type];
            if (events.removeListener)
              this.emit('removeListener', type, list.listener || listener);
          }
        } else if (typeof list !== 'function') {
          position = -1;

          for (i = list.length; i-- > 0;) {
            if (list[i] === listener ||
                (list[i].listener && list[i].listener === listener)) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }

          if (position < 0)
            return this;

          if (list.length === 1) {
            list[0] = undefined;
            if (--this._eventsCount === 0) {
              this._events = new EventHandlers();
              return this;
            } else {
              delete events[type];
            }
          } else {
            spliceOne(list, position);
          }

          if (events.removeListener)
            this.emit('removeListener', type, originalListener || listener);
        }

        return this;
      };
      
  // Alias for removeListener added in NodeJS 10.0
  // https://nodejs.org/api/events.html#events_emitter_off_eventname_listener
  EventEmitter.prototype.off = function(type, listener){
      return this.removeListener(type, listener);
  };

  EventEmitter.prototype.removeAllListeners =
      function removeAllListeners(type) {
        var listeners, events;

        events = this._events;
        if (!events)
          return this;

        // not listening for removeListener, no need to emit
        if (!events.removeListener) {
          if (arguments.length === 0) {
            this._events = new EventHandlers();
            this._eventsCount = 0;
          } else if (events[type]) {
            if (--this._eventsCount === 0)
              this._events = new EventHandlers();
            else
              delete events[type];
          }
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(events);
          for (var i = 0, key; i < keys.length; ++i) {
            key = keys[i];
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = new EventHandlers();
          this._eventsCount = 0;
          return this;
        }

        listeners = events[type];

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners);
        } else if (listeners) {
          // LIFO order
          do {
            this.removeListener(type, listeners[listeners.length - 1]);
          } while (listeners[0]);
        }

        return this;
      };

  EventEmitter.prototype.listeners = function listeners(type) {
    var evlistener;
    var ret;
    var events = this._events;

    if (!events)
      ret = [];
    else {
      evlistener = events[type];
      if (!evlistener)
        ret = [];
      else if (typeof evlistener === 'function')
        ret = [evlistener.listener || evlistener];
      else
        ret = unwrapListeners(evlistener);
    }

    return ret;
  };

  EventEmitter.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
      return emitter.listenerCount(type);
    } else {
      return listenerCount$1.call(emitter, type);
    }
  };

  EventEmitter.prototype.listenerCount = listenerCount$1;
  function listenerCount$1(type) {
    var events = this._events;

    if (events) {
      var evlistener = events[type];

      if (typeof evlistener === 'function') {
        return 1;
      } else if (evlistener) {
        return evlistener.length;
      }
    }

    return 0;
  }

  EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
  };

  // About 1.5x faster than the two-arg version of Array#splice().
  function spliceOne(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
      list[i] = list[k];
    list.pop();
  }

  function arrayClone(arr, i) {
    var copy = new Array(i);
    while (i--)
      copy[i] = arr[i];
    return copy;
  }

  function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
      ret[i] = arr[i].listener || arr[i];
    }
    return ret;
  }

  var global$1 = (typeof global !== "undefined" ? global :
    typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window : {});

  var lookup = [];
  var revLookup = [];
  var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
  var inited = false;
  function init () {
    inited = true;
    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }

    revLookup['-'.charCodeAt(0)] = 62;
    revLookup['_'.charCodeAt(0)] = 63;
  }

  function toByteArray (b64) {
    if (!inited) {
      init();
    }
    var i, j, l, tmp, placeHolders, arr;
    var len = b64.length;

    if (len % 4 > 0) {
      throw new Error('Invalid string. Length must be a multiple of 4')
    }

    // the number of equal signs (place holders)
    // if there are two placeholders, than the two characters before it
    // represent one byte
    // if there is only one, then the three characters before it represent 2 bytes
    // this is just a cheap hack to not do indexOf twice
    placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

    // base64 is 4/3 + up to two characters of the original data
    arr = new Arr(len * 3 / 4 - placeHolders);

    // if there are placeholders, only get up to the last complete 4 chars
    l = placeHolders > 0 ? len - 4 : len;

    var L = 0;

    for (i = 0, j = 0; i < l; i += 4, j += 3) {
      tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
      arr[L++] = (tmp >> 16) & 0xFF;
      arr[L++] = (tmp >> 8) & 0xFF;
      arr[L++] = tmp & 0xFF;
    }

    if (placeHolders === 2) {
      tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
      arr[L++] = tmp & 0xFF;
    } else if (placeHolders === 1) {
      tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
      arr[L++] = (tmp >> 8) & 0xFF;
      arr[L++] = tmp & 0xFF;
    }

    return arr
  }

  function tripletToBase64 (num) {
    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
  }

  function encodeChunk (uint8, start, end) {
    var tmp;
    var output = [];
    for (var i = start; i < end; i += 3) {
      tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
      output.push(tripletToBase64(tmp));
    }
    return output.join('')
  }

  function fromByteArray (uint8) {
    if (!inited) {
      init();
    }
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
    var output = '';
    var parts = [];
    var maxChunkLength = 16383; // must be multiple of 3

    // go through the array every three bytes, we'll deal with trailing stuff later
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
    }

    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      output += lookup[tmp >> 2];
      output += lookup[(tmp << 4) & 0x3F];
      output += '==';
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
      output += lookup[tmp >> 10];
      output += lookup[(tmp >> 4) & 0x3F];
      output += lookup[(tmp << 2) & 0x3F];
      output += '=';
    }

    parts.push(output);

    return parts.join('')
  }

  function read (buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? (nBytes - 1) : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];

    i += d;

    e = s & ((1 << (-nBits)) - 1);
    s >>= (-nBits);
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity)
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
  }

  function write (buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
    var i = isLE ? 0 : (nBytes - 1);
    var d = isLE ? 1 : -1;
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

    value = Math.abs(value);

    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }

      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

    buffer[offset + i - d] |= s * 128;
  }

  var toString = {}.toString;

  var isArray$1 = Array.isArray || function (arr) {
    return toString.call(arr) == '[object Array]';
  };

  /*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
   * @license  MIT
   */

  var INSPECT_MAX_BYTES = 50;

  /**
   * If `Buffer.TYPED_ARRAY_SUPPORT`:
   *   === true    Use Uint8Array implementation (fastest)
   *   === false   Use Object implementation (most compatible, even IE6)
   *
   * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
   * Opera 11.6+, iOS 4.2+.
   *
   * Due to various browser bugs, sometimes the Object implementation will be used even
   * when the browser supports typed arrays.
   *
   * Note:
   *
   *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
   *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
   *
   *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
   *
   *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
   *     incorrect length in some situations.

   * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
   * get the Object implementation, which is slower but behaves correctly.
   */
  Buffer$1.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
    ? global$1.TYPED_ARRAY_SUPPORT
    : true;

  /*
   * Export kMaxLength after typed array support is determined.
   */
  kMaxLength();

  function kMaxLength () {
    return Buffer$1.TYPED_ARRAY_SUPPORT
      ? 0x7fffffff
      : 0x3fffffff
  }

  function createBuffer (that, length) {
    if (kMaxLength() < length) {
      throw new RangeError('Invalid typed array length')
    }
    if (Buffer$1.TYPED_ARRAY_SUPPORT) {
      // Return an augmented `Uint8Array` instance, for best performance
      that = new Uint8Array(length);
      that.__proto__ = Buffer$1.prototype;
    } else {
      // Fallback: Return an object instance of the Buffer class
      if (that === null) {
        that = new Buffer$1(length);
      }
      that.length = length;
    }

    return that
  }

  /**
   * The Buffer constructor returns instances of `Uint8Array` that have their
   * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
   * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
   * and the `Uint8Array` methods. Square bracket notation works as expected -- it
   * returns a single octet.
   *
   * The `Uint8Array` prototype remains unmodified.
   */

  function Buffer$1 (arg, encodingOrOffset, length) {
    if (!Buffer$1.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer$1)) {
      return new Buffer$1(arg, encodingOrOffset, length)
    }

    // Common case.
    if (typeof arg === 'number') {
      if (typeof encodingOrOffset === 'string') {
        throw new Error(
          'If encoding is specified then the first argument must be a string'
        )
      }
      return allocUnsafe(this, arg)
    }
    return from(this, arg, encodingOrOffset, length)
  }

  Buffer$1.poolSize = 8192; // not used by this implementation

  // TODO: Legacy, not needed anymore. Remove in next major version.
  Buffer$1._augment = function (arr) {
    arr.__proto__ = Buffer$1.prototype;
    return arr
  };

  function from (that, value, encodingOrOffset, length) {
    if (typeof value === 'number') {
      throw new TypeError('"value" argument must not be a number')
    }

    if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
      return fromArrayBuffer(that, value, encodingOrOffset, length)
    }

    if (typeof value === 'string') {
      return fromString(that, value, encodingOrOffset)
    }

    return fromObject(that, value)
  }

  /**
   * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
   * if value is a number.
   * Buffer.from(str[, encoding])
   * Buffer.from(array)
   * Buffer.from(buffer)
   * Buffer.from(arrayBuffer[, byteOffset[, length]])
   **/
  Buffer$1.from = function (value, encodingOrOffset, length) {
    return from(null, value, encodingOrOffset, length)
  };

  if (Buffer$1.TYPED_ARRAY_SUPPORT) {
    Buffer$1.prototype.__proto__ = Uint8Array.prototype;
    Buffer$1.__proto__ = Uint8Array;
    if (typeof Symbol !== 'undefined' && Symbol.species &&
        Buffer$1[Symbol.species] === Buffer$1) ;
  }

  function assertSize (size) {
    if (typeof size !== 'number') {
      throw new TypeError('"size" argument must be a number')
    } else if (size < 0) {
      throw new RangeError('"size" argument must not be negative')
    }
  }

  function alloc (that, size, fill, encoding) {
    assertSize(size);
    if (size <= 0) {
      return createBuffer(that, size)
    }
    if (fill !== undefined) {
      // Only pay attention to encoding if it's a string. This
      // prevents accidentally sending in a number that would
      // be interpretted as a start offset.
      return typeof encoding === 'string'
        ? createBuffer(that, size).fill(fill, encoding)
        : createBuffer(that, size).fill(fill)
    }
    return createBuffer(that, size)
  }

  /**
   * Creates a new filled Buffer instance.
   * alloc(size[, fill[, encoding]])
   **/
  Buffer$1.alloc = function (size, fill, encoding) {
    return alloc(null, size, fill, encoding)
  };

  function allocUnsafe (that, size) {
    assertSize(size);
    that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
    if (!Buffer$1.TYPED_ARRAY_SUPPORT) {
      for (var i = 0; i < size; ++i) {
        that[i] = 0;
      }
    }
    return that
  }

  /**
   * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
   * */
  Buffer$1.allocUnsafe = function (size) {
    return allocUnsafe(null, size)
  };
  /**
   * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
   */
  Buffer$1.allocUnsafeSlow = function (size) {
    return allocUnsafe(null, size)
  };

  function fromString (that, string, encoding) {
    if (typeof encoding !== 'string' || encoding === '') {
      encoding = 'utf8';
    }

    if (!Buffer$1.isEncoding(encoding)) {
      throw new TypeError('"encoding" must be a valid string encoding')
    }

    var length = byteLength(string, encoding) | 0;
    that = createBuffer(that, length);

    var actual = that.write(string, encoding);

    if (actual !== length) {
      // Writing a hex string, for example, that contains invalid characters will
      // cause everything after the first invalid character to be ignored. (e.g.
      // 'abxxcd' will be treated as 'ab')
      that = that.slice(0, actual);
    }

    return that
  }

  function fromArrayLike (that, array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0;
    that = createBuffer(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that
  }

  function fromArrayBuffer (that, array, byteOffset, length) {
    array.byteLength; // this throws if `array` is not a valid ArrayBuffer

    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('\'offset\' is out of bounds')
    }

    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('\'length\' is out of bounds')
    }

    if (byteOffset === undefined && length === undefined) {
      array = new Uint8Array(array);
    } else if (length === undefined) {
      array = new Uint8Array(array, byteOffset);
    } else {
      array = new Uint8Array(array, byteOffset, length);
    }

    if (Buffer$1.TYPED_ARRAY_SUPPORT) {
      // Return an augmented `Uint8Array` instance, for best performance
      that = array;
      that.__proto__ = Buffer$1.prototype;
    } else {
      // Fallback: Return an object instance of the Buffer class
      that = fromArrayLike(that, array);
    }
    return that
  }

  function fromObject (that, obj) {
    if (internalIsBuffer(obj)) {
      var len = checked(obj.length) | 0;
      that = createBuffer(that, len);

      if (that.length === 0) {
        return that
      }

      obj.copy(that, 0, 0, len);
      return that
    }

    if (obj) {
      if ((typeof ArrayBuffer !== 'undefined' &&
          obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
        if (typeof obj.length !== 'number' || isnan(obj.length)) {
          return createBuffer(that, 0)
        }
        return fromArrayLike(that, obj)
      }

      if (obj.type === 'Buffer' && isArray$1(obj.data)) {
        return fromArrayLike(that, obj.data)
      }
    }

    throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
  }

  function checked (length) {
    // Note: cannot use `length < kMaxLength()` here because that fails when
    // length is NaN (which is otherwise coerced to zero.)
    if (length >= kMaxLength()) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                           'size: 0x' + kMaxLength().toString(16) + ' bytes')
    }
    return length | 0
  }
  Buffer$1.isBuffer = isBuffer;
  function internalIsBuffer (b) {
    return !!(b != null && b._isBuffer)
  }

  Buffer$1.compare = function compare (a, b) {
    if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
      throw new TypeError('Arguments must be Buffers')
    }

    if (a === b) return 0

    var x = a.length;
    var y = b.length;

    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break
      }
    }

    if (x < y) return -1
    if (y < x) return 1
    return 0
  };

  Buffer$1.isEncoding = function isEncoding (encoding) {
    switch (String(encoding).toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'latin1':
      case 'binary':
      case 'base64':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return true
      default:
        return false
    }
  };

  Buffer$1.concat = function concat (list, length) {
    if (!isArray$1(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }

    if (list.length === 0) {
      return Buffer$1.alloc(0)
    }

    var i;
    if (length === undefined) {
      length = 0;
      for (i = 0; i < list.length; ++i) {
        length += list[i].length;
      }
    }

    var buffer = Buffer$1.allocUnsafe(length);
    var pos = 0;
    for (i = 0; i < list.length; ++i) {
      var buf = list[i];
      if (!internalIsBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }
      buf.copy(buffer, pos);
      pos += buf.length;
    }
    return buffer
  };

  function byteLength (string, encoding) {
    if (internalIsBuffer(string)) {
      return string.length
    }
    if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
        (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
      return string.byteLength
    }
    if (typeof string !== 'string') {
      string = '' + string;
    }

    var len = string.length;
    if (len === 0) return 0

    // Use a for loop to avoid recursion
    var loweredCase = false;
    for (;;) {
      switch (encoding) {
        case 'ascii':
        case 'latin1':
        case 'binary':
          return len
        case 'utf8':
        case 'utf-8':
        case undefined:
          return utf8ToBytes(string).length
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return len * 2
        case 'hex':
          return len >>> 1
        case 'base64':
          return base64ToBytes(string).length
        default:
          if (loweredCase) return utf8ToBytes(string).length // assume utf8
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer$1.byteLength = byteLength;

  function slowToString (encoding, start, end) {
    var loweredCase = false;

    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
    // property of a typed array.

    // This behaves neither like String nor Uint8Array in that we set start/end
    // to their upper/lower bounds if the value passed is out of range.
    // undefined is handled specially as per ECMA-262 6th Edition,
    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
    if (start === undefined || start < 0) {
      start = 0;
    }
    // Return early if start > this.length. Done here to prevent potential uint32
    // coercion fail below.
    if (start > this.length) {
      return ''
    }

    if (end === undefined || end > this.length) {
      end = this.length;
    }

    if (end <= 0) {
      return ''
    }

    // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
    end >>>= 0;
    start >>>= 0;

    if (end <= start) {
      return ''
    }

    if (!encoding) encoding = 'utf8';

    while (true) {
      switch (encoding) {
        case 'hex':
          return hexSlice(this, start, end)

        case 'utf8':
        case 'utf-8':
          return utf8Slice(this, start, end)

        case 'ascii':
          return asciiSlice(this, start, end)

        case 'latin1':
        case 'binary':
          return latin1Slice(this, start, end)

        case 'base64':
          return base64Slice(this, start, end)

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return utf16leSlice(this, start, end)

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = (encoding + '').toLowerCase();
          loweredCase = true;
      }
    }
  }

  // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
  // Buffer instances.
  Buffer$1.prototype._isBuffer = true;

  function swap (b, n, m) {
    var i = b[n];
    b[n] = b[m];
    b[m] = i;
  }

  Buffer$1.prototype.swap16 = function swap16 () {
    var len = this.length;
    if (len % 2 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 16-bits')
    }
    for (var i = 0; i < len; i += 2) {
      swap(this, i, i + 1);
    }
    return this
  };

  Buffer$1.prototype.swap32 = function swap32 () {
    var len = this.length;
    if (len % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 32-bits')
    }
    for (var i = 0; i < len; i += 4) {
      swap(this, i, i + 3);
      swap(this, i + 1, i + 2);
    }
    return this
  };

  Buffer$1.prototype.swap64 = function swap64 () {
    var len = this.length;
    if (len % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 64-bits')
    }
    for (var i = 0; i < len; i += 8) {
      swap(this, i, i + 7);
      swap(this, i + 1, i + 6);
      swap(this, i + 2, i + 5);
      swap(this, i + 3, i + 4);
    }
    return this
  };

  Buffer$1.prototype.toString = function toString () {
    var length = this.length | 0;
    if (length === 0) return ''
    if (arguments.length === 0) return utf8Slice(this, 0, length)
    return slowToString.apply(this, arguments)
  };

  Buffer$1.prototype.equals = function equals (b) {
    if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
    if (this === b) return true
    return Buffer$1.compare(this, b) === 0
  };

  Buffer$1.prototype.inspect = function inspect () {
    var str = '';
    var max = INSPECT_MAX_BYTES;
    if (this.length > 0) {
      str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
      if (this.length > max) str += ' ... ';
    }
    return '<Buffer ' + str + '>'
  };

  Buffer$1.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
    if (!internalIsBuffer(target)) {
      throw new TypeError('Argument must be a Buffer')
    }

    if (start === undefined) {
      start = 0;
    }
    if (end === undefined) {
      end = target ? target.length : 0;
    }
    if (thisStart === undefined) {
      thisStart = 0;
    }
    if (thisEnd === undefined) {
      thisEnd = this.length;
    }

    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
      throw new RangeError('out of range index')
    }

    if (thisStart >= thisEnd && start >= end) {
      return 0
    }
    if (thisStart >= thisEnd) {
      return -1
    }
    if (start >= end) {
      return 1
    }

    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;

    if (this === target) return 0

    var x = thisEnd - thisStart;
    var y = end - start;
    var len = Math.min(x, y);

    var thisCopy = this.slice(thisStart, thisEnd);
    var targetCopy = target.slice(start, end);

    for (var i = 0; i < len; ++i) {
      if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i];
        y = targetCopy[i];
        break
      }
    }

    if (x < y) return -1
    if (y < x) return 1
    return 0
  };

  // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
  // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
  //
  // Arguments:
  // - buffer - a Buffer to search
  // - val - a string, Buffer, or number
  // - byteOffset - an index into `buffer`; will be clamped to an int32
  // - encoding - an optional encoding, relevant is val is a string
  // - dir - true for indexOf, false for lastIndexOf
  function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
    // Empty buffer means no match
    if (buffer.length === 0) return -1

    // Normalize byteOffset
    if (typeof byteOffset === 'string') {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 0x7fffffff) {
      byteOffset = 0x7fffffff;
    } else if (byteOffset < -0x80000000) {
      byteOffset = -0x80000000;
    }
    byteOffset = +byteOffset;  // Coerce to Number.
    if (isNaN(byteOffset)) {
      // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
      byteOffset = dir ? 0 : (buffer.length - 1);
    }

    // Normalize byteOffset: negative offsets start from the end of the buffer
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
      if (dir) return -1
      else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
      if (dir) byteOffset = 0;
      else return -1
    }

    // Normalize val
    if (typeof val === 'string') {
      val = Buffer$1.from(val, encoding);
    }

    // Finally, search either indexOf (if dir is true) or lastIndexOf
    if (internalIsBuffer(val)) {
      // Special case: looking for empty string/buffer always fails
      if (val.length === 0) {
        return -1
      }
      return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
    } else if (typeof val === 'number') {
      val = val & 0xFF; // Search for a byte value [0-255]
      if (Buffer$1.TYPED_ARRAY_SUPPORT &&
          typeof Uint8Array.prototype.indexOf === 'function') {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
        }
      }
      return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
    }

    throw new TypeError('val must be string, number or Buffer')
  }

  function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;

    if (encoding !== undefined) {
      encoding = String(encoding).toLowerCase();
      if (encoding === 'ucs2' || encoding === 'ucs-2' ||
          encoding === 'utf16le' || encoding === 'utf-16le') {
        if (arr.length < 2 || val.length < 2) {
          return -1
        }
        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }

    function read (buf, i) {
      if (indexSize === 1) {
        return buf[i]
      } else {
        return buf.readUInt16BE(i * indexSize)
      }
    }

    var i;
    if (dir) {
      var foundIndex = -1;
      for (i = byteOffset; i < arrLength; i++) {
        if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1) foundIndex = i;
          if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
        } else {
          if (foundIndex !== -1) i -= i - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
      for (i = byteOffset; i >= 0; i--) {
        var found = true;
        for (var j = 0; j < valLength; j++) {
          if (read(arr, i + j) !== read(val, j)) {
            found = false;
            break
          }
        }
        if (found) return i
      }
    }

    return -1
  }

  Buffer$1.prototype.includes = function includes (val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1
  };

  Buffer$1.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
  };

  Buffer$1.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
  };

  function hexWrite (buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }

    // must be an even number of digits
    var strLen = string.length;
    if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

    if (length > strLen / 2) {
      length = strLen / 2;
    }
    for (var i = 0; i < length; ++i) {
      var parsed = parseInt(string.substr(i * 2, 2), 16);
      if (isNaN(parsed)) return i
      buf[offset + i] = parsed;
    }
    return i
  }

  function utf8Write (buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  }

  function asciiWrite (buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length)
  }

  function latin1Write (buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length)
  }

  function base64Write (buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length)
  }

  function ucs2Write (buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
  }

  Buffer$1.prototype.write = function write (string, offset, length, encoding) {
    // Buffer#write(string)
    if (offset === undefined) {
      encoding = 'utf8';
      length = this.length;
      offset = 0;
    // Buffer#write(string, encoding)
    } else if (length === undefined && typeof offset === 'string') {
      encoding = offset;
      length = this.length;
      offset = 0;
    // Buffer#write(string, offset[, length][, encoding])
    } else if (isFinite(offset)) {
      offset = offset | 0;
      if (isFinite(length)) {
        length = length | 0;
        if (encoding === undefined) encoding = 'utf8';
      } else {
        encoding = length;
        length = undefined;
      }
    // legacy write(string, encoding, offset, length) - remove in v0.13
    } else {
      throw new Error(
        'Buffer.write(string, encoding, offset[, length]) is no longer supported'
      )
    }

    var remaining = this.length - offset;
    if (length === undefined || length > remaining) length = remaining;

    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
      throw new RangeError('Attempt to write outside buffer bounds')
    }

    if (!encoding) encoding = 'utf8';

    var loweredCase = false;
    for (;;) {
      switch (encoding) {
        case 'hex':
          return hexWrite(this, string, offset, length)

        case 'utf8':
        case 'utf-8':
          return utf8Write(this, string, offset, length)

        case 'ascii':
          return asciiWrite(this, string, offset, length)

        case 'latin1':
        case 'binary':
          return latin1Write(this, string, offset, length)

        case 'base64':
          // Warning: maxLength not taken into account in base64Write
          return base64Write(this, string, offset, length)

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return ucs2Write(this, string, offset, length)

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };

  Buffer$1.prototype.toJSON = function toJSON () {
    return {
      type: 'Buffer',
      data: Array.prototype.slice.call(this._arr || this, 0)
    }
  };

  function base64Slice (buf, start, end) {
    if (start === 0 && end === buf.length) {
      return fromByteArray(buf)
    } else {
      return fromByteArray(buf.slice(start, end))
    }
  }

  function utf8Slice (buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];

    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = (firstByte > 0xEF) ? 4
        : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
        : 1;

      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint;

        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte;
            }
            break
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint;
              }
            }
            break
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint;
              }
            }
            break
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint;
              }
            }
        }
      }

      if (codePoint === null) {
        // we did not generate a valid codePoint so insert a
        // replacement char (U+FFFD) and advance only 1 byte
        codePoint = 0xFFFD;
        bytesPerSequence = 1;
      } else if (codePoint > 0xFFFF) {
        // encode to utf16 (surrogate pair dance)
        codePoint -= 0x10000;
        res.push(codePoint >>> 10 & 0x3FF | 0xD800);
        codePoint = 0xDC00 | codePoint & 0x3FF;
      }

      res.push(codePoint);
      i += bytesPerSequence;
    }

    return decodeCodePointsArray(res)
  }

  // Based on http://stackoverflow.com/a/22747272/680742, the browser with
  // the lowest limit is Chrome, with 0x10000 args.
  // We go 1 magnitude less, for safety
  var MAX_ARGUMENTS_LENGTH = 0x1000;

  function decodeCodePointsArray (codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
    }

    // Decode in chunks to avoid "call stack size exceeded".
    var res = '';
    var i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
      );
    }
    return res
  }

  function asciiSlice (buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 0x7F);
    }
    return ret
  }

  function latin1Slice (buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret
  }

  function hexSlice (buf, start, end) {
    var len = buf.length;

    if (!start || start < 0) start = 0;
    if (!end || end < 0 || end > len) end = len;

    var out = '';
    for (var i = start; i < end; ++i) {
      out += toHex(buf[i]);
    }
    return out
  }

  function utf16leSlice (buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = '';
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res
  }

  Buffer$1.prototype.slice = function slice (start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;

    if (start < 0) {
      start += len;
      if (start < 0) start = 0;
    } else if (start > len) {
      start = len;
    }

    if (end < 0) {
      end += len;
      if (end < 0) end = 0;
    } else if (end > len) {
      end = len;
    }

    if (end < start) end = start;

    var newBuf;
    if (Buffer$1.TYPED_ARRAY_SUPPORT) {
      newBuf = this.subarray(start, end);
      newBuf.__proto__ = Buffer$1.prototype;
    } else {
      var sliceLen = end - start;
      newBuf = new Buffer$1(sliceLen, undefined);
      for (var i = 0; i < sliceLen; ++i) {
        newBuf[i] = this[i + start];
      }
    }

    return newBuf
  };

  /*
   * Need to make sure that buffer isn't trying to write out of bounds.
   */
  function checkOffset (offset, ext, length) {
    if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
    if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
  }

  Buffer$1.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }

    return val
  };

  Buffer$1.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      checkOffset(offset, byteLength, this.length);
    }

    var val = this[offset + --byteLength];
    var mul = 1;
    while (byteLength > 0 && (mul *= 0x100)) {
      val += this[offset + --byteLength] * mul;
    }

    return val
  };

  Buffer$1.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 1, this.length);
    return this[offset]
  };

  Buffer$1.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    return this[offset] | (this[offset + 1] << 8)
  };

  Buffer$1.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    return (this[offset] << 8) | this[offset + 1]
  };

  Buffer$1.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return ((this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16)) +
        (this[offset + 3] * 0x1000000)
  };

  Buffer$1.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
  };

  Buffer$1.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }
    mul *= 0x80;

    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

    return val
  };

  Buffer$1.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var i = byteLength;
    var mul = 1;
    var val = this[offset + --i];
    while (i > 0 && (mul *= 0x100)) {
      val += this[offset + --i] * mul;
    }
    mul *= 0x80;

    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

    return val
  };

  Buffer$1.prototype.readInt8 = function readInt8 (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80)) return (this[offset])
    return ((0xff - this[offset] + 1) * -1)
  };

  Buffer$1.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset] | (this[offset + 1] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  };

  Buffer$1.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | (this[offset] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  };

  Buffer$1.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
  };

  Buffer$1.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
  };

  Buffer$1.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);
    return read(this, offset, true, 23, 4)
  };

  Buffer$1.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);
    return read(this, offset, false, 23, 4)
  };

  Buffer$1.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 8, this.length);
    return read(this, offset, true, 52, 8)
  };

  Buffer$1.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 8, this.length);
    return read(this, offset, false, 52, 8)
  };

  function checkInt (buf, value, offset, ext, max, min) {
    if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
  }

  Buffer$1.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var mul = 1;
    var i = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }

    return offset + byteLength
  };

  Buffer$1.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var i = byteLength - 1;
    var mul = 1;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }

    return offset + byteLength
  };

  Buffer$1.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
    if (!Buffer$1.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    this[offset] = (value & 0xff);
    return offset + 1
  };

  function objectWriteUInt16 (buf, value, offset, littleEndian) {
    if (value < 0) value = 0xffff + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
      buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
        (littleEndian ? i : 1 - i) * 8;
    }
  }

  Buffer$1.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer$1.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2
  };

  Buffer$1.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer$1.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2
  };

  function objectWriteUInt32 (buf, value, offset, littleEndian) {
    if (value < 0) value = 0xffffffff + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
      buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
    }
  }

  Buffer$1.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer$1.TYPED_ARRAY_SUPPORT) {
      this[offset + 3] = (value >>> 24);
      this[offset + 2] = (value >>> 16);
      this[offset + 1] = (value >>> 8);
      this[offset] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4
  };

  Buffer$1.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer$1.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4
  };

  Buffer$1.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);

      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = 0;
    var mul = 1;
    var sub = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }

    return offset + byteLength
  };

  Buffer$1.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);

      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = byteLength - 1;
    var mul = 1;
    var sub = 0;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }

    return offset + byteLength
  };

  Buffer$1.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
    if (!Buffer$1.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    if (value < 0) value = 0xff + value + 1;
    this[offset] = (value & 0xff);
    return offset + 1
  };

  Buffer$1.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer$1.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2
  };

  Buffer$1.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer$1.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2
  };

  Buffer$1.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (Buffer$1.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
      this[offset + 2] = (value >>> 16);
      this[offset + 3] = (value >>> 24);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4
  };

  Buffer$1.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (value < 0) value = 0xffffffff + value + 1;
    if (Buffer$1.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4
  };

  function checkIEEE754 (buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
    if (offset < 0) throw new RangeError('Index out of range')
  }

  function writeFloat (buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4);
    }
    write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4
  }

  Buffer$1.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert)
  };

  Buffer$1.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert)
  };

  function writeDouble (buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8);
    }
    write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8
  }

  Buffer$1.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert)
  };

  Buffer$1.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert)
  };

  // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
  Buffer$1.prototype.copy = function copy (target, targetStart, start, end) {
    if (!start) start = 0;
    if (!end && end !== 0) end = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end > 0 && end < start) end = start;

    // Copy 0 bytes; we're done
    if (end === start) return 0
    if (target.length === 0 || this.length === 0) return 0

    // Fatal error conditions
    if (targetStart < 0) {
      throw new RangeError('targetStart out of bounds')
    }
    if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
    if (end < 0) throw new RangeError('sourceEnd out of bounds')

    // Are we oob?
    if (end > this.length) end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }

    var len = end - start;
    var i;

    if (this === target && start < targetStart && targetStart < end) {
      // descending copy from end
      for (i = len - 1; i >= 0; --i) {
        target[i + targetStart] = this[i + start];
      }
    } else if (len < 1000 || !Buffer$1.TYPED_ARRAY_SUPPORT) {
      // ascending copy from start
      for (i = 0; i < len; ++i) {
        target[i + targetStart] = this[i + start];
      }
    } else {
      Uint8Array.prototype.set.call(
        target,
        this.subarray(start, start + len),
        targetStart
      );
    }

    return len
  };

  // Usage:
  //    buffer.fill(number[, offset[, end]])
  //    buffer.fill(buffer[, offset[, end]])
  //    buffer.fill(string[, offset[, end]][, encoding])
  Buffer$1.prototype.fill = function fill (val, start, end, encoding) {
    // Handle string cases:
    if (typeof val === 'string') {
      if (typeof start === 'string') {
        encoding = start;
        start = 0;
        end = this.length;
      } else if (typeof end === 'string') {
        encoding = end;
        end = this.length;
      }
      if (val.length === 1) {
        var code = val.charCodeAt(0);
        if (code < 256) {
          val = code;
        }
      }
      if (encoding !== undefined && typeof encoding !== 'string') {
        throw new TypeError('encoding must be a string')
      }
      if (typeof encoding === 'string' && !Buffer$1.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding)
      }
    } else if (typeof val === 'number') {
      val = val & 255;
    }

    // Invalid ranges are not set to a default, so can range check early.
    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError('Out of range index')
    }

    if (end <= start) {
      return this
    }

    start = start >>> 0;
    end = end === undefined ? this.length : end >>> 0;

    if (!val) val = 0;

    var i;
    if (typeof val === 'number') {
      for (i = start; i < end; ++i) {
        this[i] = val;
      }
    } else {
      var bytes = internalIsBuffer(val)
        ? val
        : utf8ToBytes(new Buffer$1(val, encoding).toString());
      var len = bytes.length;
      for (i = 0; i < end - start; ++i) {
        this[i + start] = bytes[i % len];
      }
    }

    return this
  };

  // HELPER FUNCTIONS
  // ================

  var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

  function base64clean (str) {
    // Node strips out invalid characters like \n and \t from the string, base64-js does not
    str = stringtrim(str).replace(INVALID_BASE64_RE, '');
    // Node converts strings with length < 2 to ''
    if (str.length < 2) return ''
    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
    while (str.length % 4 !== 0) {
      str = str + '=';
    }
    return str
  }

  function stringtrim (str) {
    if (str.trim) return str.trim()
    return str.replace(/^\s+|\s+$/g, '')
  }

  function toHex (n) {
    if (n < 16) return '0' + n.toString(16)
    return n.toString(16)
  }

  function utf8ToBytes (string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];

    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i);

      // is surrogate component
      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        // last char was a lead
        if (!leadSurrogate) {
          // no lead yet
          if (codePoint > 0xDBFF) {
            // unexpected trail
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue
          } else if (i + 1 === length) {
            // unpaired lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue
          }

          // valid lead
          leadSurrogate = codePoint;

          continue
        }

        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          leadSurrogate = codePoint;
          continue
        }

        // valid surrogate pair
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
      } else if (leadSurrogate) {
        // valid bmp char, but last char was a lead
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
      }

      leadSurrogate = null;

      // encode utf8
      if (codePoint < 0x80) {
        if ((units -= 1) < 0) break
        bytes.push(codePoint);
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0) break
        bytes.push(
          codePoint >> 0x6 | 0xC0,
          codePoint & 0x3F | 0x80
        );
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0) break
        bytes.push(
          codePoint >> 0xC | 0xE0,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        );
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0) break
        bytes.push(
          codePoint >> 0x12 | 0xF0,
          codePoint >> 0xC & 0x3F | 0x80,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        );
      } else {
        throw new Error('Invalid code point')
      }
    }

    return bytes
  }

  function asciiToBytes (str) {
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      // Node's code seems to be doing this and not & 0x7F..
      byteArray.push(str.charCodeAt(i) & 0xFF);
    }
    return byteArray
  }

  function utf16leToBytes (str, units) {
    var c, hi, lo;
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0) break

      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }

    return byteArray
  }


  function base64ToBytes (str) {
    return toByteArray(base64clean(str))
  }

  function blitBuffer (src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
      if ((i + offset >= dst.length) || (i >= src.length)) break
      dst[i + offset] = src[i];
    }
    return i
  }

  function isnan (val) {
    return val !== val // eslint-disable-line no-self-compare
  }


  // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
  // The _isBuffer check is for Safari 5-7 support, because it's missing
  // Object.prototype.constructor. Remove this eventually
  function isBuffer(obj) {
    return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
  }

  function isFastBuffer (obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  }

  // For Node v0.10 support. Remove this eventually.
  function isSlowBuffer (obj) {
    return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
  }

  // shim for using process in browser
  // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

  function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
  }
  function defaultClearTimeout () {
      throw new Error('clearTimeout has not been defined');
  }
  var cachedSetTimeout = defaultSetTimout;
  var cachedClearTimeout = defaultClearTimeout;
  if (typeof global$1.setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
  }
  if (typeof global$1.clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
  }

  function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
      } catch(e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
              return cachedSetTimeout.call(null, fun, 0);
          } catch(e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
              return cachedSetTimeout.call(this, fun, 0);
          }
      }


  }
  function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
      } catch (e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
              return cachedClearTimeout.call(null, marker);
          } catch (e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
              // Some versions of I.E. have different rules for clearTimeout vs setTimeout
              return cachedClearTimeout.call(this, marker);
          }
      }



  }
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;

  function cleanUpNextTick() {
      if (!draining || !currentQueue) {
          return;
      }
      draining = false;
      if (currentQueue.length) {
          queue = currentQueue.concat(queue);
      } else {
          queueIndex = -1;
      }
      if (queue.length) {
          drainQueue();
      }
  }

  function drainQueue() {
      if (draining) {
          return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;

      var len = queue.length;
      while(len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
              if (currentQueue) {
                  currentQueue[queueIndex].run();
              }
          }
          queueIndex = -1;
          len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
  }
  function nextTick(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
          }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
      }
  }
  // v8 likes predictible objects
  function Item(fun, array) {
      this.fun = fun;
      this.array = array;
  }
  Item.prototype.run = function () {
      this.fun.apply(null, this.array);
  };
  var title = 'browser';
  var platform = 'browser';
  var browser = true;
  var env = {};
  var argv = [];
  var version = ''; // empty string to avoid regexp issues
  var versions = {};
  var release = {};
  var config = {};

  function noop() {}

  var on = noop;
  var addListener = noop;
  var once = noop;
  var off = noop;
  var removeListener = noop;
  var removeAllListeners = noop;
  var emit = noop;

  function binding(name) {
      throw new Error('process.binding is not supported');
  }

  function cwd () { return '/' }
  function chdir (dir) {
      throw new Error('process.chdir is not supported');
  }function umask() { return 0; }

  // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
  var performance = global$1.performance || {};
  var performanceNow =
    performance.now        ||
    performance.mozNow     ||
    performance.msNow      ||
    performance.oNow       ||
    performance.webkitNow  ||
    function(){ return (new Date()).getTime() };

  // generate timestamp or delta
  // see http://nodejs.org/api/process.html#process_process_hrtime
  function hrtime(previousTimestamp){
    var clocktime = performanceNow.call(performance)*1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor((clocktime%1)*1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds<0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds,nanoseconds]
  }

  var startTime = new Date();
  function uptime() {
    var currentTime = new Date();
    var dif = currentTime - startTime;
    return dif / 1000;
  }

  var browser$1 = {
    nextTick: nextTick,
    title: title,
    browser: browser,
    env: env,
    argv: argv,
    version: version,
    versions: versions,
    on: on,
    addListener: addListener,
    once: once,
    off: off,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    emit: emit,
    binding: binding,
    cwd: cwd,
    chdir: chdir,
    umask: umask,
    hrtime: hrtime,
    platform: platform,
    release: release,
    config: config,
    uptime: uptime
  };

  var inherits;
  if (typeof Object.create === 'function'){
    inherits = function inherits(ctor, superCtor) {
      // implementation from standard node.js 'util' module
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    };
  } else {
    inherits = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function () {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    };
  }
  var inherits$1 = inherits;

  var formatRegExp = /%[sdj%]/g;
  function format(f) {
    if (!isString(f)) {
      var objects = [];
      for (var i = 0; i < arguments.length; i++) {
        objects.push(inspect(arguments[i]));
      }
      return objects.join(' ');
    }

    var i = 1;
    var args = arguments;
    var len = args.length;
    var str = String(f).replace(formatRegExp, function(x) {
      if (x === '%%') return '%';
      if (i >= len) return x;
      switch (x) {
        case '%s': return String(args[i++]);
        case '%d': return Number(args[i++]);
        case '%j':
          try {
            return JSON.stringify(args[i++]);
          } catch (_) {
            return '[Circular]';
          }
        default:
          return x;
      }
    });
    for (var x = args[i]; i < len; x = args[++i]) {
      if (isNull(x) || !isObject$1(x)) {
        str += ' ' + x;
      } else {
        str += ' ' + inspect(x);
      }
    }
    return str;
  }

  // Mark that a method should not be used.
  // Returns a modified function which warns once by default.
  // If --no-deprecation is set, then it is a no-op.
  function deprecate(fn, msg) {
    // Allow for deprecating things in the process of starting up.
    if (isUndefined(global$1.process)) {
      return function() {
        return deprecate(fn, msg).apply(this, arguments);
      };
    }

    if (browser$1.noDeprecation === true) {
      return fn;
    }

    var warned = false;
    function deprecated() {
      if (!warned) {
        if (browser$1.throwDeprecation) {
          throw new Error(msg);
        } else if (browser$1.traceDeprecation) {
          console.trace(msg);
        } else {
          console.error(msg);
        }
        warned = true;
      }
      return fn.apply(this, arguments);
    }

    return deprecated;
  }

  var debugs = {};
  var debugEnviron;
  function debuglog(set) {
    if (isUndefined(debugEnviron))
      debugEnviron = browser$1.env.NODE_DEBUG || '';
    set = set.toUpperCase();
    if (!debugs[set]) {
      if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
        var pid = 0;
        debugs[set] = function() {
          var msg = format.apply(null, arguments);
          console.error('%s %d: %s', set, pid, msg);
        };
      } else {
        debugs[set] = function() {};
      }
    }
    return debugs[set];
  }

  /**
   * Echos the value of a value. Trys to print the value out
   * in the best way possible given the different types.
   *
   * @param {Object} obj The object to print out.
   * @param {Object} opts Optional options object that alters the output.
   */
  /* legacy: obj, showHidden, depth, colors*/
  function inspect(obj, opts) {
    // default options
    var ctx = {
      seen: [],
      stylize: stylizeNoColor
    };
    // legacy...
    if (arguments.length >= 3) ctx.depth = arguments[2];
    if (arguments.length >= 4) ctx.colors = arguments[3];
    if (isBoolean(opts)) {
      // legacy...
      ctx.showHidden = opts;
    } else if (opts) {
      // got an "options" object
      _extend(ctx, opts);
    }
    // set default options
    if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
    if (isUndefined(ctx.depth)) ctx.depth = 2;
    if (isUndefined(ctx.colors)) ctx.colors = false;
    if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
    if (ctx.colors) ctx.stylize = stylizeWithColor;
    return formatValue(ctx, obj, ctx.depth);
  }

  // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
  inspect.colors = {
    'bold' : [1, 22],
    'italic' : [3, 23],
    'underline' : [4, 24],
    'inverse' : [7, 27],
    'white' : [37, 39],
    'grey' : [90, 39],
    'black' : [30, 39],
    'blue' : [34, 39],
    'cyan' : [36, 39],
    'green' : [32, 39],
    'magenta' : [35, 39],
    'red' : [31, 39],
    'yellow' : [33, 39]
  };

  // Don't use 'blue' not visible on cmd.exe
  inspect.styles = {
    'special': 'cyan',
    'number': 'yellow',
    'boolean': 'yellow',
    'undefined': 'grey',
    'null': 'bold',
    'string': 'green',
    'date': 'magenta',
    // "name": intentionally not styling
    'regexp': 'red'
  };


  function stylizeWithColor(str, styleType) {
    var style = inspect.styles[styleType];

    if (style) {
      return '\u001b[' + inspect.colors[style][0] + 'm' + str +
             '\u001b[' + inspect.colors[style][1] + 'm';
    } else {
      return str;
    }
  }


  function stylizeNoColor(str, styleType) {
    return str;
  }


  function arrayToHash(array) {
    var hash = {};

    array.forEach(function(val, idx) {
      hash[val] = true;
    });

    return hash;
  }


  function formatValue(ctx, value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (ctx.customInspect &&
        value &&
        isFunction$1(value.inspect) &&
        // Filter out the util module, it's inspect function is special
        value.inspect !== inspect &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      var ret = value.inspect(recurseTimes, ctx);
      if (!isString(ret)) {
        ret = formatValue(ctx, ret, recurseTimes);
      }
      return ret;
    }

    // Primitive types cannot have properties
    var primitive = formatPrimitive(ctx, value);
    if (primitive) {
      return primitive;
    }

    // Look up the keys of the object.
    var keys = Object.keys(value);
    var visibleKeys = arrayToHash(keys);

    if (ctx.showHidden) {
      keys = Object.getOwnPropertyNames(value);
    }

    // IE doesn't make error fields non-enumerable
    // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
    if (isError(value)
        && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
      return formatError(value);
    }

    // Some type of object without properties can be shortcutted.
    if (keys.length === 0) {
      if (isFunction$1(value)) {
        var name = value.name ? ': ' + value.name : '';
        return ctx.stylize('[Function' + name + ']', 'special');
      }
      if (isRegExp(value)) {
        return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
      }
      if (isDate(value)) {
        return ctx.stylize(Date.prototype.toString.call(value), 'date');
      }
      if (isError(value)) {
        return formatError(value);
      }
    }

    var base = '', array = false, braces = ['{', '}'];

    // Make Array say that they are Array
    if (isArray(value)) {
      array = true;
      braces = ['[', ']'];
    }

    // Make functions say that they are functions
    if (isFunction$1(value)) {
      var n = value.name ? ': ' + value.name : '';
      base = ' [Function' + n + ']';
    }

    // Make RegExps say that they are RegExps
    if (isRegExp(value)) {
      base = ' ' + RegExp.prototype.toString.call(value);
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + Date.prototype.toUTCString.call(value);
    }

    // Make error with message first say the error
    if (isError(value)) {
      base = ' ' + formatError(value);
    }

    if (keys.length === 0 && (!array || value.length == 0)) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
      } else {
        return ctx.stylize('[Object]', 'special');
      }
    }

    ctx.seen.push(value);

    var output;
    if (array) {
      output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
    } else {
      output = keys.map(function(key) {
        return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
      });
    }

    ctx.seen.pop();

    return reduceToSingleString(output, base, braces);
  }


  function formatPrimitive(ctx, value) {
    if (isUndefined(value))
      return ctx.stylize('undefined', 'undefined');
    if (isString(value)) {
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                               .replace(/'/g, "\\'")
                                               .replace(/\\"/g, '"') + '\'';
      return ctx.stylize(simple, 'string');
    }
    if (isNumber(value))
      return ctx.stylize('' + value, 'number');
    if (isBoolean(value))
      return ctx.stylize('' + value, 'boolean');
    // For some reason typeof null is "object", so special case here.
    if (isNull(value))
      return ctx.stylize('null', 'null');
  }


  function formatError(value) {
    return '[' + Error.prototype.toString.call(value) + ']';
  }


  function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
    var output = [];
    for (var i = 0, l = value.length; i < l; ++i) {
      if (hasOwnProperty(value, String(i))) {
        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
            String(i), true));
      } else {
        output.push('');
      }
    }
    keys.forEach(function(key) {
      if (!key.match(/^\d+$/)) {
        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
            key, true));
      }
    });
    return output;
  }


  function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
    var name, str, desc;
    desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
    if (desc.get) {
      if (desc.set) {
        str = ctx.stylize('[Getter/Setter]', 'special');
      } else {
        str = ctx.stylize('[Getter]', 'special');
      }
    } else {
      if (desc.set) {
        str = ctx.stylize('[Setter]', 'special');
      }
    }
    if (!hasOwnProperty(visibleKeys, key)) {
      name = '[' + key + ']';
    }
    if (!str) {
      if (ctx.seen.indexOf(desc.value) < 0) {
        if (isNull(recurseTimes)) {
          str = formatValue(ctx, desc.value, null);
        } else {
          str = formatValue(ctx, desc.value, recurseTimes - 1);
        }
        if (str.indexOf('\n') > -1) {
          if (array) {
            str = str.split('\n').map(function(line) {
              return '  ' + line;
            }).join('\n').substr(2);
          } else {
            str = '\n' + str.split('\n').map(function(line) {
              return '   ' + line;
            }).join('\n');
          }
        }
      } else {
        str = ctx.stylize('[Circular]', 'special');
      }
    }
    if (isUndefined(name)) {
      if (array && key.match(/^\d+$/)) {
        return str;
      }
      name = JSON.stringify('' + key);
      if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
        name = name.substr(1, name.length - 2);
        name = ctx.stylize(name, 'name');
      } else {
        name = name.replace(/'/g, "\\'")
                   .replace(/\\"/g, '"')
                   .replace(/(^"|"$)/g, "'");
        name = ctx.stylize(name, 'string');
      }
    }

    return name + ': ' + str;
  }


  function reduceToSingleString(output, base, braces) {
    var length = output.reduce(function(prev, cur) {
      if (cur.indexOf('\n') >= 0) ;
      return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
    }, 0);

    if (length > 60) {
      return braces[0] +
             (base === '' ? '' : base + '\n ') +
             ' ' +
             output.join(',\n  ') +
             ' ' +
             braces[1];
    }

    return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
  }


  // NOTE: These type checking functions intentionally don't use `instanceof`
  // because it is fragile and can be easily faked with `Object.create()`.
  function isArray(ar) {
    return Array.isArray(ar);
  }

  function isBoolean(arg) {
    return typeof arg === 'boolean';
  }

  function isNull(arg) {
    return arg === null;
  }

  function isNumber(arg) {
    return typeof arg === 'number';
  }

  function isString(arg) {
    return typeof arg === 'string';
  }

  function isUndefined(arg) {
    return arg === void 0;
  }

  function isRegExp(re) {
    return isObject$1(re) && objectToString(re) === '[object RegExp]';
  }

  function isObject$1(arg) {
    return typeof arg === 'object' && arg !== null;
  }

  function isDate(d) {
    return isObject$1(d) && objectToString(d) === '[object Date]';
  }

  function isError(e) {
    return isObject$1(e) &&
        (objectToString(e) === '[object Error]' || e instanceof Error);
  }

  function isFunction$1(arg) {
    return typeof arg === 'function';
  }

  function objectToString(o) {
    return Object.prototype.toString.call(o);
  }

  function _extend(origin, add) {
    // Don't do anything if add isn't an object
    if (!add || !isObject$1(add)) return origin;

    var keys = Object.keys(add);
    var i = keys.length;
    while (i--) {
      origin[keys[i]] = add[keys[i]];
    }
    return origin;
  }
  function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  function BufferList() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function (v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function (v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function () {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function () {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function (s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function (n) {
    if (this.length === 0) return Buffer$1.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer$1.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      p.data.copy(ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

  var isBufferEncoding = Buffer$1.isEncoding
    || function(encoding) {
         switch (encoding && encoding.toLowerCase()) {
           case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
           default: return false;
         }
       };


  function assertEncoding(encoding) {
    if (encoding && !isBufferEncoding(encoding)) {
      throw new Error('Unknown encoding: ' + encoding);
    }
  }

  // StringDecoder provides an interface for efficiently splitting a series of
  // buffers into a series of JS strings without breaking apart multi-byte
  // characters. CESU-8 is handled as part of the UTF-8 encoding.
  //
  // @TODO Handling all encodings inside a single object makes it very difficult
  // to reason about this code, so it should be split up in the future.
  // @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
  // points as used by CESU-8.
  function StringDecoder(encoding) {
    this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
    assertEncoding(encoding);
    switch (this.encoding) {
      case 'utf8':
        // CESU-8 represents each of Surrogate Pair by 3-bytes
        this.surrogateSize = 3;
        break;
      case 'ucs2':
      case 'utf16le':
        // UTF-16 represents each of Surrogate Pair by 2-bytes
        this.surrogateSize = 2;
        this.detectIncompleteChar = utf16DetectIncompleteChar;
        break;
      case 'base64':
        // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
        this.surrogateSize = 3;
        this.detectIncompleteChar = base64DetectIncompleteChar;
        break;
      default:
        this.write = passThroughWrite;
        return;
    }

    // Enough space to store all bytes of a single character. UTF-8 needs 4
    // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
    this.charBuffer = new Buffer$1(6);
    // Number of bytes received for the current incomplete multi-byte character.
    this.charReceived = 0;
    // Number of bytes expected for the current incomplete multi-byte character.
    this.charLength = 0;
  }

  // write decodes the given buffer and returns it as JS string that is
  // guaranteed to not contain any partial multi-byte characters. Any partial
  // character found at the end of the buffer is buffered up, and will be
  // returned when calling write again with the remaining bytes.
  //
  // Note: Converting a Buffer containing an orphan surrogate to a String
  // currently works, but converting a String to a Buffer (via `new Buffer`, or
  // Buffer#write) will replace incomplete surrogates with the unicode
  // replacement character. See https://codereview.chromium.org/121173009/ .
  StringDecoder.prototype.write = function(buffer) {
    var charStr = '';
    // if our last write ended with an incomplete multibyte character
    while (this.charLength) {
      // determine how many remaining bytes this buffer has to offer for this char
      var available = (buffer.length >= this.charLength - this.charReceived) ?
          this.charLength - this.charReceived :
          buffer.length;

      // add the new bytes to the char buffer
      buffer.copy(this.charBuffer, this.charReceived, 0, available);
      this.charReceived += available;

      if (this.charReceived < this.charLength) {
        // still not enough chars in this buffer? wait for more ...
        return '';
      }

      // remove bytes belonging to the current character from the buffer
      buffer = buffer.slice(available, buffer.length);

      // get the character that was split
      charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

      // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
      var charCode = charStr.charCodeAt(charStr.length - 1);
      if (charCode >= 0xD800 && charCode <= 0xDBFF) {
        this.charLength += this.surrogateSize;
        charStr = '';
        continue;
      }
      this.charReceived = this.charLength = 0;

      // if there are no more bytes in this buffer, just emit our char
      if (buffer.length === 0) {
        return charStr;
      }
      break;
    }

    // determine and set charLength / charReceived
    this.detectIncompleteChar(buffer);

    var end = buffer.length;
    if (this.charLength) {
      // buffer the incomplete character bytes we got
      buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
      end -= this.charReceived;
    }

    charStr += buffer.toString(this.encoding, 0, end);

    var end = charStr.length - 1;
    var charCode = charStr.charCodeAt(end);
    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      var size = this.surrogateSize;
      this.charLength += size;
      this.charReceived += size;
      this.charBuffer.copy(this.charBuffer, size, 0, size);
      buffer.copy(this.charBuffer, 0, 0, size);
      return charStr.substring(0, end);
    }

    // or just emit the charStr
    return charStr;
  };

  // detectIncompleteChar determines if there is an incomplete UTF-8 character at
  // the end of the given buffer. If so, it sets this.charLength to the byte
  // length that character, and sets this.charReceived to the number of bytes
  // that are available for this character.
  StringDecoder.prototype.detectIncompleteChar = function(buffer) {
    // determine how many bytes we have to check at the end of this buffer
    var i = (buffer.length >= 3) ? 3 : buffer.length;

    // Figure out if one of the last i bytes of our buffer announces an
    // incomplete char.
    for (; i > 0; i--) {
      var c = buffer[buffer.length - i];

      // See http://en.wikipedia.org/wiki/UTF-8#Description

      // 110XXXXX
      if (i == 1 && c >> 5 == 0x06) {
        this.charLength = 2;
        break;
      }

      // 1110XXXX
      if (i <= 2 && c >> 4 == 0x0E) {
        this.charLength = 3;
        break;
      }

      // 11110XXX
      if (i <= 3 && c >> 3 == 0x1E) {
        this.charLength = 4;
        break;
      }
    }
    this.charReceived = i;
  };

  StringDecoder.prototype.end = function(buffer) {
    var res = '';
    if (buffer && buffer.length)
      res = this.write(buffer);

    if (this.charReceived) {
      var cr = this.charReceived;
      var buf = this.charBuffer;
      var enc = this.encoding;
      res += buf.slice(0, cr).toString(enc);
    }

    return res;
  };

  function passThroughWrite(buffer) {
    return buffer.toString(this.encoding);
  }

  function utf16DetectIncompleteChar(buffer) {
    this.charReceived = buffer.length % 2;
    this.charLength = this.charReceived ? 2 : 0;
  }

  function base64DetectIncompleteChar(buffer) {
    this.charReceived = buffer.length % 3;
    this.charLength = this.charReceived ? 3 : 0;
  }

  Readable.ReadableState = ReadableState;

  var debug = debuglog('stream');
  inherits$1(Readable, EventEmitter);

  function prependListener(emitter, event, fn) {
    // Sadly this is not cacheable as some libraries bundle their own
    // event emitter implementation with them.
    if (typeof emitter.prependListener === 'function') {
      return emitter.prependListener(event, fn);
    } else {
      // This is a hack to make sure that our error handler is attached before any
      // userland ones.  NEVER DO THIS. This is here only because this code needs
      // to continue to work with older versions of Node.js that do not include
      // the prependListener() method. The goal is to eventually remove this hack.
      if (!emitter._events || !emitter._events[event])
        emitter.on(event, fn);
      else if (Array.isArray(emitter._events[event]))
        emitter._events[event].unshift(fn);
      else
        emitter._events[event] = [fn, emitter._events[event]];
    }
  }
  function listenerCount (emitter, type) {
    return emitter.listeners(type).length;
  }
  function ReadableState(options, stream) {

    options = options || {};

    // object stream flag. Used to make read(n) ignore n and to
    // make all the buffer merging and length checks go away
    this.objectMode = !!options.objectMode;

    if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

    // the point at which it stops calling _read() to fill the buffer
    // Note: 0 is a valid value, means "don't call _read preemptively ever"
    var hwm = options.highWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

    // cast to ints.
    this.highWaterMark = ~ ~this.highWaterMark;

    // A linked list is used to store data chunks instead of an array because the
    // linked list can remove elements from the beginning faster than
    // array.shift()
    this.buffer = new BufferList();
    this.length = 0;
    this.pipes = null;
    this.pipesCount = 0;
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;

    // a flag to be able to tell if the onwrite cb is called immediately,
    // or on a later tick.  We set this to true at first, because any
    // actions that shouldn't happen until "later" should generally also
    // not happen before the first write call.
    this.sync = true;

    // whenever we return null, then we set a flag to say
    // that we're awaiting a 'readable' event emission.
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.resumeScheduled = false;

    // Crypto is kind of old and crusty.  Historically, its default string
    // encoding is 'binary' so we have to make this configurable.
    // Everything else in the universe uses 'utf8', though.
    this.defaultEncoding = options.defaultEncoding || 'utf8';

    // when piping, we only care about 'readable' events that happen
    // after read()ing all the bytes and not getting any pushback.
    this.ranOut = false;

    // the number of writers that are awaiting a drain event in .pipe()s
    this.awaitDrain = 0;

    // if true, a maybeReadMore has been scheduled
    this.readingMore = false;

    this.decoder = null;
    this.encoding = null;
    if (options.encoding) {
      this.decoder = new StringDecoder(options.encoding);
      this.encoding = options.encoding;
    }
  }
  function Readable(options) {

    if (!(this instanceof Readable)) return new Readable(options);

    this._readableState = new ReadableState(options, this);

    // legacy
    this.readable = true;

    if (options && typeof options.read === 'function') this._read = options.read;

    EventEmitter.call(this);
  }

  // Manually shove something into the read() buffer.
  // This returns true if the highWaterMark has not been hit yet,
  // similar to how Writable.write() returns true if you should
  // write() some more.
  Readable.prototype.push = function (chunk, encoding) {
    var state = this._readableState;

    if (!state.objectMode && typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer$1.from(chunk, encoding);
        encoding = '';
      }
    }

    return readableAddChunk(this, state, chunk, encoding, false);
  };

  // Unshift should *always* be something directly out of read()
  Readable.prototype.unshift = function (chunk) {
    var state = this._readableState;
    return readableAddChunk(this, state, chunk, '', true);
  };

  Readable.prototype.isPaused = function () {
    return this._readableState.flowing === false;
  };

  function readableAddChunk(stream, state, chunk, encoding, addToFront) {
    var er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (chunk === null) {
      state.reading = false;
      onEofChunk(stream, state);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (state.ended && !addToFront) {
        var e = new Error('stream.push() after EOF');
        stream.emit('error', e);
      } else if (state.endEmitted && addToFront) {
        var _e = new Error('stream.unshift() after end event');
        stream.emit('error', _e);
      } else {
        var skipAdd;
        if (state.decoder && !addToFront && !encoding) {
          chunk = state.decoder.write(chunk);
          skipAdd = !state.objectMode && chunk.length === 0;
        }

        if (!addToFront) state.reading = false;

        // Don't add to the buffer if we've decoded to an empty string chunk and
        // we're not in object mode
        if (!skipAdd) {
          // if we want the data now, just emit it.
          if (state.flowing && state.length === 0 && !state.sync) {
            stream.emit('data', chunk);
            stream.read(0);
          } else {
            // update the buffer info.
            state.length += state.objectMode ? 1 : chunk.length;
            if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

            if (state.needReadable) emitReadable(stream);
          }
        }

        maybeReadMore(stream, state);
      }
    } else if (!addToFront) {
      state.reading = false;
    }

    return needMoreData(state);
  }

  // if it's past the high water mark, we can push in some more.
  // Also, if we have no data yet, we can stand some
  // more bytes.  This is to work around cases where hwm=0,
  // such as the repl.  Also, if the push() triggered a
  // readable event, and the user called read(largeNumber) such that
  // needReadable was set, then we ought to push more, so that another
  // 'readable' event will be triggered.
  function needMoreData(state) {
    return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
  }

  // backwards compatibility.
  Readable.prototype.setEncoding = function (enc) {
    this._readableState.decoder = new StringDecoder(enc);
    this._readableState.encoding = enc;
    return this;
  };

  // Don't raise the hwm > 8MB
  var MAX_HWM = 0x800000;
  function computeNewHighWaterMark(n) {
    if (n >= MAX_HWM) {
      n = MAX_HWM;
    } else {
      // Get the next highest power of 2 to prevent increasing hwm excessively in
      // tiny amounts
      n--;
      n |= n >>> 1;
      n |= n >>> 2;
      n |= n >>> 4;
      n |= n >>> 8;
      n |= n >>> 16;
      n++;
    }
    return n;
  }

  // This function is designed to be inlinable, so please take care when making
  // changes to the function body.
  function howMuchToRead(n, state) {
    if (n <= 0 || state.length === 0 && state.ended) return 0;
    if (state.objectMode) return 1;
    if (n !== n) {
      // Only flow one buffer at a time
      if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
    }
    // If we're asking for more than the current hwm, then raise the hwm.
    if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
    if (n <= state.length) return n;
    // Don't have enough
    if (!state.ended) {
      state.needReadable = true;
      return 0;
    }
    return state.length;
  }

  // you can override either this method, or the async _read(n) below.
  Readable.prototype.read = function (n) {
    debug('read', n);
    n = parseInt(n, 10);
    var state = this._readableState;
    var nOrig = n;

    if (n !== 0) state.emittedReadable = false;

    // if we're doing read(0) to trigger a readable event, but we
    // already have a bunch of data in the buffer, then just trigger
    // the 'readable' event and move on.
    if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
      debug('read: emitReadable', state.length, state.ended);
      if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
      return null;
    }

    n = howMuchToRead(n, state);

    // if we've ended, and we're now clear, then finish it up.
    if (n === 0 && state.ended) {
      if (state.length === 0) endReadable(this);
      return null;
    }

    // All the actual chunk generation logic needs to be
    // *below* the call to _read.  The reason is that in certain
    // synthetic stream cases, such as passthrough streams, _read
    // may be a completely synchronous operation which may change
    // the state of the read buffer, providing enough data when
    // before there was *not* enough.
    //
    // So, the steps are:
    // 1. Figure out what the state of things will be after we do
    // a read from the buffer.
    //
    // 2. If that resulting state will trigger a _read, then call _read.
    // Note that this may be asynchronous, or synchronous.  Yes, it is
    // deeply ugly to write APIs this way, but that still doesn't mean
    // that the Readable class should behave improperly, as streams are
    // designed to be sync/async agnostic.
    // Take note if the _read call is sync or async (ie, if the read call
    // has returned yet), so that we know whether or not it's safe to emit
    // 'readable' etc.
    //
    // 3. Actually pull the requested chunks out of the buffer and return.

    // if we need a readable event, then we need to do some reading.
    var doRead = state.needReadable;
    debug('need readable', doRead);

    // if we currently have less than the highWaterMark, then also read some
    if (state.length === 0 || state.length - n < state.highWaterMark) {
      doRead = true;
      debug('length less than watermark', doRead);
    }

    // however, if we've ended, then there's no point, and if we're already
    // reading, then it's unnecessary.
    if (state.ended || state.reading) {
      doRead = false;
      debug('reading or ended', doRead);
    } else if (doRead) {
      debug('do read');
      state.reading = true;
      state.sync = true;
      // if the length is currently zero, then we *need* a readable event.
      if (state.length === 0) state.needReadable = true;
      // call internal read method
      this._read(state.highWaterMark);
      state.sync = false;
      // If _read pushed data synchronously, then `reading` will be false,
      // and we need to re-evaluate how much data we can return to the user.
      if (!state.reading) n = howMuchToRead(nOrig, state);
    }

    var ret;
    if (n > 0) ret = fromList(n, state);else ret = null;

    if (ret === null) {
      state.needReadable = true;
      n = 0;
    } else {
      state.length -= n;
    }

    if (state.length === 0) {
      // If we have nothing in the buffer, then we want to know
      // as soon as we *do* get something into the buffer.
      if (!state.ended) state.needReadable = true;

      // If we tried to read() past the EOF, then emit end on the next tick.
      if (nOrig !== n && state.ended) endReadable(this);
    }

    if (ret !== null) this.emit('data', ret);

    return ret;
  };

  function chunkInvalid(state, chunk) {
    var er = null;
    if (!Buffer$1.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
      er = new TypeError('Invalid non-string/buffer chunk');
    }
    return er;
  }

  function onEofChunk(stream, state) {
    if (state.ended) return;
    if (state.decoder) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) {
        state.buffer.push(chunk);
        state.length += state.objectMode ? 1 : chunk.length;
      }
    }
    state.ended = true;

    // emit 'readable' now to make sure it gets picked up.
    emitReadable(stream);
  }

  // Don't emit readable right away in sync mode, because this can trigger
  // another read() call => stack overflow.  This way, it might trigger
  // a nextTick recursion warning, but that's not so bad.
  function emitReadable(stream) {
    var state = stream._readableState;
    state.needReadable = false;
    if (!state.emittedReadable) {
      debug('emitReadable', state.flowing);
      state.emittedReadable = true;
      if (state.sync) nextTick(emitReadable_, stream);else emitReadable_(stream);
    }
  }

  function emitReadable_(stream) {
    debug('emit readable');
    stream.emit('readable');
    flow(stream);
  }

  // at this point, the user has presumably seen the 'readable' event,
  // and called read() to consume some data.  that may have triggered
  // in turn another _read(n) call, in which case reading = true if
  // it's in progress.
  // However, if we're not ended, or reading, and the length < hwm,
  // then go ahead and try to read some more preemptively.
  function maybeReadMore(stream, state) {
    if (!state.readingMore) {
      state.readingMore = true;
      nextTick(maybeReadMore_, stream, state);
    }
  }

  function maybeReadMore_(stream, state) {
    var len = state.length;
    while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
      debug('maybeReadMore read 0');
      stream.read(0);
      if (len === state.length)
        // didn't get any data, stop spinning.
        break;else len = state.length;
    }
    state.readingMore = false;
  }

  // abstract method.  to be overridden in specific implementation classes.
  // call cb(er, data) where data is <= n in length.
  // for virtual (non-string, non-buffer) streams, "length" is somewhat
  // arbitrary, and perhaps not very meaningful.
  Readable.prototype._read = function (n) {
    this.emit('error', new Error('not implemented'));
  };

  Readable.prototype.pipe = function (dest, pipeOpts) {
    var src = this;
    var state = this._readableState;

    switch (state.pipesCount) {
      case 0:
        state.pipes = dest;
        break;
      case 1:
        state.pipes = [state.pipes, dest];
        break;
      default:
        state.pipes.push(dest);
        break;
    }
    state.pipesCount += 1;
    debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

    var doEnd = (!pipeOpts || pipeOpts.end !== false);

    var endFn = doEnd ? onend : cleanup;
    if (state.endEmitted) nextTick(endFn);else src.once('end', endFn);

    dest.on('unpipe', onunpipe);
    function onunpipe(readable) {
      debug('onunpipe');
      if (readable === src) {
        cleanup();
      }
    }

    function onend() {
      debug('onend');
      dest.end();
    }

    // when the dest drains, it reduces the awaitDrain counter
    // on the source.  This would be more elegant with a .once()
    // handler in flow(), but adding and removing repeatedly is
    // too slow.
    var ondrain = pipeOnDrain(src);
    dest.on('drain', ondrain);

    var cleanedUp = false;
    function cleanup() {
      debug('cleanup');
      // cleanup event handlers once the pipe is broken
      dest.removeListener('close', onclose);
      dest.removeListener('finish', onfinish);
      dest.removeListener('drain', ondrain);
      dest.removeListener('error', onerror);
      dest.removeListener('unpipe', onunpipe);
      src.removeListener('end', onend);
      src.removeListener('end', cleanup);
      src.removeListener('data', ondata);

      cleanedUp = true;

      // if the reader is waiting for a drain event from this
      // specific writer, then it would cause it to never start
      // flowing again.
      // So, if this is awaiting a drain, then we just call it now.
      // If we don't know, then assume that we are waiting for one.
      if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
    }

    // If the user pushes more data while we're writing to dest then we'll end up
    // in ondata again. However, we only want to increase awaitDrain once because
    // dest will only emit one 'drain' event for the multiple writes.
    // => Introduce a guard on increasing awaitDrain.
    var increasedAwaitDrain = false;
    src.on('data', ondata);
    function ondata(chunk) {
      debug('ondata');
      increasedAwaitDrain = false;
      var ret = dest.write(chunk);
      if (false === ret && !increasedAwaitDrain) {
        // If the user unpiped during `dest.write()`, it is possible
        // to get stuck in a permanently paused state if that write
        // also returned false.
        // => Check whether `dest` is still a piping destination.
        if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
          debug('false write response, pause', src._readableState.awaitDrain);
          src._readableState.awaitDrain++;
          increasedAwaitDrain = true;
        }
        src.pause();
      }
    }

    // if the dest has an error, then stop piping into it.
    // however, don't suppress the throwing behavior for this.
    function onerror(er) {
      debug('onerror', er);
      unpipe();
      dest.removeListener('error', onerror);
      if (listenerCount(dest, 'error') === 0) dest.emit('error', er);
    }

    // Make sure our error handler is attached before userland ones.
    prependListener(dest, 'error', onerror);

    // Both close and finish should trigger unpipe, but only once.
    function onclose() {
      dest.removeListener('finish', onfinish);
      unpipe();
    }
    dest.once('close', onclose);
    function onfinish() {
      debug('onfinish');
      dest.removeListener('close', onclose);
      unpipe();
    }
    dest.once('finish', onfinish);

    function unpipe() {
      debug('unpipe');
      src.unpipe(dest);
    }

    // tell the dest that it's being piped to
    dest.emit('pipe', src);

    // start the flow if it hasn't been started already.
    if (!state.flowing) {
      debug('pipe resume');
      src.resume();
    }

    return dest;
  };

  function pipeOnDrain(src) {
    return function () {
      var state = src._readableState;
      debug('pipeOnDrain', state.awaitDrain);
      if (state.awaitDrain) state.awaitDrain--;
      if (state.awaitDrain === 0 && src.listeners('data').length) {
        state.flowing = true;
        flow(src);
      }
    };
  }

  Readable.prototype.unpipe = function (dest) {
    var state = this._readableState;

    // if we're not piping anywhere, then do nothing.
    if (state.pipesCount === 0) return this;

    // just one destination.  most common case.
    if (state.pipesCount === 1) {
      // passed in one, but it's not the right one.
      if (dest && dest !== state.pipes) return this;

      if (!dest) dest = state.pipes;

      // got a match.
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      if (dest) dest.emit('unpipe', this);
      return this;
    }

    // slow case. multiple pipe destinations.

    if (!dest) {
      // remove all.
      var dests = state.pipes;
      var len = state.pipesCount;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;

      for (var _i = 0; _i < len; _i++) {
        dests[_i].emit('unpipe', this);
      }return this;
    }

    // try to find the right one.
    var i = indexOf(state.pipes, dest);
    if (i === -1) return this;

    state.pipes.splice(i, 1);
    state.pipesCount -= 1;
    if (state.pipesCount === 1) state.pipes = state.pipes[0];

    dest.emit('unpipe', this);

    return this;
  };

  // set up data events if they are asked for
  // Ensure readable listeners eventually get something
  Readable.prototype.on = function (ev, fn) {
    var res = EventEmitter.prototype.on.call(this, ev, fn);

    if (ev === 'data') {
      // Start flowing on next tick if stream isn't explicitly paused
      if (this._readableState.flowing !== false) this.resume();
    } else if (ev === 'readable') {
      var state = this._readableState;
      if (!state.endEmitted && !state.readableListening) {
        state.readableListening = state.needReadable = true;
        state.emittedReadable = false;
        if (!state.reading) {
          nextTick(nReadingNextTick, this);
        } else if (state.length) {
          emitReadable(this);
        }
      }
    }

    return res;
  };
  Readable.prototype.addListener = Readable.prototype.on;

  function nReadingNextTick(self) {
    debug('readable nexttick read 0');
    self.read(0);
  }

  // pause() and resume() are remnants of the legacy readable stream API
  // If the user uses them, then switch into old mode.
  Readable.prototype.resume = function () {
    var state = this._readableState;
    if (!state.flowing) {
      debug('resume');
      state.flowing = true;
      resume(this, state);
    }
    return this;
  };

  function resume(stream, state) {
    if (!state.resumeScheduled) {
      state.resumeScheduled = true;
      nextTick(resume_, stream, state);
    }
  }

  function resume_(stream, state) {
    if (!state.reading) {
      debug('resume read 0');
      stream.read(0);
    }

    state.resumeScheduled = false;
    state.awaitDrain = 0;
    stream.emit('resume');
    flow(stream);
    if (state.flowing && !state.reading) stream.read(0);
  }

  Readable.prototype.pause = function () {
    debug('call pause flowing=%j', this._readableState.flowing);
    if (false !== this._readableState.flowing) {
      debug('pause');
      this._readableState.flowing = false;
      this.emit('pause');
    }
    return this;
  };

  function flow(stream) {
    var state = stream._readableState;
    debug('flow', state.flowing);
    while (state.flowing && stream.read() !== null) {}
  }

  // wrap an old-style stream as the async data source.
  // This is *not* part of the readable stream interface.
  // It is an ugly unfortunate mess of history.
  Readable.prototype.wrap = function (stream) {
    var state = this._readableState;
    var paused = false;

    var self = this;
    stream.on('end', function () {
      debug('wrapped end');
      if (state.decoder && !state.ended) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length) self.push(chunk);
      }

      self.push(null);
    });

    stream.on('data', function (chunk) {
      debug('wrapped data');
      if (state.decoder) chunk = state.decoder.write(chunk);

      // don't skip over falsy values in objectMode
      if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

      var ret = self.push(chunk);
      if (!ret) {
        paused = true;
        stream.pause();
      }
    });

    // proxy all the other methods.
    // important when wrapping filters and duplexes.
    for (var i in stream) {
      if (this[i] === undefined && typeof stream[i] === 'function') {
        this[i] = function (method) {
          return function () {
            return stream[method].apply(stream, arguments);
          };
        }(i);
      }
    }

    // proxy certain important events.
    var events = ['error', 'close', 'destroy', 'pause', 'resume'];
    forEach(events, function (ev) {
      stream.on(ev, self.emit.bind(self, ev));
    });

    // when we try to consume some more bytes, simply unpause the
    // underlying stream.
    self._read = function (n) {
      debug('wrapped _read', n);
      if (paused) {
        paused = false;
        stream.resume();
      }
    };

    return self;
  };

  // exposed for testing purposes only.
  Readable._fromList = fromList;

  // Pluck off n bytes from an array of buffers.
  // Length is the combined lengths of all the buffers in the list.
  // This function is designed to be inlinable, so please take care when making
  // changes to the function body.
  function fromList(n, state) {
    // nothing buffered
    if (state.length === 0) return null;

    var ret;
    if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
      // read it all, truncate the list
      if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
      state.buffer.clear();
    } else {
      // read part of list
      ret = fromListPartial(n, state.buffer, state.decoder);
    }

    return ret;
  }

  // Extracts only enough buffered data to satisfy the amount requested.
  // This function is designed to be inlinable, so please take care when making
  // changes to the function body.
  function fromListPartial(n, list, hasStrings) {
    var ret;
    if (n < list.head.data.length) {
      // slice is the same for buffers and strings
      ret = list.head.data.slice(0, n);
      list.head.data = list.head.data.slice(n);
    } else if (n === list.head.data.length) {
      // first chunk is a perfect match
      ret = list.shift();
    } else {
      // result spans more than one buffer
      ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
    }
    return ret;
  }

  // Copies a specified amount of characters from the list of buffered data
  // chunks.
  // This function is designed to be inlinable, so please take care when making
  // changes to the function body.
  function copyFromBufferString(n, list) {
    var p = list.head;
    var c = 1;
    var ret = p.data;
    n -= ret.length;
    while (p = p.next) {
      var str = p.data;
      var nb = n > str.length ? str.length : n;
      if (nb === str.length) ret += str;else ret += str.slice(0, n);
      n -= nb;
      if (n === 0) {
        if (nb === str.length) {
          ++c;
          if (p.next) list.head = p.next;else list.head = list.tail = null;
        } else {
          list.head = p;
          p.data = str.slice(nb);
        }
        break;
      }
      ++c;
    }
    list.length -= c;
    return ret;
  }

  // Copies a specified amount of bytes from the list of buffered data chunks.
  // This function is designed to be inlinable, so please take care when making
  // changes to the function body.
  function copyFromBuffer(n, list) {
    var ret = Buffer$1.allocUnsafe(n);
    var p = list.head;
    var c = 1;
    p.data.copy(ret);
    n -= p.data.length;
    while (p = p.next) {
      var buf = p.data;
      var nb = n > buf.length ? buf.length : n;
      buf.copy(ret, ret.length - n, 0, nb);
      n -= nb;
      if (n === 0) {
        if (nb === buf.length) {
          ++c;
          if (p.next) list.head = p.next;else list.head = list.tail = null;
        } else {
          list.head = p;
          p.data = buf.slice(nb);
        }
        break;
      }
      ++c;
    }
    list.length -= c;
    return ret;
  }

  function endReadable(stream) {
    var state = stream._readableState;

    // If we get here before consuming all the bytes, then that is a
    // bug in node.  Should never happen.
    if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

    if (!state.endEmitted) {
      state.ended = true;
      nextTick(endReadableNT, state, stream);
    }
  }

  function endReadableNT(state, stream) {
    // Check that we didn't get one last unshift.
    if (!state.endEmitted && state.length === 0) {
      state.endEmitted = true;
      stream.readable = false;
      stream.emit('end');
    }
  }

  function forEach(xs, f) {
    for (var i = 0, l = xs.length; i < l; i++) {
      f(xs[i], i);
    }
  }

  function indexOf(xs, x) {
    for (var i = 0, l = xs.length; i < l; i++) {
      if (xs[i] === x) return i;
    }
    return -1;
  }

  // A bit simpler than readable streams.
  // Implement an async ._write(chunk, encoding, cb), and it'll handle all
  // the drain event emission and buffering.

  Writable.WritableState = WritableState;
  inherits$1(Writable, EventEmitter);

  function nop() {}

  function WriteReq(chunk, encoding, cb) {
    this.chunk = chunk;
    this.encoding = encoding;
    this.callback = cb;
    this.next = null;
  }

  function WritableState(options, stream) {
    Object.defineProperty(this, 'buffer', {
      get: deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
    });
    options = options || {};

    // object stream flag to indicate whether or not this stream
    // contains buffers or objects.
    this.objectMode = !!options.objectMode;

    if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

    // the point at which write() starts returning false
    // Note: 0 is a valid value, means that we always return false if
    // the entire buffer is not flushed immediately on write()
    var hwm = options.highWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

    // cast to ints.
    this.highWaterMark = ~ ~this.highWaterMark;

    this.needDrain = false;
    // at the start of calling end()
    this.ending = false;
    // when end() has been called, and returned
    this.ended = false;
    // when 'finish' is emitted
    this.finished = false;

    // should we decode strings into buffers before passing to _write?
    // this is here so that some node-core streams can optimize string
    // handling at a lower level.
    var noDecode = options.decodeStrings === false;
    this.decodeStrings = !noDecode;

    // Crypto is kind of old and crusty.  Historically, its default string
    // encoding is 'binary' so we have to make this configurable.
    // Everything else in the universe uses 'utf8', though.
    this.defaultEncoding = options.defaultEncoding || 'utf8';

    // not an actual buffer we keep track of, but a measurement
    // of how much we're waiting to get pushed to some underlying
    // socket or file.
    this.length = 0;

    // a flag to see when we're in the middle of a write.
    this.writing = false;

    // when true all writes will be buffered until .uncork() call
    this.corked = 0;

    // a flag to be able to tell if the onwrite cb is called immediately,
    // or on a later tick.  We set this to true at first, because any
    // actions that shouldn't happen until "later" should generally also
    // not happen before the first write call.
    this.sync = true;

    // a flag to know if we're processing previously buffered items, which
    // may call the _write() callback in the same tick, so that we don't
    // end up in an overlapped onwrite situation.
    this.bufferProcessing = false;

    // the callback that's passed to _write(chunk,cb)
    this.onwrite = function (er) {
      onwrite(stream, er);
    };

    // the callback that the user supplies to write(chunk,encoding,cb)
    this.writecb = null;

    // the amount that is being written when _write is called.
    this.writelen = 0;

    this.bufferedRequest = null;
    this.lastBufferedRequest = null;

    // number of pending user-supplied write callbacks
    // this must be 0 before 'finish' can be emitted
    this.pendingcb = 0;

    // emit prefinish if the only thing we're waiting for is _write cbs
    // This is relevant for synchronous Transform streams
    this.prefinished = false;

    // True if the error was already emitted and should not be thrown again
    this.errorEmitted = false;

    // count buffered requests
    this.bufferedRequestCount = 0;

    // allocate the first CorkedRequest, there is always
    // one allocated and free to use, and we maintain at most two
    this.corkedRequestsFree = new CorkedRequest(this);
  }

  WritableState.prototype.getBuffer = function writableStateGetBuffer() {
    var current = this.bufferedRequest;
    var out = [];
    while (current) {
      out.push(current);
      current = current.next;
    }
    return out;
  };
  function Writable(options) {

    // Writable ctor is applied to Duplexes, though they're not
    // instanceof Writable, they're instanceof Readable.
    if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

    this._writableState = new WritableState(options, this);

    // legacy.
    this.writable = true;

    if (options) {
      if (typeof options.write === 'function') this._write = options.write;

      if (typeof options.writev === 'function') this._writev = options.writev;
    }

    EventEmitter.call(this);
  }

  // Otherwise people can pipe Writable streams, which is just wrong.
  Writable.prototype.pipe = function () {
    this.emit('error', new Error('Cannot pipe, not readable'));
  };

  function writeAfterEnd(stream, cb) {
    var er = new Error('write after end');
    // TODO: defer error events consistently everywhere, not just the cb
    stream.emit('error', er);
    nextTick(cb, er);
  }

  // If we get something that is not a buffer, string, null, or undefined,
  // and we're not in objectMode, then that's an error.
  // Otherwise stream chunks are all considered to be of length=1, and the
  // watermarks determine how many objects to keep in the buffer, rather than
  // how many bytes or characters.
  function validChunk(stream, state, chunk, cb) {
    var valid = true;
    var er = false;
    // Always throw error if a null is written
    // if we are not in object mode then throw
    // if it is not a buffer, string, or undefined.
    if (chunk === null) {
      er = new TypeError('May not write null values to stream');
    } else if (!Buffer$1.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
      er = new TypeError('Invalid non-string/buffer chunk');
    }
    if (er) {
      stream.emit('error', er);
      nextTick(cb, er);
      valid = false;
    }
    return valid;
  }

  Writable.prototype.write = function (chunk, encoding, cb) {
    var state = this._writableState;
    var ret = false;

    if (typeof encoding === 'function') {
      cb = encoding;
      encoding = null;
    }

    if (Buffer$1.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

    if (typeof cb !== 'function') cb = nop;

    if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
      state.pendingcb++;
      ret = writeOrBuffer(this, state, chunk, encoding, cb);
    }

    return ret;
  };

  Writable.prototype.cork = function () {
    var state = this._writableState;

    state.corked++;
  };

  Writable.prototype.uncork = function () {
    var state = this._writableState;

    if (state.corked) {
      state.corked--;

      if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
    }
  };

  Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    // node::ParseEncoding() requires lower case.
    if (typeof encoding === 'string') encoding = encoding.toLowerCase();
    if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
    this._writableState.defaultEncoding = encoding;
    return this;
  };

  function decodeChunk(state, chunk, encoding) {
    if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
      chunk = Buffer$1.from(chunk, encoding);
    }
    return chunk;
  }

  // if we're already writing something, then just put this
  // in the queue, and wait our turn.  Otherwise, call _write
  // If we return false, then we need a drain event, so set that flag.
  function writeOrBuffer(stream, state, chunk, encoding, cb) {
    chunk = decodeChunk(state, chunk, encoding);

    if (Buffer$1.isBuffer(chunk)) encoding = 'buffer';
    var len = state.objectMode ? 1 : chunk.length;

    state.length += len;

    var ret = state.length < state.highWaterMark;
    // we must ensure that previous needDrain will not be reset to false.
    if (!ret) state.needDrain = true;

    if (state.writing || state.corked) {
      var last = state.lastBufferedRequest;
      state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
      if (last) {
        last.next = state.lastBufferedRequest;
      } else {
        state.bufferedRequest = state.lastBufferedRequest;
      }
      state.bufferedRequestCount += 1;
    } else {
      doWrite(stream, state, false, len, chunk, encoding, cb);
    }

    return ret;
  }

  function doWrite(stream, state, writev, len, chunk, encoding, cb) {
    state.writelen = len;
    state.writecb = cb;
    state.writing = true;
    state.sync = true;
    if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
    state.sync = false;
  }

  function onwriteError(stream, state, sync, er, cb) {
    --state.pendingcb;
    if (sync) nextTick(cb, er);else cb(er);

    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  }

  function onwriteStateUpdate(state) {
    state.writing = false;
    state.writecb = null;
    state.length -= state.writelen;
    state.writelen = 0;
  }

  function onwrite(stream, er) {
    var state = stream._writableState;
    var sync = state.sync;
    var cb = state.writecb;

    onwriteStateUpdate(state);

    if (er) onwriteError(stream, state, sync, er, cb);else {
      // Check if we're actually ready to finish, but don't emit yet
      var finished = needFinish(state);

      if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
        clearBuffer(stream, state);
      }

      if (sync) {
        /*<replacement>*/
          nextTick(afterWrite, stream, state, finished, cb);
        /*</replacement>*/
      } else {
          afterWrite(stream, state, finished, cb);
        }
    }
  }

  function afterWrite(stream, state, finished, cb) {
    if (!finished) onwriteDrain(stream, state);
    state.pendingcb--;
    cb();
    finishMaybe(stream, state);
  }

  // Must force callback to be called on nextTick, so that we don't
  // emit 'drain' before the write() consumer gets the 'false' return
  // value, and has a chance to attach a 'drain' listener.
  function onwriteDrain(stream, state) {
    if (state.length === 0 && state.needDrain) {
      state.needDrain = false;
      stream.emit('drain');
    }
  }

  // if there's something in the buffer waiting, then process it
  function clearBuffer(stream, state) {
    state.bufferProcessing = true;
    var entry = state.bufferedRequest;

    if (stream._writev && entry && entry.next) {
      // Fast case, write everything using _writev()
      var l = state.bufferedRequestCount;
      var buffer = new Array(l);
      var holder = state.corkedRequestsFree;
      holder.entry = entry;

      var count = 0;
      while (entry) {
        buffer[count] = entry;
        entry = entry.next;
        count += 1;
      }

      doWrite(stream, state, true, state.length, buffer, '', holder.finish);

      // doWrite is almost always async, defer these to save a bit of time
      // as the hot path ends with doWrite
      state.pendingcb++;
      state.lastBufferedRequest = null;
      if (holder.next) {
        state.corkedRequestsFree = holder.next;
        holder.next = null;
      } else {
        state.corkedRequestsFree = new CorkedRequest(state);
      }
    } else {
      // Slow case, write chunks one-by-one
      while (entry) {
        var chunk = entry.chunk;
        var encoding = entry.encoding;
        var cb = entry.callback;
        var len = state.objectMode ? 1 : chunk.length;

        doWrite(stream, state, false, len, chunk, encoding, cb);
        entry = entry.next;
        // if we didn't call the onwrite immediately, then
        // it means that we need to wait until it does.
        // also, that means that the chunk and cb are currently
        // being processed, so move the buffer counter past them.
        if (state.writing) {
          break;
        }
      }

      if (entry === null) state.lastBufferedRequest = null;
    }

    state.bufferedRequestCount = 0;
    state.bufferedRequest = entry;
    state.bufferProcessing = false;
  }

  Writable.prototype._write = function (chunk, encoding, cb) {
    cb(new Error('not implemented'));
  };

  Writable.prototype._writev = null;

  Writable.prototype.end = function (chunk, encoding, cb) {
    var state = this._writableState;

    if (typeof chunk === 'function') {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === 'function') {
      cb = encoding;
      encoding = null;
    }

    if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

    // .end() fully uncorks
    if (state.corked) {
      state.corked = 1;
      this.uncork();
    }

    // ignore unnecessary end() calls.
    if (!state.ending && !state.finished) endWritable(this, state, cb);
  };

  function needFinish(state) {
    return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
  }

  function prefinish(stream, state) {
    if (!state.prefinished) {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }

  function finishMaybe(stream, state) {
    var need = needFinish(state);
    if (need) {
      if (state.pendingcb === 0) {
        prefinish(stream, state);
        state.finished = true;
        stream.emit('finish');
      } else {
        prefinish(stream, state);
      }
    }
    return need;
  }

  function endWritable(stream, state, cb) {
    state.ending = true;
    finishMaybe(stream, state);
    if (cb) {
      if (state.finished) nextTick(cb);else stream.once('finish', cb);
    }
    state.ended = true;
    stream.writable = false;
  }

  // It seems a linked list but it is not
  // there will be only 2 of these for each stream
  function CorkedRequest(state) {
    var _this = this;

    this.next = null;
    this.entry = null;

    this.finish = function (err) {
      var entry = _this.entry;
      _this.entry = null;
      while (entry) {
        var cb = entry.callback;
        state.pendingcb--;
        cb(err);
        entry = entry.next;
      }
      if (state.corkedRequestsFree) {
        state.corkedRequestsFree.next = _this;
      } else {
        state.corkedRequestsFree = _this;
      }
    };
  }

  inherits$1(Duplex, Readable);

  var keys = Object.keys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
  function Duplex(options) {
    if (!(this instanceof Duplex)) return new Duplex(options);

    Readable.call(this, options);
    Writable.call(this, options);

    if (options && options.readable === false) this.readable = false;

    if (options && options.writable === false) this.writable = false;

    this.allowHalfOpen = true;
    if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

    this.once('end', onend);
  }

  // the no-half-open enforcer
  function onend() {
    // if we allow half-open state, or if the writable side ended,
    // then we're ok.
    if (this.allowHalfOpen || this._writableState.ended) return;

    // no more data can be written.
    // But allow more writes to happen in this tick.
    nextTick(onEndNT, this);
  }

  function onEndNT(self) {
    self.end();
  }

  // a transform stream is a readable/writable stream where you do
  // something with the data.  Sometimes it's called a "filter",
  // but that's not a great name for it, since that implies a thing where
  // some bits pass through, and others are simply ignored.  (That would
  // be a valid example of a transform, of course.)
  //
  // While the output is causally related to the input, it's not a
  // necessarily symmetric or synchronous transformation.  For example,
  // a zlib stream might take multiple plain-text writes(), and then
  // emit a single compressed chunk some time in the future.
  //
  // Here's how this works:
  //
  // The Transform stream has all the aspects of the readable and writable
  // stream classes.  When you write(chunk), that calls _write(chunk,cb)
  // internally, and returns false if there's a lot of pending writes
  // buffered up.  When you call read(), that calls _read(n) until
  // there's enough pending readable data buffered up.
  //
  // In a transform stream, the written data is placed in a buffer.  When
  // _read(n) is called, it transforms the queued up data, calling the
  // buffered _write cb's as it consumes chunks.  If consuming a single
  // written chunk would result in multiple output chunks, then the first
  // outputted bit calls the readcb, and subsequent chunks just go into
  // the read buffer, and will cause it to emit 'readable' if necessary.
  //
  // This way, back-pressure is actually determined by the reading side,
  // since _read has to be called to start processing a new chunk.  However,
  // a pathological inflate type of transform can cause excessive buffering
  // here.  For example, imagine a stream where every byte of input is
  // interpreted as an integer from 0-255, and then results in that many
  // bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
  // 1kb of data being output.  In this case, you could write a very small
  // amount of input, and end up with a very large amount of output.  In
  // such a pathological inflating mechanism, there'd be no way to tell
  // the system to stop doing the transform.  A single 4MB write could
  // cause the system to run out of memory.
  //
  // However, even in such a pathological case, only a single written chunk
  // would be consumed, and then the rest would wait (un-transformed) until
  // the results of the previous transformed chunk were consumed.

  inherits$1(Transform, Duplex);

  function TransformState(stream) {
    this.afterTransform = function (er, data) {
      return afterTransform(stream, er, data);
    };

    this.needTransform = false;
    this.transforming = false;
    this.writecb = null;
    this.writechunk = null;
    this.writeencoding = null;
  }

  function afterTransform(stream, er, data) {
    var ts = stream._transformState;
    ts.transforming = false;

    var cb = ts.writecb;

    if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

    ts.writechunk = null;
    ts.writecb = null;

    if (data !== null && data !== undefined) stream.push(data);

    cb(er);

    var rs = stream._readableState;
    rs.reading = false;
    if (rs.needReadable || rs.length < rs.highWaterMark) {
      stream._read(rs.highWaterMark);
    }
  }
  function Transform(options) {
    if (!(this instanceof Transform)) return new Transform(options);

    Duplex.call(this, options);

    this._transformState = new TransformState(this);

    // when the writable side finishes, then flush out anything remaining.
    var stream = this;

    // start out asking for a readable event once data is transformed.
    this._readableState.needReadable = true;

    // we have implemented the _read method, and done the other things
    // that Readable wants before the first _read call, so unset the
    // sync guard flag.
    this._readableState.sync = false;

    if (options) {
      if (typeof options.transform === 'function') this._transform = options.transform;

      if (typeof options.flush === 'function') this._flush = options.flush;
    }

    this.once('prefinish', function () {
      if (typeof this._flush === 'function') this._flush(function (er) {
        done(stream, er);
      });else done(stream);
    });
  }

  Transform.prototype.push = function (chunk, encoding) {
    this._transformState.needTransform = false;
    return Duplex.prototype.push.call(this, chunk, encoding);
  };

  // This is the part where you do stuff!
  // override this function in implementation classes.
  // 'chunk' is an input chunk.
  //
  // Call `push(newChunk)` to pass along transformed output
  // to the readable side.  You may call 'push' zero or more times.
  //
  // Call `cb(err)` when you are done with this chunk.  If you pass
  // an error, then that'll put the hurt on the whole operation.  If you
  // never call cb(), then you'll never get another chunk.
  Transform.prototype._transform = function (chunk, encoding, cb) {
    throw new Error('Not implemented');
  };

  Transform.prototype._write = function (chunk, encoding, cb) {
    var ts = this._transformState;
    ts.writecb = cb;
    ts.writechunk = chunk;
    ts.writeencoding = encoding;
    if (!ts.transforming) {
      var rs = this._readableState;
      if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
    }
  };

  // Doesn't matter what the args are here.
  // _transform does all the work.
  // That we got here means that the readable side wants more data.
  Transform.prototype._read = function (n) {
    var ts = this._transformState;

    if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
      ts.transforming = true;
      this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
    } else {
      // mark that we need a transform, so that any data that comes in
      // will get processed, now that we've asked for it.
      ts.needTransform = true;
    }
  };

  function done(stream, er) {
    if (er) return stream.emit('error', er);

    // if there's nothing in the write buffer, then that means
    // that nothing more will ever be provided
    var ws = stream._writableState;
    var ts = stream._transformState;

    if (ws.length) throw new Error('Calling transform done when ws.length != 0');

    if (ts.transforming) throw new Error('Calling transform done when still transforming');

    return stream.push(null);
  }

  inherits$1(PassThrough, Transform);
  function PassThrough(options) {
    if (!(this instanceof PassThrough)) return new PassThrough(options);

    Transform.call(this, options);
  }

  PassThrough.prototype._transform = function (chunk, encoding, cb) {
    cb(null, chunk);
  };

  /**
   * Checks if the given value is an object.
   * @param value The value to check
   * @returns True if the value is an object; false otherwise.
   */
  function isObject(value) {
      return typeof value === 'object' && value !== null;
  }
  /**
   * Checks if the given value is defined.
   * @param value The value to check
   * @returns True if the value is defined; false otherwise.
   */
  function isDefined(value) {
      return value !== undefined;
  }
  /**
   * Checks if the given value is null.
   * @param value The value to check
   * @returns True if the value is null; false otherwise.
   */
  function isNotNull(value) {
      return value !== null;
  }
  /**
   * Checks if the given value is not null or undefined.
   * @param value The value to check
   * @returns True if the value is not null or undefined; false otherwise.
   */
  function isNotNullOrUndefined(value) {
      return isNotNull(value) && isDefined(value);
  }
  /**
   * Checks if the given object is a Promise.
   * @param object The object to check
   * @returns True if the object is a Promise; false otherwise.
   */
  function isPromise(object) {
      return Boolean(object && object.then);
  }
  /**
   * Checks if the given value is a function.
   * @param value The value to check
   * @returns True if the value is a function; false otherwise.
   */
  function isFunction(value) {
      return typeof value === 'function';
  }

  /**
   * Wraps a given value in an Optional
   * @param value The value to wrap in an Optional
   * @returns An Optional containing the value
   * @example
   * const optional = Optional.fromNullable(1);
   * // optional === Optional.Some(1)
   *
   * const optional = Optional.fromNullable(null);
   * // optional === Optional.None()
   */
  function fromNullable(value) {
      return isNotNullOrUndefined(value)
          ? Optional.Some(value)
          : Optional.None();
  }
  /**
   * Converts a parsed object to an Optional
   * @param object The parsed object to convert to an Optional
   * @returns An Optional based on the object
   * @throws Error if the object is not an Optional
   * @example
   * const someObject = { isOptionalInstance: true, valuePresent: true, value: 1 };
   * const noneObject = { isOptionalInstance: true, valueAbsent: true };
   * const notOptionalObject = { val: 88 };
   *
   * const optional = Optional.fromParsedJson(someObject);
   * // optional === Optional.Some(1)
   *
   * const optional = Optional.fromParsedJson(noneObject);
   * // optional === Optional.None()
   *
   * const optional = Optional.fromParsedJson(notOptionalObject);
   * // throws Error
   */
  function fromParsedJson(object) {
      if (!isOptional(object)) {
          throw new Error('fromParsedJson(object) expects an object obtained from JSON.parsing an Optional stringified with JSON.stringify');
      }
      return isSome(object)
          ? Optional.Some(object.value)
          : Optional.None();
  }
  /**
   * Checks if all the given optionals have a value.
   * @param optionals The optionals to combine
   * @returns An optional containing an array of the values of the optionals
   * @example
   * const optional1 = Optional.Some(1);
   * const optional2 = Optional.Some(2);
   * const optional3 = Optional.Some(3);
   * const optional4 = Optional.None();
   *
   * const optional = Optional.all([optional1, optional2, optional3]);
   * // optional === Optional.Some([1, 2, 3])
   *
   * const optional = Optional.all([optional1, optional2, optional3, optional4]);
   * // optional === Optional.None()
   */
  function all(optionals) {
      if (optionals.some(isNone)) {
          return Optional.None();
      }
      return values(optionals);
  }
  /**
   * Function that returns an optional based on a truthy check
   * @param truthy The condition to test
   * @param value The value to wrap in an Optional
   * @returns An Optional containing the value if the condition is truthy, otherwise an empty Optional
   * @example
   * const optional = Optional.when(true, 1);
   * // optional === Optional.Some(1)
   *
   * const optional = Optional.when(false, 1);
   * // optional === Optional.None()
   */
  function when$1(truthy, value) {
      return truthy ? Optional.Some(value) : Optional.None();
  }
  /**
   * Retrieves the first optional that has a value.
   * @param optionals The optionals to get the first value from
   * @returns The first optional that has a value, otherwise a none optional
   * @example
   * const optional1 = Optional.None();
   * const optional2 = Optional.Some(1);
   * const optional3 = Optional.None();
   * const optional4 = Optional.Some(3);
   *
   * const optional = Optional.first([optional1, optional2, optional3, optional4]);
   * // optional === Optional.Some(1)
   */
  function first(optionals) {
      const firstIndex = optionals.findIndex(isSome);
      if (firstIndex === -1) {
          return Optional.None();
      }
      return optionals[firstIndex];
  }
  /**
   * Combines the values of the given optionals into an array.
   * Ignores optionals that do not have a value.
   * @param optionals The optionals to combine
   * @returns An optional containing an array of the values of the optionals
   * @example
   * const optional1 = Optional.Some(1);
   * const optional2 = Optional.Some(2);
   * const optional3 = Optional.Some(3);
   * const optional4 = Optional.None();
   *
   * const optional = Optional.values([optional1, optional2, optional3, optional4]);
   * // optional === Optional.Some([1, 2, 3])
   */
  function values(optionals) {
      return Optional.Some(optionals
          .filter(isSome)
          .map((optional) => optional.get()));
  }
  /**
   * Checks if the given object is an Optional
   * @param optional The optional to check
   * @returns True if the given object is an Optional, otherwise false
   */
  function isOptional(optional) {
      return Boolean(optional && optional.isOptionalInstance);
  }
  /**
   * Checks if the given object is an Optional and has a value
   * @param optional The optional to check
   * @returns True if the given object is an Optional and has a value, otherwise false
   * @example
   * const optional = Optional.Some(1);
   * // isSome(optional) === true
   * // isNone(optional) === false
   *
   * const optional = Optional.None();
   * // isSome(optional) === false
   * // isNone(optional) === true
   */
  function isSome(optional) {
      return isOptional(optional) && optional.valuePresent;
  }
  /**
   * Checks if the given object is an Optional and does not have a value
   * @param optional The optional to check
   * @returns True if the given object is an Optional and does not have a value, otherwise false
   * @example
   * const optional = Optional.Some(1);
   * // isSome(optional) === true
   * // isNone(optional) === false
   *
   * const optional = Optional.None();
   * // isSome(optional) === false
   * // isNone(optional) === true
   */
  function isNone(optional) {
      return isOptional(optional) && optional.valueAbsent;
  }

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  function absorbRejectedPromises(value) {
      return __awaiter(this, void 0, void 0, function* () {
          try {
              yield value;
          }
          catch (_) {
              // Nothing to do here.
          }
      });
  }
  var returnThis = {
      nullary: function nullaryReturnThis() {
          return this;
      },
      unary: function unaryReturnThis(unusedArgument) {
          absorbRejectedPromises(unusedArgument);
          return this;
      },
      binary: function unaryReturnThis(unusedArgument, secondUnusedArgument) {
          absorbRejectedPromises(unusedArgument);
          absorbRejectedPromises(secondUnusedArgument);
          return this;
      },
      any: function anyReturnThis(...unusedArguments) {
          unusedArguments.forEach(absorbRejectedPromises);
          return this;
      }
  };

  class Optional {
      constructor() {
          this.isOptionalInstance = true;
          this.valuePresent = false;
          this.valueAbsent = false;
      }
      nullableMap(...args) {
          return returnThis.any.call(this, ...args);
      }
      or(...args) {
          return returnThis.any.call(this, ...args);
      }
      match(...args) {
          return returnThis.any.call(this, ...args);
      }
      transform(...args) {
          return returnThis.any.call(this, ...args);
      }
      map(...args) {
          return returnThis.any.call(this, ...args);
      }
      optionalProperty(...args) {
          return returnThis.any.call(this, ...args);
      }
      nullableProperty(...args) {
          return returnThis.any.call(this, ...args);
      }
      property(...args) {
          return returnThis.any.call(this, ...args);
      }
      flatMap(...args) {
          return returnThis.any.call(this, ...args);
      }
      tap(...args) {
          return returnThis.any.call(this, ...args);
      }
      satisfies(...args) {
          return returnThis.any.call(this, ...args);
      }
      valueEquals(...args) {
          return returnThis.any.call(this, ...args);
      }
      filter(...args) {
          return returnThis.any.call(this, ...args);
      }
      reject(...args) {
          return returnThis.any.call(this, ...args);
      }
      get(...args) {
          return returnThis.any.call(this, ...args);
      }
      getOrElse(...args) {
          return returnThis.any.call(this, ...args);
      }
      recover(...args) {
          return returnThis.any.call(this, ...args);
      }
      replace(...args) {
          return returnThis.any.call(this, ...args);
      }
  }
  Optional.fromNullable = fromNullable;
  Optional.fromParsedJson = fromParsedJson;
  Optional.all = all;
  Optional.values = values;
  Optional.when = when$1;
  Optional.first = first;
  Optional.isOptional = isOptional;
  Optional.isSome = isSome;
  Optional.isNone = isNone;
  /**
     * Maps the value of the Optional to a new value.
     */
  Optional.nullableMap = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.nullableMap(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).nullableMap(...params);
  };
  /**
     * Returns the original optional if it is present, or the return value of the provided replacement function if the original value is not present.
     */
  Optional.or = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.or(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).or(...params);
  };
  /**
     * Pattern matches on the optional value and returns the result of executing the corresponding function for the matching case.
     */
  Optional.match = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.match(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).match(...params);
  };
  /**
     * Maps the value of the Optional to a new value.
     */
  Optional.transform = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.transform(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).transform(...params);
  };
  /**
     * Maps the value of the Optional to a new value.
     */
  Optional.map = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.map(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).map(...params);
  };
  Optional.optionalProperty = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.optionalProperty(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).optionalProperty(...params);
  };
  Optional.nullableProperty = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.nullableProperty(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).nullableProperty(...params);
  };
  Optional.property = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.property(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).property(...params);
  };
  /**
     * Maps the value of the Optional to a new value.
     */
  Optional.flatMap = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.flatMap(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).flatMap(...params);
  };
  /**
     * Executes a function if the Optional is present.
     */
  Optional.tap = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.tap(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).tap(...params);
  };
  /**
     * Checks whether the Optional satisfies a predicate.
     */
  Optional.satisfies = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.satisfies(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).satisfies(...params);
  };
  /**
     * Checks whether the Optional's value is equal to another value.
     */
  Optional.valueEquals = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.valueEquals(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).valueEquals(...params);
  };
  Optional.filter = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.filter(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).filter(...params);
  };
  /**
     * Checks whether the Optional's value fails a predicate.
     */
  Optional.reject = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.reject(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).reject(...params);
  };
  /**
     * Get the value or throw.
     */
  Optional.get = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.get(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).get(...params);
  };
  /**
     * Get the value or return a default value.
     */
  Optional.getOrElse = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.getOrElse(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).getOrElse(...params);
  };
  /**
     * Recovers from a None Optional.
     */
  Optional.recover = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.recover(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).recover(...params);
  };
  /**
     * Replace the value of the Optional.
     */
  Optional.replace = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Optional.replace(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Optional.Some()).replace(...params);
  }; /**
  * Maps the value of the Optional to a new value.
  * @param λ A function that takes the value of the Optional and returns a new value.
  * @returns An Optional containing the new value.
  * @example
  * const optional = Optional.Some(5);
  * const newOptional = optional.nullableMap(x => x + 1);
  * // newOptional === Optional.Some(6)
  *
  * const optional = Optional.Some(5);
  * const newOptional = optional.nullableMap(x => undefined);
  * // newOptional === Optional.None()
  *
  * const optional = Optional.None();
  * const newOptional = optional.nullableMap(x => x + 1);
  * // newOptional === Optional.None()
  */

  var throwArgument = (argument) => {
      throw argument;
  };

  class NoneClass extends Optional {
      constructor() {
          super();
          this.valueAbsent = true;
          this.valuePresent = false;
      }
      or(replacement) {
          return (isFunction(replacement))
              ? replacement()
              : replacement;
      }
      match(clauses) {
          return (clauses.None || throwArgument)(undefined);
      }
      satisfies(λ) {
          return false;
      }
      valueEquals() {
          return false;
      }
      get(message) {
          throw new Error(message || 'Cannot unwrap None instances');
      }
      getOrElse(replacement) {
          return replacement;
      }
      recover(λ) {
          return Optional.Some(λ());
      }
  }

  var Exception = Error;

  /**
   * PIPE UTIL
   *
   * This is a utility function that allows you to pipe functions together.
   *
   * @see https://github.com/lodash/lodash/blob/master/flow.js
   * @copyright lodash (https://github.com/lodash/lodash/)
   *
   * @note Created to replace lodash.flow dependency.
   */
  function pipe(...functions) {
      const length = functions.length;
      let index = length;
      while (index--) {
          if (typeof functions[index] !== 'function') {
              throw new TypeError('Expected a function');
          }
      }
      return function (...args) {
          let index = 0;
          // @ts-ignore ignore 'this' type
          let result = length ? functions[index].apply(this, args) : args[0];
          while (++index < length) {
              // @ts-ignore ignore 'this' type
              result = functions[index].call(this, result);
          }
          return result;
      };
  }

  const identity = (x) => x;
  const constant = (x) => () => x;
  const property = (propertyName) => (object) => object[propertyName];

  class SomeClass extends Optional {
      constructor(someValue) {
          super();
          this.valuePresent = true;
          this.valueAbsent = false;
          this.value = someValue;
      }
      nullableMap(λ) {
          return Optional.fromNullable(λ(this.value));
      }
      match(clauses) {
          return (clauses.Some || identity)(this.value);
      }
      transform(λ) {
          return this.map(λ);
      }
      map(λ) {
          return Optional.Some(λ(this.value));
      }
      optionalProperty(property) {
          return isObject(this.value) ? this.value[property] : undefined;
      }
      nullableProperty(property) {
          return Optional.fromNullable(isObject(this.value) ? this.value[property] : undefined);
      }
      flatMap(λ) {
          return λ(this.value);
      }
      tap(λ) {
          λ(this.value);
          return this;
      }
      property(property) {
          return Optional.Some(isObject(this.value) ? this.value[property] : undefined);
      }
      satisfies(λ) {
          return Boolean(λ(this.value));
      }
      valueEquals(value) {
          return this.value === value;
      }
      filter(λ) {
          return λ(this.value) ? this : Optional.None();
      }
      reject(λ) {
          return !λ(this.value) ? this : Optional.None();
      }
      get() {
          return this.value;
      }
      getOrElse(replacement) {
          return this.value;
      }
      replace(value) {
          return Optional.Some(value);
      }
  }

  /**
   * Function assigns the prototype of the patch to the target object.
   * @param objectToPatch The object to patch
   * @param patch The prototype patch to apply
   */
  function patchPrototype(objectToPatch, patch) {
      const oldPrototype = objectToPatch.prototype;
      objectToPatch.prototype = Object.create(patch.prototype);
      return Object.assign(objectToPatch.prototype, oldPrototype);
  }
  /**
   * Function instantiates an object and assigns the prototype of the factory to the new object.
   * @param constructor The constructor to instantiate
   * @param factory The factory function to use
   * @param args The arguments to pass to the constructor
   * @returns An instance of the constructor
   */
  function instantiateWithFactory(constructor, factory, ...args) {
      const newInstance = new constructor(...args);
      Object.setPrototypeOf(newInstance, factory.prototype);
      return newInstance;
  }

  /**
   * Patch the function prototypes to inherit from their respective
   * Class prototypes
   */
  function patchFactoryFunctions$1() {
      patchPrototype(Some, SomeClass);
      patchPrototype(None, NoneClass);
  }
  const Some = function makeSome(value) {
      return instantiateWithFactory((SomeClass), Some, value);
  };
  const None = function makeNone() {
      return instantiateWithFactory(NoneClass, None);
  };
  patchFactoryFunctions$1();

  function addStaticProperties$1() {
      Optional.Some = Some;
      Optional.None = None;
  }
  addStaticProperties$1();

  /**
   * Function that transforms a value into a result
   * @param λ The transformation function
   * @param wrapFunction The function that wraps the result of the transformation function
   * @param thisArg The context of the transformation function
   * @returns The result of the wrapped transformation function.
   * @example
   * const result = TransformResult(() => 2, Result.Ok);
   * // result === Result.Ok(2)
   *
   * const result = TransformResult((x) => x + 2, Result.Ok, 1);
   * // result === Result.Ok(3)
   *
   * const result = TransformResult(() => 5);
   * // result === 5
   */
  function TransformResult(λ, wrapFunction = identity, thisArg) {
      try {
          const value = λ(thisArg);
          if (isPromise(value)) {
              return Result.Pending(value.then(wrapFunction, Result.Aborted));
          }
          return wrapFunction(value);
      }
      catch (error) {
          return Result.Aborted(error);
      }
  }
  function doTry(λ) {
      return TransformResult(λ, (value) => {
          if (isResult(value)) {
              return value;
          }
          let optional = value;
          if (!value || !isOptional(value)) {
              optional = Optional.fromNullable(value);
          }
          return optional.match({
              Some: Result.Ok,
              None: constant(Result.Error())
          });
      });
  }
  function tryAsync(λ) {
      return pipe(doTry, Result.asynchronous)(λ);
  }
  /**
   * Function that returns a result based on a truthy check
   * @param truthy The truthy value
   * @param value The value to return if truthy
   * @param error The error to return if falsy
   * @returns The result of the truthy check
   */
  function when(truthy, value, error) {
      return truthy ? Result.Ok(value) : Result.Error(error);
  }
  /**
   * Function that returns a async result based on a given promise
   * @param promise The promise to convert to a result
   * @returns A AsyncResult based on the promise
   */
  function fromPromise(promise) {
      return Result.Pending(isPromise(promise) ? promise.then(Result.Ok, Result.Error) : Result.Error());
  }
  function expect(value) {
      if (!isNotNullOrUndefined(value)) {
          return Result.Error();
      }
      if (!isObject(value)) {
          return Result.Ok(value);
      }
      if (isPromise(value)) {
          return Result.Pending(value.then(expect, Result.Aborted));
      }
      if (isResult(value)) {
          return value;
      }
      const optionalObject = (!isOptional(value))
          ? Optional.fromNullable(value)
          : value;
      return optionalObject.match({
          Some: (e) => Result.Ok(e),
          None: Result.Error
      });
  }
  /**
   * Function tests if an object is a Result
   * @param object The object to check
   * @returns True if the object is a Result
   * @example
   * const result = isResult(Result.Ok(1));
   * // result === true
   *
   * const result = isResult(Result.Error());
   * // result === true
   *
   * const result = isResult(5);
   * // result === false
   */
  function isResult(object) {
      return Boolean(object && object.isResultInstance);
  }
  /**
   * Function tests if an object is a SyncResult
   * @param object The object to check
   * @returns True if the object is a SyncResult
   * @example
   * const result = isSyncResult(Result.Ok(1));
   * // result === true
   *
   * const result = isSyncResult(Result.Pending(1));
   * // result === false
   *
   * const result = isSyncResult(5);
   * // result === false
   */
  function isSyncResult(object) {
      return isResult(object) && object.isAsynchronous === false;
  }
  /**
   * Function tests if an object is a AsyncResult
   * @param object The object to check
   * @returns True if the object is a AsyncResult
   * @example
   * const result = isAsyncResult(Result.Ok(1));
   * // result === false
   *
   * const result = isAsyncResult(Result.Pending(1));
   * // result === true
   *
   * const result = isAsyncResult(5);
   * // result === false
   */
  function isAsyncResult(object) {
      return isResult(object) && object.isAsynchronous === true;
  }

  /**
   * The base class for all results.
   * The Result class is a combination of both the SyncResult
   * and AsyncResult classes. As such it can be used as a base.
   * @example
   * const syncResult = Result.Ok(1); // SyncResult<number>
   * const result = syncResult as Result<number>; // Result<number>
   * const returnedResult = result.get(); // number | Promise<number>
   *
   * // result is now a Result<number> which can be a SyncResult<number> or an
   * //   AsyncResult<number>. It is not known which one it is. Thus when
   * //   calling functions on it, the return type will be a union of both.
   */
  class Result {
      constructor() {
          this.isResultInstance = true;
          this.isAsynchronous = false;
          this.isOk = false;
          this.isError = false;
          this.isAborted = false;
      }
  }
  Result.fromPromise = fromPromise;
  Result.when = when;
  Result.expect = expect;
  Result.try = doTry;
  Result.tryAsync = tryAsync;
  Result.isResult = isResult;
  Result.isSyncResult = isSyncResult;
  Result.isAsyncResult = isAsyncResult;
  /**
     * Returns the value of the result.
  * If the result is not Ok, it will throw an error.
     */
  Result.get = (...params) => {
      if (params.length < 1) {
          return (...subParams) => Result.get(...[...params, ...subParams]);
      }
      const instance = params.splice(0, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).get(...params);
  };
  /**
     * Returns the value of the result.
  * If the result is not Ok, it will return the value provided.
     */
  Result.getOrElse = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.getOrElse(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).getOrElse(...params);
  };
  /**
     * Recovers from an error if an error occurs.
     */
  Result.recover = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.recover(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).recover(...params);
  };
  /**
     * Replace the value of the result.
  * Will only replace the value if the result is Ok.
     */
  Result.replace = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.replace(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).replace(...params);
  };
  /**
     * Returns the wrapped property value if the result contains an object.
  * Will return an Error result if the property was not found.
     */
  Result.expectProperty = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.expectProperty(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).expectProperty(...params);
  };
  /**
     * Returns the wrapped property value if the result contains an object.
  * Will always return an Ok result even if the property was not found.
     */
  Result.property = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.property(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).property(...params);
  };
  /**
     * Tap into the result and perform an action.
  * Will only perform the action if the result is Ok.
     */
  Result.tap = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.tap(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).tap(...params);
  };
  /**
     * Test if the result satisfies a predicate.
  * Will only test the predicate if the result is Ok.
     */
  Result.satisfies = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.satisfies(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).satisfies(...params);
  };
  /**
     * Test if the result value equals another value.
  * Will only test the equality if the result is Ok.
     */
  Result.valueEquals = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.valueEquals(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).valueEquals(...params);
  };
  /**
     * Map the result value.
  * Will only map the value if the result is Ok.
  * Will always return an Ok result even if the passed value is undefined.
     */
  Result.map = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.map(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).map(...params);
  };
  /**
     * Map the result value.
  * Will only map the value if the result is Ok.
  * Will always return an Ok result even if the passed value is undefined.
     */
  Result.transform = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.transform(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).transform(...params);
  };
  /**
     * Map the result value.
  * Will only map the value if the result is Ok.
  * Will return an Error result if the passed value is undefined.
     */
  Result.expectMap = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.expectMap(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).expectMap(...params);
  };
  /**
     * Map the result value and flatten the result.
  * Will only map the value if the result is Ok.
     */
  Result.flatMap = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.flatMap(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).flatMap(...params);
  };
  /**
     * Returns the result value if it is Ok, otherwise returns the error value.
     */
  Result.merge = (...params) => {
      if (params.length < 1) {
          return (...subParams) => Result.merge(...[...params, ...subParams]);
      }
      const instance = params.splice(0, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).merge(...params);
  };
  /**
     * Rejects the result if the predicate returns true.
  * Will only test the predicate if the result is Ok.
     */
  Result.reject = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.reject(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).reject(...params);
  };
  /**
     * Filters the result if the predicate returns true.
  * Will only test the predicate if the result is Ok.
     */
  Result.filter = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.filter(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).filter(...params);
  };
  /**
     * Match the result type and return a value.
     */
  Result.match = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.match(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).match(...params);
  };
  /**
     * Aborts the excution if the result is an error with an error value.
     */
  Result.abortOnErrorWith = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.abortOnErrorWith(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).abortOnErrorWith(...params);
  };
  /**
     * Tap the error value if result is an error.
     */
  Result.tapError = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.tapError(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).tapError(...params);
  };
  /**
     * Map the error value if result is an error.
     */
  Result.mapError = (...params) => {
      if (params.length < 2) {
          return (...subParams) => Result.mapError(...[...params, ...subParams]);
      }
      const instance = params.splice(1, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).mapError(...params);
  };
  /**
     * Recover the result if it is an error and the predicate returns true.
     */
  Result.recoverWhen = (...params) => {
      if (params.length < 3) {
          return (...subParams) => Result.recoverWhen(...[...params, ...subParams]);
      }
      const instance = params.splice(2, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).recoverWhen(...params);
  };
  /**
     * Aborts the excution if the result is an error.
     */
  Result.abortOnError = (...params) => {
      if (params.length < 1) {
          return (...subParams) => Result.abortOnError(...[...params, ...subParams]);
      }
      const instance = params.splice(0, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).abortOnError(...params);
  };
  /**
     * Converts the result to a asyncronous result.
     */
  Result.asynchronous = (...params) => {
      if (params.length < 1) {
          return (...subParams) => Result.asynchronous(...[...params, ...subParams]);
      }
      const instance = params.splice(0, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).asynchronous(...params);
  };
  /**
     * Converts the result to a promise.
     */
  Result.toPromise = (...params) => {
      if (params.length < 1) {
          return (...subParams) => Result.toPromise(...[...params, ...subParams]);
      }
      const instance = params.splice(0, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).toPromise(...params);
  };
  /**
     * Converts the result to an optional object.
     */
  Result.toOptional = (...params) => {
      if (params.length < 1) {
          return (...subParams) => Result.toOptional(...[...params, ...subParams]);
      }
      const instance = params.splice(0, 1)[0];
      return (instance !== null && instance !== void 0 ? instance : Result.Ok()).toOptional(...params);
  };

  /**
   * A result that is not awaitable.
   * Contrary to the AsyncResult, this result object does not contain
   * a promise that can be awaited.
   * @template T The type of the value of the result
   * @see {@link AsyncResult} for an awaitable result
   * @see {@link Result} for a result that can be both asynchronous and synchronous
   * @example
   * const result = Result
   *  .expect('hello world');
   *
   * const value = result.get(); // 'hello world'
   */
  class SyncResult extends Result {
      get(...args) {
          return returnThis.any.call(this, ...args);
      }
      getOrElse(...args) {
          return returnThis.any.call(this, ...args);
      }
      recover(...args) {
          return returnThis.any.call(this, ...args);
      }
      replace(...args) {
          return returnThis.any.call(this, ...args);
      }
      expectProperty(...args) {
          return returnThis.any.call(this, ...args);
      }
      property(...args) {
          return returnThis.any.call(this, ...args);
      }
      tap(...args) {
          return returnThis.any.call(this, ...args);
      }
      satisfies(...args) {
          return returnThis.any.call(this, ...args);
      }
      valueEquals(...args) {
          return returnThis.any.call(this, ...args);
      }
      map(...args) {
          return returnThis.any.call(this, ...args);
      }
      transform(...args) {
          return returnThis.any.call(this, ...args);
      }
      expectMap(...args) {
          return returnThis.any.call(this, ...args);
      }
      flatMap(...args) {
          return returnThis.any.call(this, ...args);
      }
      merge(...args) {
          return returnThis.any.call(this, ...args);
      }
      reject(...args) {
          return returnThis.any.call(this, ...args);
      }
      filter(...args) {
          return returnThis.any.call(this, ...args);
      }
      match(...args) {
          return returnThis.any.call(this, ...args);
      }
      abortOnErrorWith(...args) {
          return returnThis.any.call(this, ...args);
      }
      tapError(...args) {
          return returnThis.any.call(this, ...args);
      }
      mapError(...args) {
          return returnThis.any.call(this, ...args);
      }
      recoverWhen(...args) {
          return returnThis.any.call(this, ...args);
      }
      abortOnError(...args) {
          return returnThis.any.call(this, ...args);
      }
      asynchronous(...args) {
          return returnThis.any.call(this, ...args);
      }
      toPromise(...args) {
          return returnThis.any.call(this, ...args);
      }
      toOptional(...args) {
          return returnThis.any.call(this, ...args);
      }
  }

  class AbortedClass extends SyncResult {
      constructor(error) {
          super();
          this.isError = true;
          this.isAborted = true;
          this.error = error;
      }
      tapError(λ) {
          return TransformResult(() => λ(this.error), constant(this));
      }
      get() {
          throw this.error;
      }
      getOrElse(value) {
          return value;
      }
      satisfies() {
          return false;
      }
      valueEquals() {
          return false;
      }
      merge() {
          return this.error;
      }
      match(callbacks) {
          return (callbacks.Aborted || throwArgument)(this.error);
      }
      asynchronous() {
          return Result.Pending(Promise.resolve(this));
      }
      toPromise() {
          return Promise.reject(this.error);
      }
      toOptional() {
          return Optional.None();
      }
  }

  class ErrorClass extends SyncResult {
      constructor(error) {
          super();
          this.isError = true;
          this.error = error;
      }
      get() {
          throw this.error;
      }
      getOrElse(value) {
          return value;
      }
      recover(λ) {
          return TransformResult(() => λ(this.error), Result.Ok);
      }
      recoverWhen(predicate, λ) {
          return Result.Ok(this.error)
              .filter(predicate)
              .mapError(constant(this.error))
              .map(λ);
      }
      satisfies() {
          return false;
      }
      valueEquals() {
          return false;
      }
      merge() {
          return this.error;
      }
      match(callbacks) {
          return (callbacks.Error || throwArgument)(this.error);
      }
      tapError(λ) {
          return TransformResult(() => λ(this.error), constant(this));
      }
      mapError(λ) {
          return TransformResult(() => λ(this.error), Result.Error);
      }
      abortOnError() {
          return Result.Aborted(this.error);
      }
      abortOnErrorWith(λOrValue) {
          return TransformResult(() => {
              if (typeof λOrValue === 'function') {
                  return λOrValue(this.error);
              }
              return λOrValue;
          }, Result.Aborted);
      }
      asynchronous() {
          return Result.Pending(Promise.resolve(this));
      }
      toPromise() {
          return Promise.reject(this.error);
      }
      toOptional() {
          return Optional.None();
      }
  }

  class OkClass extends SyncResult {
      constructor(someValue) {
          super();
          this.isOk = true;
          this.value = someValue;
      }
      get() {
          return this.value;
      }
      getOrElse() {
          return this.value;
      }
      replace(value) {
          return TransformResult(constant(value), Result.Ok);
      }
      expectProperty(propertyName) {
          return expect(this.value[propertyName]);
      }
      property(propertyName) {
          return Result.Ok(this.value[propertyName]);
      }
      tap(λ) {
          return TransformResult(() => λ(this.value), constant(this));
      }
      satisfies(predicate) {
          return TransformResult(() => predicate(this.value), Boolean);
      }
      valueEquals(value) {
          return this.value === value;
      }
      map(λ) {
          return TransformResult(() => λ(this.value), Result.Ok);
      }
      transform(λ) {
          return this.map(λ);
      }
      expectMap(λ) {
          return expect(λ(this.value));
      }
      flatMap(λ) {
          return TransformResult(() => λ(this.value), expect);
      }
      merge() {
          return this.value;
      }
      reject(predicate) {
          return TransformResult(() => predicate(this.value), (isTruthy) => (isTruthy
              ? Result.Error()
              : Result.Ok(this.value)));
      }
      filter(predicate) {
          return TransformResult(() => predicate(this.value), (isTruthy) => (isTruthy
              ? Result.Ok(this.value)
              : Result.Error()));
      }
      match(callbacks) {
          return (callbacks.Ok || identity)(this.value);
      }
      asynchronous() {
          return Result.Pending(Promise.resolve(this));
      }
      toPromise() {
          return Promise.resolve(this.value);
      }
      toOptional() {
          return Optional.Some(this.value);
      }
  }

  /**
   * A result that can be awaited.
   * Contrary to the SyncResult, this result object contains
   * a promise that can be awaited. When used, the entire current
   * chain of result will be converted to AsyncResult.
   * @template T The type of the value of the result
   * @see {@link SyncResult} for a synchronous version of this class
   * @see {@link Result} for a result that can be both asynchronous and synchronous
   * @example
   * const result = Result
   *  .expect(Promise.resolve('hello world'))
   *  .toPromise();
   *
   * const value = await result; // 'hello world'
   */
  class AsyncResult extends Result {
  }

  class PendingClass extends AsyncResult {
      constructor(promise) {
          super();
          this.isAsynchronous = true;
          this.promise = PendingClass.FindNextNonPending(promise);
          this.makePropertyNonEnumerable('isOk');
          this.makePropertyNonEnumerable('isError');
          this.makePropertyNonEnumerable('isAborted');
      }
      get() {
          return this.toPromise();
      }
      getOrElse(value) {
          return pipe(this.callWrappedResultMethod('getOrElse'), property('promise'))(value);
      }
      recover(λ) {
          return this.callWrappedResultMethod('recover')(λ);
      }
      replace(value) {
          return this.callWrappedResultMethod('replace')(value);
      }
      expectProperty(propertyName) {
          return this.callWrappedResultMethod('expectProperty')(propertyName);
      }
      property(propertyName) {
          return this.callWrappedResultMethod('property')(propertyName);
      }
      tap(λ) {
          return this.callWrappedResultMethod('tap')(λ);
      }
      satisfies(predicate) {
          return pipe(this.callWrappedResultMethod('satisfies'), property('promise'))(predicate);
      }
      valueEquals(value) {
          return pipe(this.callWrappedResultMethod('valueEquals'), property('promise'))(value);
      }
      map(λ) {
          return this.callWrappedResultMethod('map')(λ);
      }
      transform(λ) {
          return this.map(λ);
      }
      expectMap(λ) {
          return this.callWrappedResultMethod('expectMap')(λ);
      }
      flatMap(λ) {
          return this.callWrappedResultMethod('flatMap')(λ);
      }
      merge() {
          return pipe(this.callWrappedResultMethod('merge'), property('promise'))();
      }
      reject(predicate) {
          return this.callWrappedResultMethod('reject')(predicate);
      }
      filter(predicate) {
          return this.callWrappedResultMethod('filter')(predicate);
      }
      match(callbacks) {
          return pipe(this.callWrappedResultMethod('match'), property('promise'))(callbacks);
      }
      abortOnErrorWith(λOrValue) {
          return this.callWrappedResultMethod('abortOnErrorWith')(λOrValue);
      }
      tapError(λ) {
          return this.callWrappedResultMethod('tapError')(λ);
      }
      mapError(λ) {
          return this.callWrappedResultMethod('mapError')(λ);
      }
      recoverWhen(predicate, λ) {
          return this.callWrappedResultMethod('recoverWhen')(predicate, λ);
      }
      abortOnError() {
          return this.callWrappedResultMethod('abortOnError')();
      }
      asynchronous() {
          return returnThis.nullary.call(this);
      }
      toPromise() {
          return this.promise.then(Result.toPromise);
      }
      toOptional() {
          return pipe(this.callWrappedResultMethod('toOptional'), property('promise'))();
      }
      /**
       * Calls a method on the wrapped result.
       * if the promise is rejected, the result will be aborted.
       * @param methodName The name of the method to call on the wrapped result
       * @returns A function that calls the method on the wrapped result
       * @example
       * const pending = Result.Pending(Result.Ok(1));
       * const method = pending.callWrappedResultMethod('get'); // Returns a function that calls Result.Ok(1).get()
       * const result = method(); // Returns 1
       */
      callWrappedResultMethod(methodName) {
          return (...parameters) => Result.Pending(this
              .promise
              .then(Result[methodName](...parameters))
              .catch(Result.Aborted));
      }
      ;
      /**
       * Makes a property non enumerable
       * @param propertyName The name of the property to make non enumerable
       * @throws {Exception} If the property is accessed
       */
      makePropertyNonEnumerable(propertyName) {
          Object.defineProperty(this, propertyName, {
              enumerable: false,
              get: () => {
                  throw new Exception(`Cannot access '${propertyName}' of Result.Pending`);
              },
          });
      }
      /**
       * Finds the next non-pending result in a promise chain
       * @param promise The promise to unwrap
       * @returns The unwrapped promise
       * @example
       * const pending = Result.Pending(
       *  Result.Pending(
       *    Promise.resolve(
       *      'Hello World'
       *    )
       *  )
       * );
       * const result = await FindNextNonPending(pending.promise); // Returns 'Hello World'
       */
      static FindNextNonPending(promise) {
          return __awaiter(this, void 0, void 0, function* () {
              const result = yield promise;
              if (isAsyncResult(result) && result instanceof PendingClass) {
                  return PendingClass.FindNextNonPending(result.promise);
              }
              return result;
          });
      }
  }

  /**
   * Patch the function prototypes to inherit from their respective
   * Class prototypes
   */
  function patchFactoryFunctions() {
      patchPrototype(Ok, OkClass);
      patchPrototype(Error$1, ErrorClass);
      patchPrototype(Aborted, AbortedClass);
      patchPrototype(Pending, PendingClass);
  }
  const Aborted = function makeAborted(message) {
      return instantiateWithFactory(AbortedClass, Aborted, message);
  };
  const Error$1 = function makeError(message) {
      return instantiateWithFactory(ErrorClass, Error$1, message);
  };
  const Ok = function makeOk(value) {
      return instantiateWithFactory((OkClass), Ok, value);
  };
  const Pending = function makePending(promise) {
      return instantiateWithFactory((PendingClass), Pending, promise);
  };
  patchFactoryFunctions();

  function addStaticProperties() {
      Result.Ok = Ok;
      Result.Error = Error$1;
      Result.Aborted = Aborted;
      Result.Pending = Pending;
  }
  addStaticProperties();

  /**
   * Return a constructor for a new error type.
   *
   * @function createErrorType
   *
   * @param initialize A function that gets passed the constructed error and the passed message and
   *                              runs during the construction of new instances.
   * @param ErrorClass An error class you wish to subclass. Defaults to Error.
   * @param prototype Additional properties and methods for the new error type.
   *
   * @return The constructor for the new error type.
   */
  function createErrorType(initialize, ErrorClass, prototype) {
      ErrorClass ?? (ErrorClass = Error);
      let Constructor = function (...data) {
          let error = Object.create(Constructor.prototype);
          error.stack = (new Error).stack;
          if (initialize) {
              initialize(error, ...data);
          }
          return error;
      };
      Constructor.prototype = Object.create(ErrorClass.prototype);
      if (prototype) {
          Object.assign(Constructor.prototype, prototype);
      }
      return Constructor;
  }
  const NextCloudException = createErrorType(function nextCloudError(error, message, subError) {
      error.message = message;
      if (subError) {
          error.message += `: ${subError.message}`;
          error.stack = subError.stack;
      }
  });
  const NextCloudServerException = createErrorType(function nextCloudError(error, message, subError) {
      error.message = message;
      if (subError) {
          error.message += `: ${subError.message}`;
          error.stack = subError.stack;
      }
  }, NextCloudException);
  const NextCloudClientException = createErrorType(function nextCloudError(error, message, subError) {
      error.message = message;
      if (subError) {
          error.message += `: ${subError.message}`;
          error.stack = subError.stack;
      }
  }, NextCloudException);
  const ForbiddenError = createErrorType(function forbiddenErrorConstructor(error, path) {
      error.message = `Access to ${path} was denied`;
  }, NextCloudServerException);
  const NotFoundError = createErrorType(function notFoundErrorConstructor(error, path) {
      error.message = `${path} not found!`;
  }, NextCloudServerException);
  const NotReadyError = createErrorType(function notReadyErrorConstructor(error) {
      error.message = 'The Nextcloud instance is initializing…';
  }, NextCloudServerException);
  const UnreachableError = createErrorType(function notReadyErrorConstructor(error) {
      error.message = 'The Nextcloud instance is unreachable…';
  }, NextCloudServerException);
  const IncorrectPathTypeError = createErrorType(function incorrectPathTypeErrorConstructor(error, options) {
      const { path, type } = options;
      error.message = `The path '${path}' is not a ${type}`;
  }, NextCloudServerException);
  const ConflictError = createErrorType(function conflictErrorConstructor(error, path) {
      error.message = `Conflict on ${path}`;
  }, NextCloudServerException);
  const OcsError = createErrorType(function ocsErrorConstructor(error, options) {
      const { message, identifier, reason, statusCode } = options;
      const id = (identifier ? ` '${identifier}'` : '');
      error.name = 'OcsError';
      error.message = `${message}${id}: ${reason}`;
      if (statusCode) {
          error.statusCode = statusCode;
      }
  }, NextCloudServerException);
  const BadArgumentError = createErrorType(function badArgumentErrorConstructor(error, message) {
      error.message = message;
  }, NextCloudClientException);

  // prefer whitelist over blacklist (or looping over all functions)
  //   - less likely to break
  const WRAPPED_FUNCTIONS = [
      ['copyFile', 0],
      ['createDirectory', 0],
      ['createReadStream', 0],
      ['createWriteStream', 0],
      ['customRequest', 0],
      ['deleteFile', 0],
      ['exists', 0],
      ['getDirectoryContents', 0],
      ['getFileContents', 0],
      ['getFileDownloadLink', 0],
      ['getFileUploadLink', 0],
      ['getHeaders', -1],
      ['getQuota', -1],
      ['lock', 0],
      ['moveFile', 0],
      ['putFileContents', 0],
      ['setHeaders', -1],
      ['stat', 0],
      ['unlock', 0]
  ];
  /**
   * Wraps a WebDAVClient to throw NextcloudErrors instead of WebDAVClientError.
   * @param client The client to wrap.
   * @returns The wrapped client.
   *
   * @note This function mutates the client.
   * @note This function is idempotent.
   */
  function wrapClient(client) {
      if (client['__ns_wrapped_client__']) {
          return client;
      }
      client['__ns_wrapped_client__'] = true;
      WRAPPED_FUNCTIONS.forEach(([fnName, pathPosition]) => {
          const originalFn = client[fnName];
          client[fnName] = async (...args) => {
              try {
                  return await originalFn.apply(client, args);
              }
              catch (error) {
                  throw wrapError(error, pathPosition === -1 ? undefined : args[pathPosition]);
              }
          };
      });
      return client;
  }
  /**
   * Wraps a WebDAVClientError to throw NextcloudErrors instead.
   * @param error The error to wrap.
   * @param path The path of the operation that failed.
   * @returns The wrapped error.
   */
  function wrapError(error, path) {
      if (!isWebDavError(error)) {
          return error;
      }
      if (isNotFoundError(error)) {
          return new NotFoundError(path);
      }
      if (isForbiddenError(error)) {
          return new ForbiddenError(path);
      }
      if (isConflictError(error)) {
          return new ConflictError(path);
      }
      return new NextCloudServerException('A WebDav Error occured', error);
  }
  /**
   * Checks if the given error is a WebDAVClientError.
   * @param error The error to check.
   * @returns True if the error is a WebDAVClientError.
   */
  function isWebDavError(error) {
      return error && (error.response || error.status);
  }
  /**
   * Checks if the given error is a NotFoundError.
   * @param error The error to check.
   * @returns True if the error is a NotFoundError.
   */
  function isNotFoundError(error) {
      return error.status === 404;
  }
  /**
   * Checks if the given error is a ForbiddenError.
   * @param error The error to check.
   * @returns True if the error is a ForbiddenError.
   */
  function isForbiddenError(error) {
      return error.status === 403;
  }
  /**
   * Checks if the given error is a ConflictError.
   * @param error The error to check.
   * @returns True if the error is a ConflictError.
   */
  function isConflictError(error) {
      return error.status === 409;
  }

  /**
   * All known namespaces and their elements that are used in the Nextcloud WebDAV API.
   * @see https://docs.nextcloud.com/server/latest/developer_manual/client_apis/WebDAV/basic.html#supported-properties
   */
  const NAMESPACES = [
      {
          short: "d",
          full: "DAV:",
          elements: [
              "creationdate",
              "getlastmodified",
              "getetag",
              "getcontenttype",
              "resourcetype",
              "getcontentlength",
              "getcontentlanguage",
              "displayname",
              "lockdiscovery",
              "supportedlock",
          ]
      },
      {
          short: "oc",
          full: "http://owncloud.org/ns",
          elements: [
              "id",
              "fileid",
              "downloadURL",
              "permissions",
              "size",
              "quota-used-bytes",
              "quota-available-bytes",
              "tags",
              "favorite",
              "comments-href",
              "comments-count",
              "comments-unread",
              "owner-id",
              "owner-display-name",
              "share-types",
              "checksums",
              "has-preview",
              "rich-workspace-file",
              "rich-workspace",
          ]
      },
      {
          short: "nc",
          full: "http://nextcloud.org/ns",
          elements: [
              "creation_time",
              "mount-type",
              "is-encrypted",
              "share-attributes",
              "sharees",
              "share-permissions",
              "acl-enabled",
              "acl-can-manage",
              "acl-list",
              "inherited-acl-list",
              "group-folder-id",
              "lock",
              "lock-owner-type",
              "lock-owner",
              "lock-owner-displayname",
              "lock-owner-editor",
              "lock-time",
              "lock-timeout",
              "lock-token",
              "contained-folder-count",
              "contained-file-count",
              "data-fingerprint",
              "upload_time",
              "note",
          ]
      },
      {
          short: "ocs",
          full: "http://open-collaboration-services.org/ns",
          elements: [
              "share-permissions",
          ]
      },
      {
          short: "ocm",
          full: "http://open-cloud-mesh.org/ns",
          elements: [
              "share-permissions",
          ]
      },
  ];
  const SHORT_CODE_TO_NAMESPACE = NAMESPACES
      .reduce((acc, namespace) => {
      acc[namespace.short] = namespace;
      return acc;
  }, {});
  function createDetailProperty(namespace, element, defaultValue) {
      if (!SHORT_CODE_TO_NAMESPACE[namespace]) {
          throw new BadArgumentError(`Unknown namespace shortcode: ${namespace}`);
      }
      return {
          namespaceShort: namespace,
          namespace: SHORT_CODE_TO_NAMESPACE[namespace].full,
          element,
          default: defaultValue
      };
  }
  /**
   * Converts a list of detail properties to an XML string.
   * @param details The prperties to convert to XML
   * @returns An XML string
   *
   * @note This is used internally by the client, but is exposed for use with the `propfind` method.
   * @see https://docs.nextcloud.com/server/latest/developer_manual/client_apis/WebDAV/basic.html#requesting-properties
   *
   * @example
   * const details = [
   * createDetailProperty('oc', 'fileid'),
   * createDetailProperty('oc', 'permissions'),
   * ];
   *
   * const xml = fileDetailsToXMLString(details);
   * // `<?xml version="1.0" encoding="UTF-8"?><d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns"><d:prop><oc:fileid /><oc:permissions /></d:prop></d:propfind>`
   */
  function fileDetailsToXMLString(details) {
      const namespaces = [
          ...new Set(details
              .map(detail => detail.namespaceShort)
              .concat('d'))
      ]
          .map(short => `xmlns:${short}="${SHORT_CODE_TO_NAMESPACE[short].full}"`);
      const elements = details.map(detail => `<${detail.namespaceShort}:${detail.element} />`);
      return `<?xml version="1.0" encoding="UTF-8"?><d:propfind ${namespaces.join(' ')}><d:prop>${elements.join('\n')}</d:prop></d:propfind>`;
  }

  const defaultProperties = [
      createDetailProperty("d", "creationdate"),
      createDetailProperty("d", "getlastmodified"),
      createDetailProperty("d", "getetag"),
      createDetailProperty("d", "resourcetype"),
      createDetailProperty("d", "getcontentlength"),
      createDetailProperty("d", "getcontenttype"),
      createDetailProperty("oc", "fileid"),
      createDetailProperty("oc", "owner-id"),
  ];
  /**
   * A WebDAV client for specific for Nextcloud instances.
   * @param url The url to the Nextcloud instance.
   * @param options Optional options for the client.
   */
  class WebDavClient {
      // Empty private constructor to prevent instantiation
      constructor() { }
      /**
       * WebDAV client factory method. Creates a new WebDAV client for the given url.
       *
       * @param url The url to the Nextcloud instance.
       * @param options Optional options for the client.
       */
      static async create(url, options = {}) {
          const thisClient = new WebDavClient();
          thisClient.root = nextCloudPath(options.username);
          thisClient.client = await thisClient.loadClient(url, options);
          return thisClient;
      }
      async loadClient(url, options = {}) {
          // We need to use dynamic imports here since the webdav package only works in esm.
          // We also need to use the `Function` constructor since the `import` keyword is compiled to `require` by typescript.
          const webDav = await Function('return import("webdav");')();
          if (!webDav) {
              throw new Error("Could not load webdav package");
          }
          return wrapClient(webDav.createClient(nextcloudRoot(url, this.root), options));
      }
      /**
       * Returns the path to the root url.
       */
      getPath() {
          return this.root;
      }
      /**
       * Checks whether the client is ready.
       * @returns A promise that connects to the server.
       *
       * @example
       * checkConnectivity()
       *    .then(() => console.log('Connected'))
       *    .catch((error) => console.error(error));
       */
      async checkConnectivity() {
          return Result.fromPromise(this.client.getDirectoryContents("/"))
              .map(Boolean)
              .getOrElse(false);
      }
      /**
       * Checks whether the given path exists on the server.
       * @param path The path to the file or folder
       * @param options Optional options for the method. See the [WebDAVMethodOptions](https://www.npmjs.com/package/webdav/v/4.11.2#method-options) interface for more information.
       * @returns
       * - `true` if the path exists
       * - `false` if the path does not exist
       *
       * @example
       * exists('/foo/bar')
       *  .then((exists) => console.log(exists))
       */
      async exists(path, options = {}) {
          return Result.fromPromise(this.client.exists(path, options))
              .recover(() => false)
              .toPromise();
      }
      /**
       *
       * @param path The path to the file or folder
       * @param options Optional options for the method.
       * @returns A promise that creates the directory.
       *
       * @throws {NextcloudError} If an error occurs.
       *
       * @example
       * touchFolder('/foo/bar')
       *  .then(() => console.log('Folder created'))
       *  .catch((error) => console.error(error));
       */
      async touchFolder(path, options = { recursive: true }) {
          return Result.fromPromise(this.exists(path))
              .reject(Boolean)
              .expectMap(() => this.client.createDirectory(path, options))
              .map(() => true)
              .recover(() => false)
              .toPromise();
      }
      /**
       * Renames a file or folder.
       * @param path The path to the file or folder
       * @param newName The new name of the file or folder
       * @param options Optional options for the method. See the [WebDAVMethodOptions](https://www.npmjs.com/package/webdav/v/4.11.2#method-options) interface for more information.
       * @returns A promise that renames the file or folder.
       *
       * @throws {NextcloudError} If an error occurs.
       *
       * @example
       * rename('/foo/bar', 'baz') // Renames the folder /foo/bar to /foo/baz
       *  .then(() => console.log('Renamed'))
       *  .catch((error) => console.error(error));
       */
      async rename(path, newName, options = {}) {
          const basePath = Optional.fromNullable(path)
              .reject((path) => path === "")
              .map((path) => path.slice(0, path.lastIndexOf("/") + 1));
          const newPath = Optional.fromNullable(newName)
              .reject((path) => path === "")
              .flatMap((newName) => basePath.map((basePath) => basePath + newName));
          return Result.expect(newPath)
              .abortOnErrorWith(() => new BadArgumentError("New name must not be empty."))
              .map((newPath) => this.move(path, newPath, options))
              .toPromise();
      }
      /**
       * Moves a file or folder.
       * @param path The path to the file or folder
       * @param destination The destination path
       * @param options Optional options for the method. See the [WebDAVMethodOptions](https://www.npmjs.com/package/webdav/v/4.11.2#method-options) interface for more information.
       * @returns A promise that moves the file or folder.
       *
       * @throws {NextcloudError} If an error occurs.
       *
       * @example
       * move('/foo/bar', '/bar/foo') // Moves the folder /foo/bar to /bar/foo
       *  .then(() => console.log('Moved'))
       *  .catch((error) => console.error(error));
       */
      async move(path, destination, options = {}) {
          return this.client.moveFile(path, destination, options);
      }
      /**
       * Deletes a file or folder.
       * @param path The path to the file or folder
       * @param options Optional options for the method. See the [WebDAVMethodOptions](https://www.npmjs.com/package/webdav/v/4.11.2#method-options) interface for more information.
       * @returns A promise that deletes the file or folder.
       *
       * @throws {NextcloudError} If an error occurs.
       * @throws {NotFoundError} If the file or folder does not exist.
       *
       * @example
       * remove('/foo/bar') // Deletes the folder /foo/bar
       *    .then(() => console.log('Deleted'))
       *    .catch((error) => console.error(error));
       */
      async remove(path, options = {}) {
          return this.client.deleteFile(path, options);
      }
      /**
       *
       * @param path The path to the file or folder
       * @param content The content to write to the file
       * @param options Optional options for the method. See the [PutFileContentsOptions](https://www.npmjs.com/package/webdav/v/4.11.2#user-content-putfilecontents) interface for more information.
       * @returns A promise that writes the content to the file.
       *  `true` if the file was written.
       *  `false` otherwise.
       */
      async put(path, content, options) {
          return this.client.putFileContents(path, content, options);
      }
      /**
       * Gets the content of a file.
       * @param path The path to the file
       * @param options The options for the method. See the [GetFileContentsOptions](https://www.npmjs.com/package/webdav/v/4.11.2#user-content-getfilecontents) interface for more information.
       * @returns A promise that gets the content of the file.
       */
      async get(path, options) {
          return this.client.getFileContents(path, options);
      }
      /**
       * Creates a folder at the given path. Nested or non-existent folders will be created.
       * @param path The path to the file or folder
       * @returns A promise that creates the folder.
       *
       * @deprecated Use `touchFolder` instead.
       * @example
       *
       * createFolder('/foo/bar') // Creates the folder /foo/bar
       */
      async createFolderHierarchy(path) {
          return this.touchFolder(path, { recursive: true });
      }
      async getFilesDetailed(path, options = {}) {
          const formattedOptions = formatOptions(options);
          return Result.fromPromise(this.client.getDirectoryContents(path, formattedOptions))
              .map((result) => {
              if (isDetailedResult(result)) {
                  result.data = result.data.map((file) => ({
                      ...file,
                      props: setDefaults(file, formattedOptions.properties),
                  }));
              }
              else {
                  result = result.map((file) => ({
                      ...file,
                      props: setDefaults(file, formattedOptions.properties),
                  }));
              }
              return result;
          })
              .toPromise();
      }
      /**
       * Get all files and folders in the given folder.
       * @param path The path to the file or folder
       * @returns A promise that gets all files and folders in the given folder.
       *
       * @throws {NextcloudError} If an error occurs.
       * @throws {NotFoundError} If the folder does not exist.
       *
       * @deprecated Use `getFilesDetailed` instead.
       *
       * @example
       * getFiles('/foo/bar') // Gets all files and folders in /foo/bar
       */
      async getFiles(path) {
          return Result.fromPromise(this.getFilesDetailed(path, { details: false }))
              .map((files) => files.map((file) => file.basename))
              .toPromise();
      }
      /**
       * Get all file and folder details in the given folder.
       * @param path The path to the file or folder
       * @returns A promise that gets all files and folders in the given folder.
       *
       * @throws {NextcloudError} If an error occurs.
       * @throws {NotFoundError} If the folder does not exist.
       *
       * @deprecated Use `getFilesDetailed` instead.
       *
       * @example
       * getFolderFileDetails('/foo/bar') // Gets all files and folders in /foo/bar
       */
      async getFolderFileDetails(path, extraProperties) {
          return Result.fromPromise(this.getFilesDetailed(path, {
              details: true,
              properties: extraProperties,
          }))
              .map((files) => files.data)
              .map((files) => files.map((file) => ({
              ...file,
              isFile: file.type === "file",
              isDirectory: file.type === "directory",
              lastModified: file.lastmod,
              href: `${this.root}${path}/${file.basename}`,
              name: file.basename,
              extraProperties: (file.props || {}),
          })))
              .toPromise();
      }
      async getPathInfo(path, options = {}) {
          const formattedOptions = formatOptions(options);
          return Result.fromPromise(this.client.stat(path, formattedOptions))
              .map((result) => {
              if (isDetailedResult(result)) {
                  result.data.props = setDefaults(result.data, formattedOptions.properties);
              }
              else {
                  result.props = setDefaults(result, formattedOptions.properties);
              }
              return result;
          })
              .toPromise();
      }
      /**
       * Get the details of a file or folder.
       * @param path The path to the file or folder
       * @param extraProperties The extra properties to get
       * @returns A promise that gets the details of the file or folder.
       *
       * @deprecated Use `getPathInfo` instead.
       */
      async getFolderProperties(path, extraProperties) {
          const res = await this.getPathInfo(path, {
              details: true,
              properties: extraProperties,
          });
          const data = Result.expect(res.data)
              .map((data) => ({
              ...data,
              ...extraProperties.reduce((acc, curr) => ({
                  ...acc,
                  [`${curr.namespaceShort}:${curr.element}`]: data.props[curr.element],
              }), {}),
          }))
              .getOrElse(res.data);
          return data;
      }
      /**
       * Get a read stream for a file.
       * @param path The path to the file or folder
       * @param options Optional options for the method.
       * @returns A promise which returns a read stream.
       *
       * @note Although the stream is returned immediately, the stream will only start downloading once the stream is connected to a destination.
       */
      async getReadStream(path, options) {
          const readStream = new PassThrough();
          await this.get(path, { details: false });
          const remoteReadStream = await this.client.createReadStream(path, options);
          remoteReadStream.pipe(readStream);
          remoteReadStream.on("error", (err) => readStream.emit("error", wrapError(err, path)));
          return readStream;
      }
      /**
       * Get a write stream for a file.
       * @param path The path to the file or folder
       * @param options Optional options for the method.
       * @returns A promise which returns a write stream.
       *
       * @note Although the stream is returned immediately, the stream will only start uploading once the stream is connected to a destination.
       * @note The write stream will only start uploading once the stream is closed.
       * @note The write stream will emit a `finished` event once the upload has finished.
       */
      async getWriteStream(path, options) {
          const writeStream = new PassThrough();
          const { overwrite = false, ...otherOptions } = options ?? {};
          await this.put(path, "", { overwrite, ...otherOptions });
          this.put(path, writeStream, { overwrite, ...otherOptions })
              .then(() => options?.onFinished())
              .catch((err) => writeStream.emit("error", wrapError(err)));
          return writeStream;
      }
      /**
       * Upload to a file from a stream.
       * @param path The path to the file
       * @param readStream The read stream to upload
       * @returns A promise that uploads the given stream to the given path.
       */
      async uploadFromStream(path, readStream) {
          return new Promise(async (resolve, reject) => {
              try {
                  const writeStream = await this.getWriteStream(path, {
                      overwrite: true,
                      onFinished: () => resolve(),
                  });
                  writeStream.on("error", (err) => reject(err));
                  return await pipeStreams(readStream, writeStream);
              }
              catch (err) {
                  reject(err);
              }
          });
      }
      /**
       * Download a file to a stream.
       * @param path The path to the file
       * @param writeStream The write stream to download to
       * @returns A promise that downloads the given path to the given stream.
       */
      async downloadToStream(path, writeStream) {
          const readStream = await this.getReadStream(path);
          await pipeStreams(readStream, writeStream);
      }
  }
  /**
   * Returns the root URL for the Nextcloud instance
   * @param url The Nextcloud instance URL
   * @param username The Nextcloud username
   * @returns The root URL for the Nextcloud instance
   * @private
   *
   * @example
   * nextcloudRoot('https://example.com/nextcloud', 'jack');
   * // => 'https://example.com/nextcloud/remote.php/dav/files/jack/'
   */
  function nextcloudRoot(url, path) {
      const urlNoTrailingSlash = url.trimEnd().replace(/\/$/, "");
      const pathNoLeadingSlash = path.trimStart().replace(/^\//, "");
      return `${urlNoTrailingSlash}/${pathNoLeadingSlash}`;
  }
  function nextCloudPath(username) {
      return `/remote.php/dav/files/${username}`;
  }
  function formatOptions(options) {
      if (!options || !options.details) {
          return options;
      }
      const props = defaultProperties.concat(options.properties ?? []);
      const data = !options.data
          ? Result.expect(props)
              .filter((properties) => properties.length > 0)
              .map((properties) => fileDetailsToXMLString(properties))
              .getOrElse(options.data)
          : options.data;
      return {
          ...options,
          data: data,
          properties: props,
      };
  }
  /**
   * Sets the defaults for the given result
   * @param result The result to set the defaults for
   * @param props The properties to set the defaults for
   * @returns The result with the defaults set
   */
  function setDefaults(result, props) {
      return {
          ...props?.reduce((acc, curr) => ({
              ...acc,
              [curr.element]: curr.default,
          }), {}),
          ...result.props,
      };
  }
  /**
   * Checks if the given result is a detailed result
   * @param result The result to check
   * @returns Whether the result is a detailed result
   */
  function isDetailedResult(result) {
      return result.hasOwnProperty("data") && result.hasOwnProperty("status");
  }
  /**
   * Pipes a read stream to a write stream
   * @param readStream The read stream
   * @param writeStream The write stream
   * @returns A promise that resolves when the streams have been piped
   */
  async function pipeStreams(readStream, writeStream) {
      return new Promise((resolve, reject) => {
          readStream.on("error", fail);
          writeStream.on("error", fail);
          // event from WebDav.Stream's deprecated request in case of uploadFromStream
          writeStream.on("end", resolve);
          // event from Node.js write stream in case of downloadToStream
          writeStream.on("close", resolve);
          readStream.pipe(writeStream);
          function fail(error) {
              reject(wrapError(error));
          }
      });
  }

  async function getCreatorByPath(path) {
      const self = this;
      let result = null;
      try {
          const folderProperties = await self.getPathInfo(path, {
              details: true,
              properties: [
                  createDetailProperty('oc', 'fileid')
              ]
          });
          const fileId = folderProperties.data.props.fileid;
          result = await self.getCreatorByFileId(fileId);
      }
      catch {
          result = Promise.reject(new NotFoundError(`Unable to find the creator for '${path}'`));
      }
      return result;
  }
  async function getCreatorByFileId(fileId) {
      const self = this;
      let result = null;
      try {
          const activities = await self.activities.get(fileId, 'asc', 1);
          const fileCreatedActivity = activities
              .find(activity => activity.type === 'file_created');
          result = fileCreatedActivity.user;
      }
      catch {
          result = Promise.reject(new NotFoundError(`Unable to find the creator for fileId '${fileId}'`));
      }
      return result;
  }

  var OcsShareType;
  (function (OcsShareType) {
      OcsShareType[OcsShareType["user"] = 0] = "user";
      OcsShareType[OcsShareType["group"] = 1] = "group";
      OcsShareType[OcsShareType["publicLink"] = 3] = "publicLink";
      OcsShareType[OcsShareType["federatedCloudShare"] = 6] = "federatedCloudShare";
  })(OcsShareType || (OcsShareType = {}));
  var OcsSharePermissions;
  (function (OcsSharePermissions) {
      OcsSharePermissions[OcsSharePermissions["default"] = -1] = "default";
      OcsSharePermissions[OcsSharePermissions["read"] = 1] = "read";
      OcsSharePermissions[OcsSharePermissions["update"] = 2] = "update";
      OcsSharePermissions[OcsSharePermissions["create"] = 4] = "create";
      OcsSharePermissions[OcsSharePermissions["delete"] = 8] = "delete";
      OcsSharePermissions[OcsSharePermissions["share"] = 16] = "share";
      OcsSharePermissions[OcsSharePermissions["all"] = 31] = "all";
  })(OcsSharePermissions || (OcsSharePermissions = {}));

  function rejectWithOcsError(error, errorInfo) {
      let reason = error.message;
      let statusCode = '';
      if ((errorInfo.expectedErrorCodes === undefined ||
          errorInfo.expectedErrorCodes.includes(error.code)) && ((errorInfo.useMeta && error.meta && error.meta.statuscode) ||
          !errorInfo.useMeta)) {
          statusCode = (errorInfo.useMeta ? error.meta.statuscode : error.code);
          reason = (errorInfo.useMeta ? error.meta.message : reason);
          if (errorInfo.customErrors && errorInfo.customErrors.hasOwnProperty(statusCode)) {
              reason = errorInfo.customErrors[statusCode];
          }
      }
      return Promise.reject(new OcsError({
          reason,
          statusCode,
          message: errorInfo.message,
          identifier: errorInfo.identifier
      }));
  }
  function assignDefined(target, ...sources) {
      for (const source of sources) {
          for (const key of Object.keys(source)) {
              const val = source[key];
              if (val !== undefined) {
                  target[key] = val;
              }
          }
      }
  }
  function ocsSharePermissionsToText(permissions) {
      if (permissions === OcsSharePermissions.default) {
          return '';
      }
      if (permissions === OcsSharePermissions.all) {
          return 'all';
      }
      const result = [];
      Object.keys(OcsSharePermissions).forEach(key => {
          if (OcsSharePermissions[key] !== OcsSharePermissions.default && OcsSharePermissions[key] !== OcsSharePermissions.all) {
              if ((permissions & OcsSharePermissions[key]) === OcsSharePermissions[key]) {
                  result.push(key);
              }
          }
      });
      return result.join('|');
  }
  /**
   * Promisify a function that takes a callback as its last parameter
   * @param fn The function to promisify
   * @returns A function that returns a promise
   *
   * @note This is a simple replacement for the `promisify` function from the `util` package which is not available in the browser (unless you polyfill it)
   */
  function promisify(fn) {
      return function (...args) {
          const self = this;
          return new Promise((resolve, reject) => {
              fn.call(self, ...args, function (err, res) {
                  if (err) {
                      reject(err);
                  }
                  else {
                      resolve(res);
                  }
              });
          });
      };
  }

  /**
   * Request wrapper.
   * @note Wrapper around axios to make it easier to use.
   */
  function req(options, callback) {
      axios({
          method: 'GET',
          validateStatus: () => true,
          ...options
      })
          .then(async (response) => {
          callback(null, response, response?.data);
      })
          .catch((error) => {
          callback(error, null, null);
      });
  }

  const baseUrl$4 = 'ocs/v2.php/apps/activity/api/v2/activity';
  function ocsGetActivities(fileId, sort, limit, sinceActivityId, callback) {
      const self = this;
      const params = {
          format: 'json',
          object_type: 'files',
          object_id: fileId,
          sort: (sort === 'asc' ? 'asc' : 'desc')
      };
      if (limit > 0) {
          params['limit'] = limit;
      }
      if (sinceActivityId > 0) {
          params['since'] = sinceActivityId;
      }
      const urlParams = new URLSearchParams(params)
          .toString();
      req({
          url: `${self.options.url}/${baseUrl$4}/filter?${urlParams}`,
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let activities = [];
              if (!error && body && body.data && body.data.length > 0) {
                  body.data.forEach(activity => {
                      activities.push({
                          activityId: parseInt(activity.activity_id, 10),
                          app: activity.app,
                          type: activity.type,
                          user: activity.user,
                          subject: activity.subject,
                          subjectRich: activity.subject_rich,
                          message: activity.message,
                          messageRich: activity.message_rich,
                          objectType: activity.object_type,
                          fileId: activity.objectId,
                          objectName: activity.object_name,
                          objects: activity.objects,
                          link: activity.link,
                          icon: activity.icon,
                          datetime: activity.datetime
                      });
                  });
              }
              callback(error, activities);
          });
      });
  }

  class OcsConnection {
      constructor(options) {
          if (options.constructor === String) {
              // tslint:disable-next-line: no-parameter-reassignment
              options = { url: options };
          }
          this.options = options;
          if (this.options.url.lastIndexOf('/') === this.options.url.length - 1) {
              this.options.url = this.options.url.substring(0, this.options.url.length - 1);
          }
      }
      getHeader(withBody) {
          const credentials = Buffer.from(`${this.options.username}:${(this.options.password ? this.options.password : '')}`).toString('base64');
          const header = {
              'Content-Type': (withBody ? 'application/json' : 'application/x-www-form-urlencoded'),
              'OCS-APIRequest': 'true',
              Accept: 'application/json',
              Authorization: `Basic ${credentials}`
          };
          return header;
      }
      isValidResponse(body) {
          return (body && body.ocs && body.ocs.meta);
      }
      request(error, response, body, callback) {
          if (error) {
              callback(error, null);
              return;
          }
          let jsonBody;
          if (typeof body === 'object') {
              jsonBody = body;
          }
          else {
              try {
                  jsonBody = JSON.parse(body || '{}');
              }
              catch {
                  callback({
                      code: 500,
                      message: 'Unable to parse the response body as valid JSON.'
                  });
              }
          }
          if (response.status !== 200) {
              callback({
                  code: response.status,
                  message: response.statusText,
                  meta: (this.isValidResponse(jsonBody) ? jsonBody.ocs.meta : null)
              }, null);
              return;
          }
          if (this.isValidResponse(jsonBody)) {
              // Response is well-formed
              callback(null, jsonBody.ocs);
          }
          else {
              // Server said everything's fine but response is malformed
              callback({
                  code: 500,
                  message: 'The server said everything was fine but returned a malformed body. This should never happen.'
              });
          }
      }
  }

  const baseUrl$3 = 'ocs/v2.php/cloud/users';
  function ocsGetUser(userId, callback) {
      const self = this;
      const urlParams = new URLSearchParams({
          format: 'json'
      }).toString();
      // fetch(`${self.options.url}/${baseUrl}/${userId}?${urlParams}`, {
      //   headers: self.getHeader()
      // })
      //   .then((response) => {
      //     response.text()
      //   })
      //   .catch((error) => {
      //     callback(error, null);
      //   });
      req({
          url: `${self.options.url}/${baseUrl$3}/${userId}?${urlParams}`,
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let result = null;
              if (!error && body && body.data) {
                  result = {
                      id: body.data.id,
                      enabled: body.data.enabled,
                      lastLogin: body.data.lastLogin,
                      email: body.data.email,
                      displayname: body.data.displayname,
                      phone: body.data.phone,
                      address: body.data.address,
                      website: body.data.website,
                      twitter: body.data.twitter,
                      groups: body.data.groups,
                      language: body.data.language,
                      locale: body.data.locale
                  };
              }
              callback(error, result);
          });
      });
  }
  function ocsListUsers(search, limit, offset, callback) {
      const self = this;
      const params = {
          format: 'json',
      };
      if (search) {
          params['search'] = search;
      }
      if (limit > -1) {
          params['limit'] = limit;
      }
      if (offset > -1) {
          params['offset'] = offset;
      }
      const urlParams = new URLSearchParams(params)
          .toString();
      req({
          url: `${self.options.url}/${baseUrl$3}?${urlParams}`,
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let users = null;
              if (!error && body && body.data && body.data.users) {
                  users = [];
                  body.data.users.forEach(user => {
                      users.push(user);
                  });
              }
              callback(error, users);
          });
      });
  }
  function ocsSetUserEnabled(userId, isEnabled, callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl$3}/${userId}/${isEnabled ? 'enable' : 'disable'}`,
          method: 'PUT',
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let success = false;
              if (!error && body) {
                  success = true;
              }
              callback(error, success);
          });
      });
  }
  function ocsDeleteUser(userId, callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl$3}/${userId}`,
          method: 'DELETE',
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let userDeleted = false;
              if (!error && body) {
                  userDeleted = true;
              }
              callback(error, userDeleted);
          });
      });
  }
  function ocsAddUser(user, callback) {
      const self = this;
      // Basic validation
      if (!user) {
          callback({ code: 0, message: 'must have a valid OcsNewUser object.' });
          return;
      }
      if (!user.userid) {
          callback({ code: 0, message: 'user must have an id.' });
          return;
      }
      req({
          url: `${self.options.url}/${baseUrl$3}`,
          method: 'POST',
          headers: self.getHeader(true),
          data: JSON.stringify(user)
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let userAdded = false;
              if (!error && body) {
                  userAdded = true;
              }
              callback(error, userAdded);
          });
      });
  }
  function ocsEditUser(userId, field, value, callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl$3}/${userId}`,
          method: 'PUT',
          headers: self.getHeader(true),
          data: JSON.stringify({ value, key: field })
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let userEdited = false;
              if (!error && body) {
                  userEdited = true;
              }
              callback(error, userEdited);
          });
      });
  }
  function ocsGetUserGroups(userId, callback) {
      const self = this;
      // Basic validation
      if (!userId) {
          callback({ code: 0, message: 'no userId specified' });
          return;
      }
      req({
          url: `${self.options.url}/${baseUrl$3}/${userId}/groups`,
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let groups = null;
              if (!error && body && body.data && body.data.groups) {
                  groups = [];
                  body.data.groups.forEach(group => {
                      groups.push(group);
                  });
              }
              callback(error, groups);
          });
      });
  }
  function ocsAddRemoveUserForGroup(userId, groupId, toAdd, callback) {
      const self = this;
      // Basic validation
      if (!userId) {
          callback({ code: 0, message: 'no userId specified' });
          return;
      }
      req({
          url: `${self.options.url}/${baseUrl$3}/${userId}/groups`,
          method: (toAdd ? 'POST' : 'DELETE'),
          headers: self.getHeader(true),
          data: JSON.stringify({ groupid: groupId })
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let userModifiedForGroup = false;
              if (!error && body) {
                  userModifiedForGroup = true;
              }
              callback(error, userModifiedForGroup);
          });
      });
  }
  function ocsSetUserSubAdmin(userId, groupId, isSubAdmin, callback) {
      const self = this;
      // Basic validation
      if (!userId) {
          callback({ code: 0, message: 'no userId specified' });
          return;
      }
      req({
          url: `${self.options.url}/${baseUrl$3}/${userId}/subadmins`,
          method: (isSubAdmin ? 'POST' : 'DELETE'),
          headers: self.getHeader(true),
          data: JSON.stringify({ groupid: groupId })
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let subAdminModifiedForGroup = false;
              if (!error && body) {
                  subAdminModifiedForGroup = true;
              }
              callback(error, subAdminModifiedForGroup);
          });
      });
  }
  function ocsGetUserSubAdmins(userId, callback) {
      const self = this;
      // Basic validation
      if (!userId) {
          callback({ code: 0, message: 'no userId specified' });
          return;
      }
      req({
          url: `${self.options.url}/${baseUrl$3}/${userId}/subadmins`,
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let subAdmins = null;
              if (!error && body && body.data) {
                  subAdmins = [];
                  body.data.forEach(subAdmin => {
                      subAdmins.push(subAdmin);
                  });
              }
              callback(error, subAdmins);
          });
      });
  }
  function ocsResendUserWelcomeEmail(userId, callback) {
      const self = this;
      // Basic validation
      if (!userId) {
          callback({ code: 0, message: 'no userId specified' });
          return;
      }
      req({
          url: `${self.options.url}/${baseUrl$3}/${userId}/welcome`,
          method: 'POST',
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let success = false;
              if (!error && body) {
                  success = true;
              }
              callback(error, success);
          });
      });
  }

  const baseUrl$2 = 'ocs/v2.php/cloud/groups';
  function ocsListGroups(search, limit, offset, callback) {
      const self = this;
      const params = {
          format: 'json',
      };
      if (search) {
          params['search'] = search;
      }
      if (limit > -1) {
          params['limit'] = limit;
      }
      if (offset > -1) {
          params['offset'] = offset;
      }
      const urlParams = new URLSearchParams(params)
          .toString();
      req({
          url: `${self.options.url}/${baseUrl$2}?${urlParams}`,
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let result = null;
              if (!error && body && body.data && body.data.groups) {
                  result = [];
                  body.data.groups.forEach(group => {
                      result.push(group);
                  });
              }
              callback(error, result);
          });
      });
  }
  function ocsAddGroup(groupId, callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl$2}`,
          method: 'POST',
          headers: self.getHeader(true),
          data: JSON.stringify({
              groupid: groupId
          })
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let groupAdded = false;
              if (!error && body) {
                  groupAdded = true;
              }
              callback(error, groupAdded);
          });
      });
  }
  function ocsDeleteGroup(groupId, callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl$2}/${groupId}`,
          method: 'DELETE',
          headers: self.getHeader(true)
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let groupDeleted = false;
              if (!error && body) {
                  groupDeleted = true;
              }
              callback(error, groupDeleted);
          });
      });
  }
  function ocsGetGroupUsers(groupId, callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl$2}/${groupId}`,
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let users = null;
              if (!error && body && body.data && body.data.users) {
                  users = [];
                  body.data.users.forEach(user => {
                      users.push(user);
                  });
              }
              callback(error, users);
          });
      });
  }
  function ocsGetGroupSubAdmins(groupId, callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl$2}/${groupId}/subadmins`,
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let subAdmins = null;
              if (!error && body && body.data) {
                  subAdmins = [];
                  body.data.forEach(subAdmin => {
                      subAdmins.push(subAdmin);
                  });
              }
              callback(error, subAdmins);
          });
      });
  }

  const baseUrl$1 = 'ocs/v2.php/apps/files_sharing/api/v1/shares';
  function ocsGetShares(path, includeReshares, showForSubFiles, callback) {
      const self = this;
      const params = {
          format: 'json'
      };
      if (path) {
          params['path'] = path;
          params['reshares'] = includeReshares;
          params['subfiles'] = showForSubFiles;
      }
      const urlParams = new URLSearchParams(params)
          .toString();
      req({
          url: `${self.options.url}/${baseUrl$1}?${urlParams}`,
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let result = null;
              if (!error && body && body.data) {
                  result = [];
                  body.data.forEach(share => {
                      result.push(parseOcsShare(share));
                  });
              }
              callback(error, result);
          });
      });
  }
  function ocsGetShare(shareId, callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl$1}/${shareId}`,
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let result = null;
              if (!error && body && body.data && body.data.length > 0) {
                  result = parseOcsShare(body.data[0]);
              }
              callback(error, result);
          });
      });
  }
  function ocsDeleteShare(shareId, callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl$1}/${shareId}`,
          method: 'DELETE',
          headers: self.getHeader()
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let shareDeleted = false;
              if (!error && body) {
                  shareDeleted = true;
              }
              callback(error, shareDeleted);
          });
      });
  }
  function ocsAddShare(path, shareType, shareWith, permissions, password, publicUpload, callback) {
      const self = this;
      const share = {
          path,
          shareType,
      };
      share['publicUpload'] = String(publicUpload);
      if (shareWith) {
          share['shareWith'] = shareWith;
      }
      if (permissions && permissions !== OcsSharePermissions.default) {
          share['permissions'] = permissions;
      }
      if (password) {
          share['password'] = password;
      }
      req({
          url: `${self.options.url}/${baseUrl$1}`,
          method: 'POST',
          headers: self.getHeader(true),
          data: JSON.stringify(share)
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let result = null;
              if (!error && body && body.data) {
                  result = parseOcsShare(body.data);
              }
              callback(error, result);
          });
      });
  }
  function ocsEditShare(shareId, field, value, callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl$1}/${shareId}`,
          method: 'PUT',
          headers: self.getHeader(true),
          data: JSON.stringify({ [field]: value })
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let result = null;
              if (!error && body && body.data) {
                  result = parseOcsShare(body.data);
              }
              callback(error, result);
          });
      });
  }
  function parseOcsShare(share) {
      const timestamp = parseInt(share.stime, 10);
      const permissionsInt = parseInt(share.permissions, 10);
      const shareTypeInt = parseInt(share.share_type, 10);
      const obj = {
          id: parseInt(share.id, 10),
          shareType: shareTypeInt,
          shareTypeSystemName: OcsShareType[shareTypeInt],
          ownerUserId: share.uid_owner,
          ownerDisplayName: share.displayname_owner,
          permissions: permissionsInt,
          permissionsText: ocsSharePermissionsToText(permissionsInt),
          sharedOn: new Date(timestamp * 1000),
          sharedOnTimestamp: timestamp,
          parent: share.parent,
          expiration: share.expiration,
          token: share.token,
          fileOwnerUserId: share.uid_file_owner,
          fileOwnerDisplayName: share.displayname_file_owner,
          note: share.note,
          label: share.label,
          path: share.path,
          itemType: share.item_type,
          mimeType: share.mimetype,
          storageId: share.storage_id,
          storage: parseInt(share.storage, 10),
          fileId: parseInt(share.item_source, 10),
          parentFileId: parseInt(share.file_parent, 10),
          fileTarget: share.file_target,
          sharedWith: share.share_with,
          sharedWithDisplayName: share.share_with_displayname,
          mailSend: Boolean(share.mail_send),
          hideDownload: Boolean(share.hide_download),
      };
      assignDefined(obj, {
          password: share.password,
          sendPasswordByTalk: share.send_password_by_talk,
          url: share.url,
      });
      return obj;
  }

  const baseUrl = 'apps/groupfolders/folders';
  // GET apps/groupfolders/folders: Returns a list of all configured groupfolders and their settings
  function ocsGetGroupfolders(callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl}`,
          headers: self.getHeader(true),
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let result = null;
              if (!error && body && body.data) {
                  result = [];
                  Object.values(body.data).forEach(groupfolder => {
                      result.push(parseOcsGroupfolder(groupfolder));
                  });
              }
              callback(error, result);
          });
      });
  }
  // GET apps/groupfolders/folders/$folderId: Return a specific configured groupfolder and its settings
  // returns groupfolder object if found, `null` otherwise
  function ocsGetGroupfolder(groupfolderId, callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl}/${groupfolderId}`,
          headers: self.getHeader(true),
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let result = null;
              if (!error && body && body.data) {
                  result = parseOcsGroupfolder(body.data);
              }
              callback(error, result);
          });
      });
  }
  // POST apps/groupfolders/folders: Create a new groupfolder
  // `mountpoint`: The name for the new groupfolder
  // returns new groupfolder id
  function ocsAddGroupfolder(mountpoint, callback) {
      const self = this;
      const body = {
          mountpoint,
      };
      req({
          url: `${self.options.url}/${baseUrl}`,
          method: 'POST',
          headers: self.getHeader(true),
          data: JSON.stringify(body),
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let result = null;
              if (!error && body && body.data) {
                  result = parseOcsGroupfolderId(body.data);
              }
              callback(error, result);
          });
      });
  }
  // DELETE apps/groupfolders/folders/$folderId: Delete a groupfolder
  // returns `true` if successful (even if the groupfolder didn't exist)
  function ocsRemoveGroupfolder(groupfolderId, callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl}/${groupfolderId}`,
          method: 'DELETE',
          headers: self.getHeader(),
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let groupfolderDeleted = false;
              if (!error && body) {
                  groupfolderDeleted = true;
              }
              callback(error, groupfolderDeleted);
          });
      });
  }
  // POST apps/groupfolders/folders/$folderId/groups: Give a group access to a groupfolder
  // `group`: The id of the group to be given access to the groupfolder
  // returns `true` if successful (even if the group doesn't exist)
  function ocsAddGroupfolderGroup(groupfolderId, groupId, callback) {
      const self = this;
      const body = {
          group: groupId,
      };
      req({
          url: `${self.options.url}/${baseUrl}/${groupfolderId}/groups`,
          method: 'POST',
          headers: self.getHeader(true),
          data: JSON.stringify(body)
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let groupfolderGroupAdded = false;
              if (!error && body) {
                  groupfolderGroupAdded = true;
              }
              callback(error, groupfolderGroupAdded);
          });
      });
  }
  // DELETE apps/groupfolders/folders/$folderId/groups/$groupId: Remove access from a group to a groupfolder
  // returns `true` if successful (even if the groupfolder didn't exist)
  function ocsRemoveGroupfolderGroup(groupfolderId, groupId, callback) {
      const self = this;
      req({
          url: `${self.options.url}/${baseUrl}/${groupfolderId}/groups/${groupId}`,
          method: 'DELETE',
          headers: self.getHeader(),
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let groupfolderGroupRemoved = false;
              if (!error && body) {
                  groupfolderGroupRemoved = true;
              }
              callback(error, groupfolderGroupRemoved);
          });
      });
  }
  // POST apps/groupfolders/folders/$folderId/groups/$groupId: Set the permissions a group has in a groupfolder
  // `permissions` The new permissions for the group as bitmask of permissions constants
  // e.g. write(6) === update(2) + create(4)
  function ocsSetGroupfolderPermissions(groupfolderId, groupId, permissions, callback) {
      const self = this;
      const body = {
          permissions,
      };
      req({
          url: `${self.options.url}/${baseUrl}/${groupfolderId}/groups/${groupId}`,
          method: 'POST',
          headers: self.getHeader(true),
          data: JSON.stringify(body),
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let groupfolderPermissionsSet = false;
              if (!error && body) {
                  groupfolderPermissionsSet = true;
              }
              callback(error, groupfolderPermissionsSet);
          });
      });
  }
  // POST apps/groupfolders/folders/$folderId/acl: Enable/Disable groupfolder advanced permissions
  // `acl`: `true` for enable, `false` for disable.
  function ocsEnableOrDisableGroupfolderACL(groupfolderId, enable, callback) {
      const self = this;
      const body = {
          acl: enable ? 1 : 0
      };
      req({
          url: `${self.options.url}/${baseUrl}/${groupfolderId}/acl`,
          method: 'POST',
          headers: self.getHeader(true),
          data: JSON.stringify(body),
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let groupfolderACLset = false;
              if (!error && body) {
                  groupfolderACLset = true;
              }
              callback(error, groupfolderACLset);
          });
      });
  }
  // POST apps/groupfolders/folders/$folderId/manageACL: Grants/Removes a group or user the ability to manage a groupfolders' advanced permissions
  // `mappingId`: the id of the group/user to be granted/removed access to/from the groupfolder
  // `mappingType`: 'group' or 'user'
  // `manageAcl`: true to grants ability to manage a groupfolders' advanced permissions, false to remove
  function ocsSetGroupfolderManageACL(groupfolderId, type, id, manageACL, callback) {
      const self = this;
      const body = {
          mappingType: type,
          mappingId: id,
          manageAcl: manageACL ? 1 : 0
      };
      req({
          url: `${self.options.url}/${baseUrl}/${groupfolderId}/manageACL`,
          method: 'POST',
          headers: self.getHeader(true),
          data: JSON.stringify(body),
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let groupfolderPermissionsSet = false;
              if (!error && body) {
                  groupfolderPermissionsSet = true;
              }
              callback(error, groupfolderPermissionsSet);
          });
      });
  }
  // POST apps/groupfolders/folders/$folderId/quota: Set the quota for a groupfolder in bytes
  // `quota`: The new quota for the groupfolder in bytes, user -3 for unlimited
  function ocsSetGroupfolderQuota(groupfolderId, quota, callback) {
      const self = this;
      const body = {
          quota: Number.isNaN(quota) ? -3 : quota,
      };
      req({
          url: `${self.options.url}/${baseUrl}/${groupfolderId}/quota`,
          method: 'POST',
          headers: self.getHeader(true),
          data: JSON.stringify(body),
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let groupfolderQuotaSet = false;
              if (!error && body) {
                  groupfolderQuotaSet = true;
              }
              callback(error, groupfolderQuotaSet);
          });
      });
  }
  // POST apps/groupfolders/folders/$folderId/mountpoint: Change the name of a groupfolder
  // `mountpoint`: The new name for the groupfolder
  function ocsRenameGroupfolder(groupfolderId, mountpoint, callback) {
      const self = this;
      const body = {
          mountpoint,
      };
      req({
          url: `${self.options.url}/${baseUrl}/${groupfolderId}/mountpoint`,
          method: 'POST',
          headers: self.getHeader(true),
          data: JSON.stringify(body),
      }, (error, response, body) => {
          self.request(error, response, body, (error, body) => {
              let groupfolderRenamed = false;
              if (!error && body) {
                  groupfolderRenamed = true;
              }
              callback(error, groupfolderRenamed);
          });
      });
  }
  function parseOcsGroupfolder(groupfolder) {
      return {
          id: parseInt(groupfolder.id, 10),
          mountPoint: groupfolder.mount_point,
          groups: groupfolder.groups,
          quota: groupfolder.quota,
          size: groupfolder.size,
          acl: groupfolder.acl,
          manage: groupfolder.manage,
      };
  }
  function parseOcsGroupfolderId(groupfolder) {
      return parseInt(groupfolder.id, 10);
  }

  const promisifiedGetActivities = promisify(ocsGetActivities);
  const promisifiedResendUserWelcomeEmail = promisify(ocsResendUserWelcomeEmail);
  const promisifiedAddRemoveUserForGroup = promisify(ocsAddRemoveUserForGroup);
  const promisifiedGetUserSubAdmins = promisify(ocsGetUserSubAdmins);
  const promisifiedSetUserSubAdmin = promisify(ocsSetUserSubAdmin);
  const promisifiedSetUserEnabled = promisify(ocsSetUserEnabled);
  const promisifiedGetUserGroups = promisify(ocsGetUserGroups);
  const promisifiedDeleteUser = promisify(ocsDeleteUser);
  const promisifiedListUsers = promisify(ocsListUsers);
  const promisifiedEditUser = promisify(ocsEditUser);
  const promisifiedAddUser = promisify(ocsAddUser);
  const promisifiedGetUser = promisify(ocsGetUser);
  const promisifiedGetGroupSubAdmins = promisify(ocsGetGroupSubAdmins);
  const promisifiedGetGroupUsers = promisify(ocsGetGroupUsers);
  const promisifiedDeleteGroup = promisify(ocsDeleteGroup);
  const promisifiedListGroups = promisify(ocsListGroups);
  const promisifiedAddGroup = promisify(ocsAddGroup);
  const promisifiedDeleteShare = promisify(ocsDeleteShare);
  const promisifiedEditShare = promisify(ocsEditShare);
  const promisifiedGetShares = promisify(ocsGetShares);
  const promisifiedGetShare = promisify(ocsGetShare);
  const promisifiedAddShare = promisify(ocsAddShare);
  const promisifiedGetGroupfolders = promisify(ocsGetGroupfolders);
  const promisifiedGetGroupfolder = promisify(ocsGetGroupfolder);
  const promisifiedAddGroupfolder = promisify(ocsAddGroupfolder);
  const promisifiedRemoveGroupfolder = promisify(ocsRemoveGroupfolder);
  const promisifiedAddGroupfolderGroup = promisify(ocsAddGroupfolderGroup);
  const promisifiedRemoveGroupfolderGroup = promisify(ocsRemoveGroupfolderGroup);
  const promisifiedEnableOrDisableGroupfolderACL = promisify(ocsEnableOrDisableGroupfolderACL);
  const promisifiedRenameGroupfolder = promisify(ocsRenameGroupfolder);
  const promisifiedSetGroupfolderQuota = promisify(ocsSetGroupfolderQuota);
  const promisifiedSetGroupfolderPermissions = promisify(ocsSetGroupfolderPermissions);
  const promisifiedSetGroupfolderManageACL = promisify(ocsSetGroupfolderManageACL);
  function configureOcsConnection(options) {
      const self = this;
      self.ocsConnection = new OcsConnection({
          url: options.url,
          username: options.username,
          password: options.password
      });
  }
  async function getActivities(connection, fileId, sort, limit, sinceActivityId) {
      let activities;
      try {
          activities = await promisifiedGetActivities.call(connection, (typeof fileId === 'string' ? parseInt(fileId, 10) : fileId), sort || 'desc', limit || -1, sinceActivityId || -1);
      }
      catch (error) {
          activities = rejectWithOcsError(error, {
              message: 'Unable to get activities for',
              identifier: fileId,
              useMeta: false,
              customErrors: {
                  [204]: 'The user has selected no activities to be listed in the stream',
                  [304]: 'ETag/If-None-Match are the same or the end of the activity list was reached',
                  [403]: 'The offset activity belongs to a different user or the user is not logged in',
                  [404]: 'The filter is unknown'
              }
          });
      }
      return activities;
  }
  async function getUser(connection, userId) {
      let user;
      try {
          user = await promisifiedGetUser.call(connection, userId);
      }
      catch (error) {
          user = rejectWithOcsError(error, {
              message: 'Unable to find user',
              identifier: userId,
              useMeta: false
          });
      }
      return user;
  }
  async function setUserEnabled(connection, userId, isEnabled) {
      let success;
      try {
          success = await promisifiedSetUserEnabled.call(connection, userId, isEnabled);
      }
      catch (error) {
          success = rejectWithOcsError(error, {
              message: `Unable to ${isEnabled ? 'enable' : 'disable'} user`,
              identifier: userId,
              useMeta: true,
              customErrors: {
                  [101]: 'user does not exist'
              }
          });
      }
      return success;
  }
  async function editUser(connection, userId, field, value) {
      let userEdited;
      try {
          userEdited = await promisifiedEditUser.call(connection, userId, field, value);
      }
      catch (error) {
          userEdited = rejectWithOcsError(error, {
              message: 'Unable to edit user',
              identifier: userId,
              useMeta: true,
              expectedErrorCodes: [400, 401],
              customErrors: {
                  [101]: 'user not found',
                  [997]: 'possible reasons: Does it exist? Do you have the right permissions? Is the field valid?'
              }
          });
      }
      return userEdited;
  }
  async function getUserGroups(connection, userId) {
      let groups;
      try {
          groups = await promisifiedGetUserGroups.call(connection, userId);
      }
      catch (error) {
          groups = rejectWithOcsError(error, {
              message: 'Unable to get groups for user',
              identifier: userId,
              useMeta: false
          });
      }
      return groups;
  }
  async function getUserSubAdmins(connection, userId) {
      let subAdmins;
      try {
          subAdmins = await promisifiedGetUserSubAdmins.call(connection, userId);
      }
      catch (error) {
          subAdmins = rejectWithOcsError(error, {
              message: 'Unable to get sub-admins for user',
              identifier: userId,
              useMeta: true,
              expectedErrorCodes: [400],
              customErrors: {
                  [101]: 'user does not exist'
              }
          });
      }
      return subAdmins;
  }
  async function resendUserWelcomeEmail(connection, userId) {
      let success;
      try {
          success = await promisifiedResendUserWelcomeEmail.call(connection, userId);
      }
      catch (error) {
          success = rejectWithOcsError(error, {
              message: 'Unable to resend welcome email for user',
              identifier: userId,
              useMeta: true,
              expectedErrorCodes: [400],
              customErrors: {
                  [101]: 'email address not available',
                  [102]: 'sending email failed'
              }
          });
      }
      return success;
  }
  async function addRemoveUserForGroup(connection, userId, groupId, toAdd) {
      let userModifiedForGroup;
      try {
          userModifiedForGroup = await promisifiedAddRemoveUserForGroup.call(connection, userId, groupId, toAdd);
      }
      catch (error) {
          userModifiedForGroup = rejectWithOcsError(error, {
              message: `Unable to ${toAdd ? 'add' : 'remove'} user '${userId}' ${toAdd ? 'to' : 'from'} group`,
              identifier: groupId,
              useMeta: true,
              expectedErrorCodes: [400],
              customErrors: {
                  [101]: 'no group specified',
                  [102]: 'group does not exist',
                  [103]: 'user does not exist',
                  [104]: 'insufficient privileges',
              }
          });
      }
      return userModifiedForGroup;
  }
  async function addRemoveUserSubAdminForGroup(connection, userId, groupId, toAdd) {
      let subAdminModifiedForGroup;
      try {
          subAdminModifiedForGroup = await promisifiedSetUserSubAdmin.call(connection, userId, groupId, toAdd);
      }
      catch (error) {
          let customErrors = {};
          if (toAdd) {
              customErrors[101] = 'user does not exist';
              customErrors[102] = 'group does not exist';
          }
          else {
              customErrors[101] = 'user or group does not exist';
              customErrors[102] = 'user is not a sub-admin of the group';
          }
          subAdminModifiedForGroup = rejectWithOcsError(error, {
              customErrors,
              message: `Unable to ${toAdd ? 'add' : 'remove'} user '${userId}' as sub-admin ${toAdd ? 'to' : 'from'} group`,
              identifier: groupId,
              useMeta: true,
              expectedErrorCodes: [400],
          });
      }
      return subAdminModifiedForGroup;
  }
  async function listUsers(connection, search, limit, offset) {
      let users;
      try {
          users = await promisifiedListUsers.call(connection, search || '', Number.isInteger(limit) ? limit : -1, Number.isInteger(offset) ? offset : -1);
      }
      catch (error) {
          users = rejectWithOcsError(error, {
              message: 'Unable to list users',
              useMeta: false
          });
      }
      return users;
  }
  async function deleteUser(connection, userId) {
      let userDeleted;
      try {
          userDeleted = await promisifiedDeleteUser.call(connection, userId);
      }
      catch (error) {
          userDeleted = rejectWithOcsError(error, {
              message: 'Unable to delete user',
              identifier: userId,
              useMeta: true,
              expectedErrorCodes: [400],
              customErrors: {
                  [101]: 'user does not exist'
              }
          });
      }
      return userDeleted;
  }
  async function addUser(connection, user) {
      let userAdded;
      try {
          userAdded = await promisifiedAddUser.call(connection, user);
      }
      catch (error) {
          userAdded = rejectWithOcsError(error, {
              message: 'Unable to add user',
              identifier: (user && user.userid ? user.userid : ''),
              useMeta: true,
              expectedErrorCodes: [400],
              customErrors: {
                  [102]: 'username already exists',
                  [103]: 'unknown error occurred whilst adding the user',
                  [104]: 'group does not exist',
                  [105]: 'insufficient privileges for group',
                  [106]: 'no group specified (required for sub-admins',
                  [108]: 'password and email empty. Must set password or an email',
                  [109]: 'invitation email cannot be send'
              }
          });
      }
      return userAdded;
  }
  async function listGroups(connection, search, limit, offset) {
      let groups;
      try {
          groups = await promisifiedListGroups.call(connection, search || '', Number.isInteger(limit) ? limit : -1, Number.isInteger(offset) ? offset : -1);
      }
      catch (error) {
          groups = rejectWithOcsError(error, {
              message: 'Unable to list groups',
              useMeta: false
          });
      }
      return groups;
  }
  async function addGroup(connection, groupId) {
      let groupAdded;
      try {
          groupAdded = await promisifiedAddGroup.call(connection, groupId);
      }
      catch (error) {
          groupAdded = rejectWithOcsError(error, {
              message: 'Unable to add group',
              identifier: groupId,
              useMeta: true,
              expectedErrorCodes: [400],
              customErrors: {
                  [102]: 'group already exists',
                  [103]: 'failed to add the group'
              }
          });
      }
      return groupAdded;
  }
  async function deleteGroup(connection, groupId) {
      let groupDeleted;
      try {
          groupDeleted = await promisifiedDeleteGroup.call(connection, groupId);
      }
      catch (error) {
          groupDeleted = rejectWithOcsError(error, {
              message: 'Unable to delete group',
              identifier: groupId,
              useMeta: true,
              expectedErrorCodes: [400],
              customErrors: {
                  [101]: 'group does not exist',
                  [102]: 'failed to delete group'
              }
          });
      }
      return groupDeleted;
  }
  async function getGroupUsers(connection, groupId) {
      let users;
      try {
          users = await promisifiedGetGroupUsers.call(connection, groupId);
      }
      catch (error) {
          users = rejectWithOcsError(error, {
              message: 'Unable to list users for group',
              identifier: groupId,
              useMeta: false,
              expectedErrorCodes: [404],
              customErrors: {
                  [404]: 'the group could not be found'
              }
          });
      }
      return users;
  }
  async function getGroupSubAdmins(connection, groupId) {
      let subAdmins;
      try {
          subAdmins = await promisifiedGetGroupSubAdmins.call(connection, groupId);
      }
      catch (error) {
          subAdmins = rejectWithOcsError(error, {
              message: 'Unable to list sub-admins for group',
              identifier: groupId,
              useMeta: true,
              expectedErrorCodes: [400],
              customErrors: {
                  [101]: 'group does not exist'
              }
          });
      }
      return subAdmins;
  }
  async function getShares(connection, path, includeReshares, showForSubFiles) {
      let shares;
      try {
          shares = await promisifiedGetShares.call(connection, path || '', (includeReshares !== undefined ? includeReshares : false), (showForSubFiles !== undefined ? showForSubFiles : false));
      }
      catch (error) {
          shares = rejectWithOcsError(error, {
              message: 'Unable to get shares for',
              identifier: path,
              useMeta: true,
              expectedErrorCodes: [400, 404],
              customErrors: {
                  [400]: 'unable to show sub-files as this is not a directory',
                  [404]: 'file/folder doesn\'t exist'
              }
          });
      }
      return shares;
  }
  async function getShare(connection, shareId) {
      let share;
      try {
          share = await promisifiedGetShare.call(connection, shareId);
      }
      catch (error) {
          share = rejectWithOcsError(error, {
              message: 'Unable to get share',
              identifier: shareId,
              useMeta: true,
              expectedErrorCodes: [404]
          });
      }
      return share;
  }
  async function deleteShare(connection, shareId) {
      let shareDeleted;
      try {
          shareDeleted = await promisifiedDeleteShare.call(connection, shareId);
      }
      catch (error) {
          shareDeleted = rejectWithOcsError(error, {
              message: 'Unable to delete share',
              identifier: shareId,
              useMeta: true,
              expectedErrorCodes: [404],
              customErrors: {
                  [404]: 'invalid shareId or the share doesn\'t exist'
              }
          });
      }
      return shareDeleted;
  }
  async function addShare(connection, path, shareType, shareWith, permissions, password, publicUpload) {
      let addedShare;
      try {
          addedShare = await promisifiedAddShare.call(connection, path, shareType, shareWith || '', (permissions !== undefined ? permissions : OcsSharePermissions.default), password || '', (publicUpload !== undefined ? publicUpload : false));
      }
      catch (error) {
          addedShare = rejectWithOcsError(error, {
              message: 'Unable to add share',
              identifier: path,
              useMeta: true,
              expectedErrorCodes: [403, 404]
          });
      }
      return addedShare;
  }
  function editShare(connection, shareId) {
      return {
          async permissions(permissions) {
              return await setFieldValue(connection, shareId, 'permissions', permissions);
          },
          async password(password) {
              return await setFieldValue(connection, shareId, 'password', password);
          },
          async publicUpload(isPublicUpload) {
              return await setFieldValue(connection, shareId, 'publicUpload', isPublicUpload);
          },
          async expireDate(expireDate) {
              return await setFieldValue(connection, shareId, 'expireDate', expireDate);
          },
          async note(note) {
              return await setFieldValue(connection, shareId, 'note', note);
          }
      };
      async function setFieldValue(connection, shareId, field, value) {
          let editedShare;
          try {
              editedShare = await promisifiedEditShare.call(connection, shareId, field, String(value));
          }
          catch (error) {
              editedShare = rejectWithOcsError(error, {
                  message: `Unable to edit '${field}' of share`,
                  identifier: shareId,
                  useMeta: true,
                  expectedErrorCodes: [400, 404]
              });
          }
          return editedShare;
      }
  }
  async function getGroupfolders(connection) {
      let groupfolders;
      try {
          groupfolders = await promisifiedGetGroupfolders.call(connection);
      }
      catch (error) {
          groupfolders = rejectWithOcsError(error, {
              message: 'Unable to list groupfolders',
              useMeta: true,
              expectedErrorCodes: [500],
          });
      }
      return groupfolders;
  }
  async function getGroupfolder(connection, groupfolderId) {
      let groupfolder;
      try {
          groupfolder = await promisifiedGetGroupfolder.call(connection, groupfolderId);
      }
      catch (error) {
          groupfolder = rejectWithOcsError(error, {
              message: 'Unable to get groupfolder',
              identifier: groupfolderId,
              useMeta: true,
              expectedErrorCodes: [500],
          });
      }
      return groupfolder;
  }
  async function addGroupfolder(connection, mountpoint) {
      let addedGroupfolderId;
      try {
          addedGroupfolderId = await promisifiedAddGroupfolder.call(connection, mountpoint);
      }
      catch (error) {
          addedGroupfolderId = rejectWithOcsError(error, {
              message: 'Unable to create groupfolder',
              identifier: mountpoint,
              useMeta: true,
              expectedErrorCodes: [500],
          });
      }
      return addedGroupfolderId;
  }
  async function removeGroupfolder(connection, groupfolderId) {
      let groupfolderDeleted;
      try {
          groupfolderDeleted = await promisifiedRemoveGroupfolder.call(connection, groupfolderId);
      }
      catch (error) {
          groupfolderDeleted = rejectWithOcsError(error, {
              message: 'Unable to delete groupfolder',
              identifier: groupfolderId,
              useMeta: true,
              expectedErrorCodes: [500],
          });
      }
      return groupfolderDeleted;
  }
  async function addGroupfolderGroup(connection, groupfolderId, groupId) {
      let groupfolderGroupAdded;
      try {
          groupfolderGroupAdded = await promisifiedAddGroupfolderGroup.call(connection, groupfolderId, groupId);
      }
      catch (error) {
          groupfolderGroupAdded = rejectWithOcsError(error, {
              message: 'Unable to add group to groupfolder',
              identifier: groupfolderId,
              useMeta: true,
              expectedErrorCodes: [500],
          });
      }
      return groupfolderGroupAdded;
  }
  async function removeGroupfolderGroup(connection, groupfolderId, groupId) {
      let groupfolderGroupRemoved;
      try {
          groupfolderGroupRemoved = await promisifiedRemoveGroupfolderGroup.call(connection, groupfolderId, groupId);
      }
      catch (error) {
          groupfolderGroupRemoved = rejectWithOcsError(error, {
              message: 'Unable to remove group from groupfolder',
              identifier: groupfolderId,
              useMeta: true,
              expectedErrorCodes: [500],
          });
      }
      return groupfolderGroupRemoved;
  }
  async function setGroupfolderPermissions(connection, groupfolderId, groupId, permissions) {
      let groupfolderPermissionsSet;
      try {
          groupfolderPermissionsSet = await promisifiedSetGroupfolderPermissions.call(connection, groupfolderId, groupId, permissions);
      }
      catch (error) {
          groupfolderPermissionsSet = rejectWithOcsError(error, {
              message: 'Unable to set groupfolder permissions',
              identifier: groupfolderId,
              useMeta: true,
              expectedErrorCodes: [500],
          });
      }
      return groupfolderPermissionsSet;
  }
  async function enableGroupfolderACL(connection, groupfolderId, enable) {
      let groupfolderACLEnabled;
      try {
          groupfolderACLEnabled = await promisifiedEnableOrDisableGroupfolderACL.call(connection, groupfolderId, enable);
      }
      catch (error) {
          groupfolderACLEnabled = rejectWithOcsError(error, {
              message: 'Unable to enable ACL for groupfolder',
              identifier: groupfolderId,
              useMeta: true,
              expectedErrorCodes: [500],
          });
      }
      return groupfolderACLEnabled;
  }
  async function setGroupfolderManageACL(connection, groupfolderId, type, id, manageACL) {
      let groupfolderManageACLSet;
      try {
          groupfolderManageACLSet = await promisifiedSetGroupfolderManageACL.call(connection, groupfolderId, type, id, manageACL);
      }
      catch (error) {
          groupfolderManageACLSet = rejectWithOcsError(error, {
              message: 'Unable to set groupfolder manage ACL settings',
              identifier: groupfolderId,
              useMeta: true,
              expectedErrorCodes: [500],
          });
      }
      return groupfolderManageACLSet;
  }
  async function setGroupfolderQuota(connection, groupfolderId, quota) {
      let groupfolderQuotaSet;
      try {
          groupfolderQuotaSet = await promisifiedSetGroupfolderQuota.call(connection, groupfolderId, quota);
      }
      catch (error) {
          groupfolderQuotaSet = rejectWithOcsError(error, {
              message: 'Unable to set groupfolder quota',
              identifier: groupfolderId,
              useMeta: true,
              expectedErrorCodes: [500],
          });
      }
      return groupfolderQuotaSet;
  }
  async function renameGroupfolder(connection, groupfolderId, mountpoint) {
      let groupfolderRenamed;
      try {
          groupfolderRenamed = await promisifiedRenameGroupfolder.call(connection, groupfolderId, mountpoint);
      }
      catch (error) {
          groupfolderRenamed = rejectWithOcsError(error, {
              message: 'Unable to rename groupfolder',
              identifier: groupfolderId,
              useMeta: true,
              expectedErrorCodes: [500],
          });
      }
      return groupfolderRenamed;
  }

  class NextcloudClientProperties {
  }

  /**
   * Creates a ownCloud detail property for use with the various WebDAV methods.
   * @param element The element name (e.g. `fileid`)
   * @param nativeType **UNUSED** - The native type of the property (e.g. `number`)
   * @param defaultValue The default value to return if the property is not found
   * @returns A detail property
   *
   * @deprecated Use `createDetailProperty` instead
   */
  function createOwnCloudFileDetailProperty(element, nativeType, defaultValue) {
      return createDetailProperty('oc', element, defaultValue);
  }
  /**
   * Creates a NextCloud detail property for use with the various WebDAV methods.
   * @param element The element name (e.g. `fileid`)
   * @param nativeType **UNUSED** - The native type of the property (e.g. `number`)
   * @param defaultValue The default value to return if the property is not found
   * @returns A detail property
   *
   * @deprecated Use `createDetailProperty` instead
   */
  function createNextCloudFileDetailProperty(element, nativeType, defaultValue) {
      return createDetailProperty('nc', element, defaultValue);
  }

  class NextcloudClient extends NextcloudClientProperties {
      constructor(options) {
          super();
          this.options = options;
          this.configureOcsConnection = configureOcsConnection;
          this.createFolderHierarchy = this.wrapWebDav(WebDavClient.prototype.createFolderHierarchy);
          this.getFolderFileDetails = this.wrapWebDav(WebDavClient.prototype.getFolderFileDetails);
          this.getFolderProperties = this.wrapWebDav(WebDavClient.prototype.getFolderProperties);
          this.checkConnectivity = this.wrapWebDav(WebDavClient.prototype.checkConnectivity);
          this.downloadToStream = this.wrapWebDav(WebDavClient.prototype.downloadToStream);
          this.uploadFromStream = this.wrapWebDav(WebDavClient.prototype.uploadFromStream);
          this.getFilesDetailed = this.wrapWebDav(WebDavClient.prototype.getFilesDetailed);
          this.getWriteStream = this.wrapWebDav(WebDavClient.prototype.getWriteStream);
          this.getReadStream = this.wrapWebDav(WebDavClient.prototype.getReadStream);
          this.touchFolder = this.wrapWebDav(WebDavClient.prototype.touchFolder);
          this.getPathInfo = this.wrapWebDav(WebDavClient.prototype.getPathInfo);
          this.getFiles = this.wrapWebDav(WebDavClient.prototype.getFiles);
          this.rename = this.wrapWebDav(WebDavClient.prototype.rename);
          this.remove = this.wrapWebDav(WebDavClient.prototype.remove);
          this.exists = this.wrapWebDav(WebDavClient.prototype.exists);
          this.move = this.wrapWebDav(WebDavClient.prototype.move);
          this.put = this.wrapWebDav(WebDavClient.prototype.put);
          this.get = this.wrapWebDav(WebDavClient.prototype.get);
          // Common
          this.getCreatorByFileId = getCreatorByFileId;
          this.getCreatorByPath = getCreatorByPath;
          // OCS
          this.activities = {
              get: (fileId, sort, limit, sinceActivityId) => getActivities(this.ocsConnection, fileId, sort, limit, sinceActivityId)
          };
          this.users = {
              removeSubAdminFromGroup: (userId, groupId) => addRemoveUserSubAdminForGroup(this.ocsConnection, userId, groupId, false),
              addSubAdminToGroup: (userId, groupId) => addRemoveUserSubAdminForGroup(this.ocsConnection, userId, groupId, true),
              resendWelcomeEmail: (userId) => resendUserWelcomeEmail(this.ocsConnection, userId),
              getSubAdminGroups: (userId) => getUserSubAdmins(this.ocsConnection, userId),
              removeFromGroup: (userId, groupId) => addRemoveUserForGroup(this.ocsConnection, userId, groupId, false),
              setEnabled: (userId, isEnabled) => setUserEnabled(this.ocsConnection, userId, isEnabled),
              addToGroup: (userId, groupId) => addRemoveUserForGroup(this.ocsConnection, userId, groupId, true),
              getGroups: (userId) => getUserGroups(this.ocsConnection, userId),
              delete: (userId) => deleteUser(this.ocsConnection, userId),
              edit: (userId, field, value) => editUser(this.ocsConnection, userId, field, value),
              list: (search, limit, offset) => listUsers(this.ocsConnection, search, limit, offset),
              add: (user) => addUser(this.ocsConnection, user),
              get: (userId) => getUser(this.ocsConnection, userId),
          };
          this.groups = {
              getSubAdmins: (groupId) => getGroupSubAdmins(this.ocsConnection, groupId),
              getUsers: (groupId) => getGroupUsers(this.ocsConnection, groupId),
              delete: (groupId) => deleteGroup(this.ocsConnection, groupId),
              list: (search, limit, offset) => listGroups(this.ocsConnection, search, limit, offset),
              add: (groupId) => addGroup(this.ocsConnection, groupId),
          };
          this.shares = {
              delete: (shareId) => deleteShare(this.ocsConnection, shareId),
              edit: {
                  permissions: (shareId, permissions) => editShare(this.ocsConnection, shareId).permissions(permissions),
                  password: (shareId, password) => editShare(this.ocsConnection, shareId).password(password),
                  publicUpload: (shareId, isPublicUpload) => editShare(this.ocsConnection, shareId).publicUpload(isPublicUpload),
                  expireDate: (shareId, expireDate) => editShare(this.ocsConnection, shareId).expireDate(expireDate),
                  note: (shareId, note) => editShare(this.ocsConnection, shareId).note(note),
              },
              list: (path, includeReshares, showForSubFiles) => getShares(this.ocsConnection, path, includeReshares, showForSubFiles),
              add: (path, shareType, shareWith, permissions, password, publicUpload) => addShare(this.ocsConnection, path, shareType, shareWith, permissions, password, publicUpload),
              get: (shareId) => getShare(this.ocsConnection, shareId),
          };
          this.groupfolders = {
              getFolders: () => getGroupfolders(this.ocsConnection),
              getFolder: (fid) => getGroupfolder(this.ocsConnection, fid),
              addFolder: (mountpoint) => addGroupfolder(this.ocsConnection, mountpoint),
              removeFolder: (fid) => removeGroupfolder(this.ocsConnection, fid),
              addGroup: (fid, gid) => addGroupfolderGroup(this.ocsConnection, fid, gid),
              removeGroup: (fid, gid) => removeGroupfolderGroup(this.ocsConnection, fid, gid),
              setPermissions: (fid, gid, permissions) => setGroupfolderPermissions(this.ocsConnection, fid, gid, permissions),
              enableACL: (fid, enable) => enableGroupfolderACL(this.ocsConnection, fid, enable),
              setManageACL: (fid, type, id, manageACL) => setGroupfolderManageACL(this.ocsConnection, fid, type, id, manageACL),
              setQuota: (fid, quota) => setGroupfolderQuota(this.ocsConnection, fid, quota),
              renameFolder: (fid, mountpoint) => renameGroupfolder(this.ocsConnection, fid, mountpoint),
          };
          this.username = options.username;
          this.url = options.url.endsWith('/') ? options.url.slice(0, -1) : options.url;
          this.webdavConnection = Optional.None();
          this.configureOcsConnection(options);
      }
      as(username, password) {
          return new NextcloudClient({ username, password, url: this.url });
      }
      /**
       * Wrap a given prototype function to ensure such that the function called is
       * using the initialized WebDAV connection.
       * @param fn The function to wrap
       * @returns The wrapped function
       */
      wrapWebDav(fn) {
          return (async (...args) => {
              if (Optional.isNone(this.webdavConnection)) {
                  this.webdavConnection = Optional.fromNullable(await WebDavClient.create(this.url, this.options));
              }
              if (Optional.isNone(this.webdavConnection)) {
                  throw new NextCloudClientException('WebDAV connection could not be initialized');
              }
              return fn.apply(this.webdavConnection.get(), args);
          });
      }
  }

  exports.BadArgumentError = BadArgumentError;
  exports.ConflictError = ConflictError;
  exports.ForbiddenError = ForbiddenError;
  exports.IncorrectPathTypeError = IncorrectPathTypeError;
  exports.NextCloudClientException = NextCloudClientException;
  exports.NextCloudException = NextCloudException;
  exports.NextCloudServerException = NextCloudServerException;
  exports.NextcloudClient = NextcloudClient;
  exports.NotFoundError = NotFoundError;
  exports.NotReadyError = NotReadyError;
  exports.OcsError = OcsError;
  exports.UnreachableError = UnreachableError;
  exports.createDetailProperty = createDetailProperty;
  exports.createNextCloudFileDetailProperty = createNextCloudFileDetailProperty;
  exports.createOwnCloudFileDetailProperty = createOwnCloudFileDetailProperty;
  exports.default = NextcloudClient;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({}, axios);
//# sourceMappingURL=nextcloud-client.js.map
