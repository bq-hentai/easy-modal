/**
 * easy-modal | Ver 0.1.0 | bq-hentai
 * deps [ jq, mustache ]
 * with jq dep just for easier dom manipulation in IE
 * with mustache for easier template manipulation
 * with no *md wrp, just add to Global object
 * consider to use EventEmitter later [ or Promise ]
 */

~(function(global, factory) {
  /* export */
  global.Modal = factory();

})(this, function(undefined) {
  /* factory fn */

  /* modal id */
  var id = 0;

  /* modal cnt */
  var modalCnt = 0;

  /* opr modal cnt */
  var incModalCnt = function() {
    ++ modalCnt;
  }

  var decModalCnt = function() {
    -- modalCnt;
  }

  var hasModalInstance = function() {
    return modalCnt > 0;
  }

  /* cache */
  var toString = Object.prototype.toString;

  /* noop fn */
  var noop = function() { };

  /**
   * gen modal id
   * @private
   * @return { Number } generated id
   */
  var genId = function() {
    return ++id;
  }

  /**
   * get type of target
   * curring
   * @param { String } type the Constructor type
   * @return { Function }
   */
  var isType = function(type) {
    return function(target) {
      return toString.call(target) === '[object ' + type + ']';
    }
  }

  /* some instances */
  var isFunction = isType('Function');

  /* layer html */
  var layerHtml = '<div class="easy-modal-layer"></div>';

  /* modal instance html */
  var modalHtml = {
    // title bar
    title: '<div class="easy-modal-title-bar"><div class="easy-modal-title">{{ title }}</div><a class="easy-modal-close-icon">x</a></div>',
    // content wrapper
    content: '<div class="easy-modal-content">{{{ content }}}</div>',
    // button bar
    button: '<div class="easy-modal-button-wrp"><button class="easy-modal-btn ok-btn">{{ okVal }}</button><button class="easy-modal-btn ccl-btn">{{ cclVal }}</button></div>'
  };

  /**
   * has layer
   * @private
   * @return { Boolean } whether has layer
   */
  var hasLayer = function() {
    return $('.easy-modal-layer').length === 1;
  }

  /**
   * set layer
   * @private
   * @return { Undefined }
   */
  var setLayer = function() {
    $('body').append(layerHtml);
  }

  /**
   * hide layer
   * @private
   * @return { Undefined }
   */
  var hideLayer = function() {
    $('.easy-modal-layer').hide();
  }

  /**
   * show layer
   * @private
   * @return { Undefined }
   */
  var showLayer = function() {
    $('.easy-modal-layer').show();
  }

  /* default opts for construct once */
  var defaultOpts = {
    title: '标题',
    okVal: '确 认',
    cclVal: '取　消',
    ok: noop,
    ccl: noop
  };

  /**
   * @class
   * @param { String } content  plain String or HTML fragment
   * @param { Object } opts     opts will be set to modal instance
   */
  var Modal = function(content, opts) {

    // construct
    this.id = genId();
    this.content = content;
    this.opts = $.extend({ }, defaultOpts, opts);

    // initialization
    this.init();
  }

  /**
   * Modal prototype
   */
  var proto = Modal.prototype;

  /* fix constructor */
  proto.constructor = Modal;

  /**
   * init
   * @return { Object } modal instance
   */
  proto.init = function() {

    var that = this;

    /* gen a fn bind this */
    // var closeBindThisCallback = this.close.bind(this);
    // for IE support, shit.
    var closeBindThisCallback = function() {
      var args = Array.prototype.slice.call(arguments);
      this.close.apply(that, args);
    }

    incModalCnt();

    if (! hasLayer()) {
      setLayer();
      showLayer();
    }
    else {
      showLayer();
    }

    var $content = $('<div id="easy-modal-box-no-' + this.id + '" class="easy-modal-box">' +
                    Mustache.render(modalHtml.title, this.opts) +
                    Mustache.render(modalHtml.content, this) +
                    Mustache.render(modalHtml.button, this.opts) +
                    '</div>');

    /* deal with `ok` and `cancel` btn's click callback */
    var dealBtn = function(fn, $dom) {
      // if is false value, remove $dom
      if (! fn) {
        $dom.remove();
      }
      // if is Function, then wrap that and proto.close
      else if (isFunction(fn)) {
        var fnWrp = function() {
          // var result = fn.bind(that)();
          // for IE support, shit.
          var result = fn.call(that);
          /* if returned value is not strictly equal to `false`, prevent modal close */
          if (result !== false) {
            that.close();
          }
        }
        $dom.on('click', fnWrp);
      }
      // directly bind close callback
      else {
        $dom.on('click', closeBindThisCallback);
      }
    }

    var ok = this.opts.ok;
    var ccl = this.opts.ccl;
    dealBtn(ok, $('.ok-btn', $content));
    dealBtn(ccl, $('.ccl-btn', $content));

    /* if no ok or cancel callback, remove btn-wrp */
    if (!(ok || ccl)) {
      $('.easy-modal-button-wrp', $content).remove();
    }

    /* add close icon click callback */
    $('.easy-modal-close-icon', $content).on('click', closeBindThisCallback);

    $('body').append($content);
  }

  /**
   * close
   * @return { Object } modal instance
   */
  proto.close = function() {

    decModalCnt();

    var $box = $('#easy-modal-box-no-' + this.id);
    $('.easy-model-btn', $box).off('click');
    $box.remove();

    if (! hasModalInstance()) {
      hideLayer();
    }
  }

  return Modal;

});
