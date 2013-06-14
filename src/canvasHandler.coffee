class CanvasHandler

    constructor: (opts) ->
        @renderFunction = (if not opts.brushImage then @updateCanvasByLine else @updateCanvasByBrush)
        @brush = opts.brushImage
        @touchSupported = Modernizr.touch
        @canvas = opts.canvas
        @context = @canvas.get(0).getContext("2d")
        @context.strokeStyle = "#000000"
        @context.lineWidth = 3
        @lastMousePoint =
          x: 0
          y: 0

        if @touchSupported
          @mouseDownEvent = "touchstart"
          @mouseMoveEvent = "touchmove"
          @mouseUpEvent = "touchend"
        else
          @mouseDownEvent = "mousedown"
          @mouseMoveEvent = "mousemove"
          @mouseUpEvent = "mouseup"

        if opts.bgCanvas and opts.bgImage
          @bgCanvas = opts.bgCanvas
          @bgContext = @bgCanvas.get(0).getContext("2d")
          @bgContext.drawImage opts.bgImage, (opts.canvasWidth - opts.bgImage.width) / 2, (opts.canvasHeight - opts.bgImage.height) / 2
          @bgCanvas.bind @mouseDownEvent, @onCanvasMouseDown()

    setBrushColor: (button) ->
        if button.hasClass("eraser")
          @renderFunction = @updateCanvasByLine
          @context.lineWidth = 30
          @context.globalCompositeOperation = "destination-out"
          @context.strokeStyle = "rgba(0,0,0,1)"
          return

        @context.globalCompositeOperation = "source-over"

        if button.data("brush") isnt null
          brushImage = new Image()
          brushImage.src = button.data("brush")
          @renderFunction = @updateCanvasByBrush
          @brush = brushImage
        else
          @context.strokeStyle = button.css("background-color")

    onCanvasMouseDown: ->
        (event) =>
          # return  if @touchSupported and event.button isnt 0
          @.mouseMoveHandler = @.onCanvasMouseMove()
          @.mouseUpHandler = @.onCanvasMouseUp()
          $(document).bind @.mouseMoveEvent, @.mouseMoveHandler
          $(document).bind @.mouseUpEvent, @.mouseUpHandler
          @.updateMousePosition event
          @.renderFunction event

    onCanvasMouseMove: ->
        (event) =>
          @.renderFunction event
          event.preventDefault()
          false

    onCanvasMouseUp: (event) ->
        (event) =>
          $(document).unbind @.mouseMoveEvent, @.mouseMoveHandler
          $(document).unbind @.mouseUpEvent, @.mouseUpHandler
          @.mouseMoveHandler = null
          @.mouseUpHandler = null

    updateMousePosition: (event) ->
        target = if @touchSupported then event.targetTouches[0] else event
        offset = @canvas.offset()
        @lastMousePoint.x = target.pageX - offset.left
        @lastMousePoint.y = target.pageY - offset.top

    updateCanvasByLine: (event) ->
        @context.beginPath()
        @context.moveTo @lastMousePoint.x, @lastMousePoint.y
        @updateMousePosition event
        @context.lineTo @lastMousePoint.x, @lastMousePoint.y
        @context.stroke()

    updateCanvasByBrush: (event) ->
        halfBrushW = @brush.width / 2
        halfBrushH = @brush.height / 2
        start =
          x: @lastMousePoint.x
          y: @lastMousePoint.y

        @updateMousePosition event
        end =
          x: @lastMousePoint.x
          y: @lastMousePoint.y

        distance = parseInt(@distanceBetween2Points(start, end))
        angle = @angleBetween2Points(start, end)
        x = undefined
        y = undefined
        z = 0

        while (z <= distance or z is 0)
          x = start.x + (Math.sin(angle) * z) - halfBrushW
          y = start.y + (Math.cos(angle) * z) - halfBrushH
          @context.drawImage @brush, x, y
          z++

    updateMousePosition: (event) ->
      target = if @touchSupported then event.targetTouches[0] else event
      offset = @canvas.offset()
      @lastMousePoint.x = target.pageX - offset.left
      @lastMousePoint.y = target.pageY - offset.top

    clear: ->
        c = @canvas[0]
        @context.clearRect 0, 0, c.width, c.height

    distanceBetween2Points: (point1, point2) ->
        dx = point2.x - point1.x
        dy = point2.y - point1.y
        Math.sqrt Math.pow(dx, 2) + Math.pow(dy, 2)

    angleBetween2Points: (point1, point2) ->
        dx = point2.x - point1.x
        dy = point2.y - point1.y
        Math.atan2 dx, dy
