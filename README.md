HTML5 Drawing Book
========
Completely written in CoffeeScript.

Fetures
----------------------------
1. Custom brushes.
2. Custom crayons.
3. Multiple pages support.
4. Included PSDs.
5. CSS3 animations.
6. Background images
7. Small footprint.

Example
----------------------------
```javascript
(function(){
    var bookPages = [
      { outlineImage: {path:'img/drawings/canvas-bg4.png'} }
      ,{ outlineImage: {path:'img/drawings/canvas-bg2.png'} }
      ,{ outlineImage: {path:'img/drawings/canvas-bg3.png'} }
    ];

    var app = new drawingApp({
      pages: bookPages,
      renderTo: '.book2',
      canvasWidth: 900,
      canvasHeight: 650
    });
})();
```

----------------------------
[Live demo](http://qualyapp.com/html5-canvas-drawing-book)

----------------------------
![demo1](http://qualyapp.com/img/proyectos/drawing-book/ipad.png)
