(function() {
  var CanvasHandler, DrawingApp;

  DrawingApp = (function() {
    function DrawingApp(opts) {
      var defaults;
      this.opts = opts;
      defaults = {
        renderTo: '.drawing-book',
        pages: null,
        canvasWidth: null,
        canvasHeight: null
      };
      this.animatingPage = false;
      this.pages = [];
      this.imagesToLoad = 0;
      this.currPageNum = 0;
      this.options = $.extend(defaults, opts);
      this.book = $(this.options.renderTo);
      this.preloadImages();
      $(function() {
        return new FastClick(document.body);
      });
    }

    DrawingApp.prototype.createBook = function() {
      var colors, first, i, newPage, p, page, _base, _base1, _i, _len, _ref;
      if ((_base = this.options).canvasWidth == null) {
        _base.canvasWidth = $(window).width();
      }
      if ((_base1 = this.options).canvasHeight == null) {
        _base1.canvasHeight = $(window).height();
      }
      this.book.css({
        width: this.options.canvasWidth,
        height: this.options.canvasHeight
      });
      if (this.options.pages.length > 1) {
        this.setupPageControls();
      }
      first = true;
      i = 0;
      _ref = this.options.pages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        if (!p.background) {
          p.background = {
            color: "#fff"
          };
        }
        if (!p.background.color && !p.background.image) {
          p.background = {
            color: "#fff"
          };
        }
        page = this.createPage(i++, first, p.background);
        newPage = new CanvasHandler({
          canvas: page.find(".sketch"),
          bgCanvas: page.find(".bg-sketch"),
          brushImage: null,
          bgImage: p.outlineImage.img,
          canvasWidth: this.options.canvasWidth,
          canvasHeight: this.options.canvasHeight
        });
        this.pages.push(newPage);
        first = false;
      }
      colors = this.book.find(".colors").css("display", "block");
      colors.find("a").bind("click", $.proxy(this.onColorChange, this));
      return colors.find("a.active").trigger("click");
    };

    DrawingApp.prototype.preloadImages = function() {
      var bg, color, colors, img, p, _i, _j, _len, _len1, _ref, _results;
      colors = $(this.options.renderTo).find(".colors a");
      for (_i = 0, _len = colors.length; _i < _len; _i++) {
        color = colors[_i];
        if ($(color).data("brush") !== undefined) {
          this.imagesToLoad++;
          img = new Image();
          img.onload = $.proxy(this.onImageLoaded, this);
          img.src = $(color).data("brush");
        }
      }
      _ref = this.options.pages;
      _results = [];
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        p = _ref[_j];
        this.imagesToLoad++;
        bg = new Image();
        p.outlineImage.img = bg;
        bg.onload = $.proxy(this.onImageLoaded, this);
        _results.push(bg.src = p.outlineImage.path);
      }
      return _results;
    };

    DrawingApp.prototype.onImageLoaded = function() {
      var _this = this;
      this.imagesToLoad--;
      if (this.imagesToLoad <= 0) {
        return $(function() {
          return _this.createBook();
        });
      }
    };

    DrawingApp.prototype.createPage = function(pageNum, active, background) {
      var backgroundStyle, marginLeft, page, pageHTML, _class;
      _class = (active === true ? "active" : "inactive");
      _class += " js-page-" + pageNum;
      background = background.color !== undefined ? background.color : "transparent";
      background = background.image !== undefined ? " url(" + background.image + ");" : ";";
      backgroundStyle = "style=\"background: " + background + "\"";
      pageHTML = "            <div data-num=\"" + pageNum + "\" " + backgroundStyle + " class=\"page animated " + _class + "\">                <canvas width=\"" + this.options.canvasWidth + "\" height=\"" + this.options.canvasHeight + "\" class=\"sketch\" ></canvas>                <canvas width=\"" + this.options.canvasWidth + "\" height=\"" + this.options.canvasHeight + "\" class=\"bg-sketch\" ></canvas>            </div>";
      page = $(pageHTML);
      $(this.options.renderTo).append(page);
      marginLeft = (active ? -(this.options.canvasWidth / 2) : -this.options.canvasWidth * 2);
      return page.css({
        width: this.options.canvasWidth,
        height: this.options.canvasHeight,
        marginLeft: marginLeft,
        marginTop: -(this.options.canvasHeight / 2),
        left: "50%",
        top: "50%"
      });
    };

    DrawingApp.prototype.onColorChange = function(e) {
      var button, p, _i, _len, _ref, _results;
      e.preventDefault();
      button = $(e.currentTarget);
      if (button.hasClass("reset")) {
        return this.pages[this.currPageNum].clear();
      }
      $(this.options.renderTo).find(".colors a.active").removeClass("active");
      button.addClass("active");
      _ref = this.pages;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        _results.push(p.setBrushColor(button));
      }
      return _results;
    };

    DrawingApp.prototype.setupPageControls = function() {
      var _this = this;
      return $(this.options.renderTo).find(".paginator").show().find("a").bind("click", function(e) {
        var button, currPage, img, next, nextArrow, prev, prevArrow;
        e.preventDefault();
        if (_this.animatingPage) {
          return;
        }
        _this.animatingPage = true;
        button = $(e.currentTarget);
        if (button.attr("disabled") === "") {
          return;
        }
        currPage = $(_this.options.renderTo).find(".page.active");
        img = button.find("img");
        _this.currPageNum = parseInt(currPage.data("num"));
        if (button.hasClass("js-left")) {
          nextArrow = button.next().find("img");
          nextArrow.attr("src", nextArrow.data("img-enabled"));
          prev = $(_this.options.renderTo).find(".js-page-" + (_this.currPageNum - 1));
          currPage.addClass("fadeOutRightBig").removeClass("active");
          prev.addClass("fadeInLeftBig active").removeClass("inactive").css("marginLeft", -_this.options.canvasWidth / 2);
          setTimeout((function() {
            return _this.clearPage(currPage);
          }), 1000);
          if ($(_this.options.renderTo).find(".js-page-" + (_this.currPageNum - 2)).length === 0) {
            button.attr("disabled", "");
            img.attr("src", img.data("img-disabled"));
          } else {
            button.removeAttr("disabled");
            img.attr("src", img.data("img-enabled"));
          }
          img = $("a.js-right").removeAttr("disabled").find("img");
          img.attr("src", img.data("image-enabled"));
          return _this.currPageNum--;
        } else {
          prevArrow = button.prev().find("img");
          prevArrow.attr("src", prevArrow.data("img-enabled"));
          next = $(_this.options.renderTo).find(".js-page-" + (_this.currPageNum + 1));
          currPage.addClass("fadeOutLeftBig").removeClass("active");
          next.addClass("fadeInRightBig active").removeClass("inactive").css("marginLeft", -_this.options.canvasWidth / 2);
          setTimeout((function() {
            return _this.clearPage(currPage);
          }), 1000);
          if ($(_this.options.renderTo).find(".js-page-" + (_this.currPageNum + 2)).length === 0) {
            button.attr("disabled", "");
            img.attr("src", img.data("img-disabled"));
          }
          img = $(_this.options.renderTo).find("a.js-left").removeAttr("disabled").find("img");
          img.attr("src", img.data("image-enabled"));
          return _this.currPageNum++;
        }
      });
    };

    DrawingApp.prototype.clearPage = function(page) {
      page.removeClass("fadeInRightBig fadeInLeftBig fadeOutLeftBig fadeOutRightBig").css("marginLeft", -this.options.canvasWidth * 2);
      return this.animatingPage = false;
    };

    return DrawingApp;

  })();

  window.drawingApp = function(params) {
    return new DrawingApp(params);
  };

  CanvasHandler = (function() {
    function CanvasHandler(opts) {
      this.renderFunction = (!opts.brushImage ? this.updateCanvasByLine : this.updateCanvasByBrush);
      this.brush = opts.brushImage;
      this.touchSupported = Modernizr.touch;
      this.canvas = opts.canvas;
      this.context = this.canvas.get(0).getContext("2d");
      this.context.strokeStyle = "#000000";
      this.context.lineWidth = 3;
      this.lastMousePoint = {
        x: 0,
        y: 0
      };
      if (this.touchSupported) {
        this.mouseDownEvent = "touchstart";
        this.mouseMoveEvent = "touchmove";
        this.mouseUpEvent = "touchend";
      } else {
        this.mouseDownEvent = "mousedown";
        this.mouseMoveEvent = "mousemove";
        this.mouseUpEvent = "mouseup";
      }
      if (opts.bgCanvas && opts.bgImage) {
        this.bgCanvas = opts.bgCanvas;
        this.bgContext = this.bgCanvas.get(0).getContext("2d");
        this.bgContext.drawImage(opts.bgImage, (opts.canvasWidth - opts.bgImage.width) / 2, (opts.canvasHeight - opts.bgImage.height) / 2);
        this.bgCanvas.bind(this.mouseDownEvent, this.onCanvasMouseDown());
      }
    }

    CanvasHandler.prototype.setBrushColor = function(button) {
      var brushImage;
      if (button.hasClass("eraser")) {
        this.renderFunction = this.updateCanvasByLine;
        this.context.lineWidth = 30;
        this.context.globalCompositeOperation = "destination-out";
        this.context.strokeStyle = "rgba(0,0,0,1)";
        return;
      }
      this.context.globalCompositeOperation = "source-over";
      if (button.data("brush") !== null) {
        brushImage = new Image();
        brushImage.src = button.data("brush");
        this.renderFunction = this.updateCanvasByBrush;
        return this.brush = brushImage;
      } else {
        return this.context.strokeStyle = button.css("background-color");
      }
    };

    CanvasHandler.prototype.onCanvasMouseDown = function() {
      var _this = this;
      return function(event) {
        _this.mouseMoveHandler = _this.onCanvasMouseMove();
        _this.mouseUpHandler = _this.onCanvasMouseUp();
        $(document).bind(_this.mouseMoveEvent, _this.mouseMoveHandler);
        $(document).bind(_this.mouseUpEvent, _this.mouseUpHandler);
        _this.updateMousePosition(event);
        return _this.renderFunction(event);
      };
    };

    CanvasHandler.prototype.onCanvasMouseMove = function() {
      var _this = this;
      return function(event) {
        _this.renderFunction(event);
        event.preventDefault();
        return false;
      };
    };

    CanvasHandler.prototype.onCanvasMouseUp = function(event) {
      var _this = this;
      return function(event) {
        $(document).unbind(_this.mouseMoveEvent, _this.mouseMoveHandler);
        $(document).unbind(_this.mouseUpEvent, _this.mouseUpHandler);
        _this.mouseMoveHandler = null;
        return _this.mouseUpHandler = null;
      };
    };

    CanvasHandler.prototype.updateMousePosition = function(event) {
      var offset, target;
      target = this.touchSupported ? event.targetTouches[0] : event;
      offset = this.canvas.offset();
      this.lastMousePoint.x = target.pageX - offset.left;
      return this.lastMousePoint.y = target.pageY - offset.top;
    };

    CanvasHandler.prototype.updateCanvasByLine = function(event) {
      this.context.beginPath();
      this.context.moveTo(this.lastMousePoint.x, this.lastMousePoint.y);
      this.updateMousePosition(event);
      this.context.lineTo(this.lastMousePoint.x, this.lastMousePoint.y);
      return this.context.stroke();
    };

    CanvasHandler.prototype.updateCanvasByBrush = function(event) {
      var angle, distance, end, halfBrushH, halfBrushW, start, x, y, z, _results;
      halfBrushW = this.brush.width / 2;
      halfBrushH = this.brush.height / 2;
      start = {
        x: this.lastMousePoint.x,
        y: this.lastMousePoint.y
      };
      this.updateMousePosition(event);
      end = {
        x: this.lastMousePoint.x,
        y: this.lastMousePoint.y
      };
      distance = parseInt(this.distanceBetween2Points(start, end));
      angle = this.angleBetween2Points(start, end);
      x = void 0;
      y = void 0;
      z = 0;
      _results = [];
      while (z <= distance || z === 0) {
        x = start.x + (Math.sin(angle) * z) - halfBrushW;
        y = start.y + (Math.cos(angle) * z) - halfBrushH;
        this.context.drawImage(this.brush, x, y);
        _results.push(z++);
      }
      return _results;
    };

    CanvasHandler.prototype.updateMousePosition = function(event) {
      var offset, target;
      target = this.touchSupported ? event.targetTouches[0] : event;
      offset = this.canvas.offset();
      this.lastMousePoint.x = target.pageX - offset.left;
      return this.lastMousePoint.y = target.pageY - offset.top;
    };

    CanvasHandler.prototype.clear = function() {
      var c;
      c = this.canvas[0];
      return this.context.clearRect(0, 0, c.width, c.height);
    };

    CanvasHandler.prototype.distanceBetween2Points = function(point1, point2) {
      var dx, dy;
      dx = point2.x - point1.x;
      dy = point2.y - point1.y;
      return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    };

    CanvasHandler.prototype.angleBetween2Points = function(point1, point2) {
      var dx, dy;
      dx = point2.x - point1.x;
      dy = point2.y - point1.y;
      return Math.atan2(dx, dy);
    };

    return CanvasHandler;

  })();

}).call(this);
