class DrawingApp
    constructor: (@opts) ->
    	defaults =
    		renderTo: '.drawing-book',
    		pages: null
    		canvasWidth: null
    		canvasHeight: null

    	@animatingPage = false
    	@pages = []
    	@imagesToLoad = 0
    	@currPageNum = 0

    	@options = $.extend(defaults,opts)
    	@book = $(this.options.renderTo)
    	@preloadImages()

        # onLoad
    	$ ->
        new FastClick(document.body)

    createBook: ->
      @options.canvasWidth ?= $(window).width()
      @options.canvasHeight ?= $(window).height()

      @book.css
          width: @options.canvasWidth
          height: @options.canvasHeight

      #create clickable arrows
      @setupPageControls() if @options.pages.length > 1

      first = true
      i = 0

      for p in @options.pages
      	p.background = color: "#fff" unless p.background
      	p.background = color: "#fff" if not p.background.color and not p.background.image

      	page = @createPage(i++, first, p.background)
      	newPage = new CanvasHandler(
              canvas: page.find(".sketch")
              bgCanvas: page.find(".bg-sketch")
              brushImage: null
              bgImage: p.outlineImage.img
              canvasWidth: @options.canvasWidth
              canvasHeight: @options.canvasHeight
      	)
      	@pages.push newPage
      	first = false

      colors = @book.find(".colors").css("display", "block")
      colors.find("a").bind "click", $.proxy(@onColorChange, this)
      colors.find("a.active").trigger "click"

    preloadImages: ->
      colors = $(@options.renderTo).find(".colors a")
      for color in colors
      	if $(color).data("brush") isnt `undefined`
      	  @imagesToLoad++
      	  img = new Image()
      	  img.onload = $.proxy(@.onImageLoaded, @)
      	  img.src = $(color).data("brush")

      #load outline images
      for p in @options.pages
      	@imagesToLoad++
      	bg = new Image()
      	p.outlineImage.img = bg #save the obj to use it later
      	bg.onload = $.proxy(@.onImageLoaded, @)
      	bg.src = p.outlineImage.path

    onImageLoaded: ->
    	@imagesToLoad--
    	if @imagesToLoad <= 0
        $ => @createBook()

    createPage: (pageNum, active, background) ->
        _class = (if active is true then "active" else "inactive")

        #add page id
        _class += " js-page-" + pageNum

        background = if background.color isnt `undefined` then background.color else "transparent"
        background = if background.image isnt `undefined` then " url(" + background.image + ");" else ";"
        backgroundStyle = "style=\"background: #{background}\""

        pageHTML = "
            <div data-num=\"#{pageNum}\" #{backgroundStyle} class=\"page animated #{_class}\">
                <canvas width=\"#{@options.canvasWidth}\" height=\"#{@options.canvasHeight}\" class=\"sketch\" ></canvas>
                <canvas width=\"#{@options.canvasWidth}\" height=\"#{@options.canvasHeight}\" class=\"bg-sketch\" ></canvas>
            </div>"

        page = $(pageHTML)
        $(@options.renderTo).append page

        marginLeft = (if active then -(@options.canvasWidth / 2) else -@options.canvasWidth * 2)
        page.css
        	width: @options.canvasWidth
        	height: @options.canvasHeight
        	marginLeft: marginLeft
        	marginTop: -(@options.canvasHeight / 2)
        	left: "50%"
        	top: "50%"

    onColorChange: (e) ->
    	e.preventDefault()
    	button = $(e.currentTarget)

    	return @pages[@currPageNum].clear() if button.hasClass("reset")

    	$(@options.renderTo).find(".colors a.active").removeClass "active"
    	button.addClass "active"

    	#change the brush for all pages
    	p.setBrushColor(button) for p in @pages

    setupPageControls: ->
      $(@options.renderTo).find(".paginator").show().find("a").bind "click", (e) =>
        e.preventDefault()
        return if @animatingPage
        @animatingPage = true
        button = $(e.currentTarget)
        return  if button.attr("disabled") is ""
        currPage = $(@options.renderTo).find(".page.active")
        img = button.find("img")
        @currPageNum = parseInt(currPage.data("num"))

        if button.hasClass("js-left")
          nextArrow = button.next().find("img")
          nextArrow.attr "src", nextArrow.data("img-enabled")
          prev = $(@options.renderTo).find(".js-page-" + (@currPageNum - 1))
          currPage.addClass("fadeOutRightBig").removeClass "active"
          prev.addClass("fadeInLeftBig active").removeClass("inactive").css "marginLeft", -@options.canvasWidth / 2
          setTimeout (=>
            @clearPage currPage
          ), 1000

          #disable button if there arent more pages
          if $(@options.renderTo).find(".js-page-" + (@currPageNum - 2)).length is 0
            button.attr "disabled", ""
            img.attr "src", img.data("img-disabled")
          else
            button.removeAttr "disabled"
            img.attr "src", img.data("img-enabled")
          img = $("a.js-right").removeAttr("disabled").find("img")
          img.attr "src", img.data("image-enabled")
          @currPageNum--
        else
          prevArrow = button.prev().find("img")
          prevArrow.attr "src", prevArrow.data("img-enabled")
          next = $(@options.renderTo).find(".js-page-" + (@currPageNum + 1))
          currPage.addClass("fadeOutLeftBig").removeClass "active"
          next.addClass("fadeInRightBig active").removeClass("inactive").css "marginLeft", -@options.canvasWidth / 2
          setTimeout (=>
            @clearPage currPage
          ), 1000

          #disable button if there arent more pages
          if $(@options.renderTo).find(".js-page-" + (@currPageNum + 2)).length is 0
            button.attr "disabled", ""
            img.attr "src", img.data("img-disabled")
          img = $(@options.renderTo).find("a.js-left").removeAttr("disabled").find("img")
          img.attr "src", img.data("image-enabled")
          @currPageNum++


    clearPage: (page) ->
    	page.removeClass("fadeInRightBig fadeInLeftBig fadeOutLeftBig fadeOutRightBig").css "marginLeft", -@options.canvasWidth * 2
    	@animatingPage = false

window.drawingApp = (params) -> new DrawingApp(params)