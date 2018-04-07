// ------------------------------------------------------------------
//
// This is the graphics rendering code for the game.
//
// ------------------------------------------------------------------
MyGame.graphics = (function() {
    'use strict';

    let canvas = document.getElementById('canvas-main');
    let context = canvas.getContext('2d');
    
    let map = Map.create();
    let smallMap = SmallMap.create();
    map.setMap(smallMap.data);
    let image = new Image();
    image.src = map.mapFile.tilesets[1].image;
    let viewPort = MyGame.components.ViewPortal();
    viewPort.mapWidth = map.mapWidth;
    viewPort.mapHeight = map.mapHeight;


    //------------------------------------------------------------------
    //
    // Place a 'clear' function on the Canvas prototype, this makes it a part
    // of the canvas, rather than making a function that calls and does it.
    //
    //------------------------------------------------------------------
    CanvasRenderingContext2D.prototype.clear = function() {
        this.save();
        this.setTransform(1, 0, 0, 1, 0, 0);
        this.clearRect(0, 0, canvas.width, canvas.height);
        this.restore();
    };

    function getClientWidth(){
        return document.body.clientWidth;
    }

    function getClientHeight(){
        return document.body.clientHeight;
    }

    function getCanvasWidth(){
        return canvas.clientWidth;
    }

    function getCanvasHeight() {
        return canvas.clientHeight;
    }

    //------------------------------------------------------------------
    //
    // Public function that allows the client code to clear the canvas.
    //
    //------------------------------------------------------------------
    function clear() {
        context.clear();
    }

    //------------------------------------------------------------------
    //
    // Simple pass-through to save the canvas context.
    //
    //------------------------------------------------------------------
    function saveContext() {
        context.save();
    }

    //------------------------------------------------------------------
    //
    // Simple pass-through the restore the canvas context.
    //
    //------------------------------------------------------------------
    function restoreContext() {
        context.restore();
    }

    function updateCanvas() {
        canvas.width = 700;
        canvas.height = 700;
    }

    //------------------------------------------------------------------
    //
    // Rotate the canvas to prepare it for rendering of a rotated object.
    //
    //------------------------------------------------------------------
    function rotateCanvas(center, rotation) {
        context.translate(center.x * canvas.width, center.y * canvas.width);
        context.rotate(rotation);
        context.translate(-center.x * canvas.width, -center.y * canvas.width);
    }

    //------------------------------------------------------------------
    //
    // Draw a portion of the map on screen with given view portal's center.
    //
    //------------------------------------------------------------------
    function drawMapPortion() {
        let clipX = 0;
        let clipY = 0;
        let cornerX = viewPort.center.x - (viewPort.width/2);
        let cornerY = viewPort.center.y - (viewPort.height/2);
        let topIndexCol = Math.max(Math.floor(cornerX/map.tileWidth),0);
        let topIndexRow = Math.max(Math.floor(cornerY/map.tileHeight),0);
        let botIndexCol = Math.min(Math.floor((viewPort.center.x + (viewPort.width/2))/map.tileWidth),map.mapFile.width) + 10;
        let botIndexRow = Math.min(Math.floor((viewPort.center.y + (viewPort.height/2))/map.tileHeight),map.mapFile.height) + 10;
        let tileXCordinate = topIndexCol * map.tileWidth;
        let tileYCordinate = topIndexRow * map.tileHeight;
        let startX = Math.min((tileXCordinate - cornerX),0);
        let curX = startX;
        let curY = Math.min((tileYCordinate - cornerY),0);
        for (let i = topIndexRow; i < botIndexRow; i++){
            if (i < map.mapFile.height){ 
                for (let j = topIndexCol; j < botIndexCol; j++){
                    if (j < map.mapFile.width){
                        clipX = ((map.map[i][j] % map.mapFile.tilesets[1].columns) - 1 ) * map.mapFile.tilesets[1].tilewidth;
                        clipY = Math.floor(map.map[i][j] / map.mapFile.tilesets[1].columns) * map.mapFile.tilesets[1].tileheight;
                        context.drawImage(
                            image,
                            clipX, clipY,
                            map.mapFile.tilesets[1].tilewidth,
                            map.mapFile.tilesets[1].tileheight,
                            curX, curY,
                            map.mapFile.tilesets[1].tilewidth,
                            map.mapFile.tilesets[1].tileheight
                        );
                        curX += map.mapFile.tilesets[1].tilewidth;
                    }
                }
                curX = startX;
                curY += map.mapFile.tilesets[1].tileheight;
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Draw an image into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawImage(texture, center, size) {
        let localCenter = {
            x: center.x * viewPort.width,
            y: center.y * viewPort.height
        };
        let localSize = {
            width: size.width * viewPort.width,
            height: size.height * viewPort.height
        };

        context.drawImage(texture,
            localCenter.x - localSize.width / 2,
            localCenter.y - localSize.height / 2,
            localSize.width,
            localSize.height);
    }

    //------------------------------------------------------------------
    //
    // Draw an image out of a spritesheet into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawImageSpriteSheet(spriteSheet, spriteSize, sprite, center, size) {
        let localCenter = {
            x: center.x * canvas.width,
            y: center.y * canvas.width
        };
        let localSize = {
            width: size.width * canvas.width,
            height: size.height * canvas.height
        };

        context.drawImage(spriteSheet,
            sprite * spriteSize.width, 0,                 // which sprite to render
            spriteSize.width, spriteSize.height,    // size in the spritesheet
            localCenter.x - localSize.width / 2,
            localCenter.y - localSize.height / 2,
            localSize.width, localSize.height);
    }

    //------------------------------------------------------------------
    //
    // Draw a circle into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawCircle(center, radius, color) {
        console.log(center);
        context.beginPath();
        context.arc(center.x * canvas.width, center.y * canvas.width, 2 * radius * canvas.width, 2 * Math.PI, false);
        context.closePath();
        context.fillStyle = color;
        context.fill();
    }

    //------------------------------------------------------------------
    /*
    Circle expects a spec with
        center.x
        center.y
        radius
        fillStyle
        strokeStyle
        lineWidth
    */
    //------------------------------------------------------------------
    function Circle(spec){
        let that = {};
        that.draw = function(){
            context.beginPath();
            context.arc(spec.centerX, spec.centerY, spec.radius, 0, 2*3.14159265);
            context.closePath();
            context.strokeStyle = spec.strokeStyle;
            context.stroke();
            context.fillStyle = spec.fillStyle;
            context.fill();
        }
        return that;
    }

    //------------------------------------------------------------------
    /*
    Rectangle expects a spec with
        rotation
        x
        y
        width
        height
        fillStyle
        strokeStyle
        lineWidth (optional)
    */
    //------------------------------------------------------------------
    function Rectangle(spec){
        let that = {};
        let hasFillStyle = spec.hasOwnProperty('fillStyle');
        let hasLineWidth = spec.hasOwnProperty('lineWidth');
        let hasStrokeStyle = spec.hasOwnProperty('strokeStyle');

        that.updateRotation = function(angle){
            spec.rotation += angle;
        };

        that.draw = function(){
            //Rotating a shape
            //1. Translate (0,0) of canvas to center of shape
            context.save();
            context.translate(spec.x + spec.width/2, spec.y + spec.height/2);
            //2. Rotate canvas
            context.rotate(spec.rotation);
            context.translate(-(spec.x + spec.width/2), -(spec.y + spec.height/2));
            //3. Draw shape at original coordinates
            if (hasFillStyle){
                context.fillStyle = spec.fillStyle;
                context.fillRect(spec.x, spec.y, spec.width, spec.height);
            }
            if (hasLineWidth){
                context.lineWidth = spec.lineWidth;
            }
            if (hasStrokeStyle){
                context.strokeStyle = spec.strokeStyle;
                context.strokeRect(spec.x, spec.y, spec.width, spec.height);
            }
            //4. Undo translations and rotations of canvas.
            context.restore();
        };

        return that;
    }

    //------------------------------------------------------------------
    /*
    Texture function passed spec property expects
      spec.imageSrc
      spec.rotation
      spec.center.x
      spec.center.y
      spec.width
      spec.height
    Texture function 'has' the following properties
      .draw
      .updateRotation
    */
    //------------------------------------------------------------------
    function Texture(spec){
        let that = {},
            ready = false,
            image = new Image();
        
        image.onload = function(){
            ready = true;
        };
        image.src = spec.imageSrc;
        that.updateRotation = function(angle){
            spec.rotation += angle;
        };
        
        that.draw = function(){
            if (ready){
                context.save();
                context.translate(spec.x, spec.y);
                context.rotate(spec.rotation);
                context.translate(-spec.x, -spec.y);

                context.drawImage(
                    image,
                    spec.x - spec.width/2,
                    spec.y -spec.height/2,
                    spec.width, spec.height);

                context.restore();   
            }
        };

        return that;
    }

    //------------------------------------------------------------------
    /*
    Background makes a texture that has width and height of the canvas.
      src
    */
    //------------------------------------------------------------------
    function Background(src){
        let bck = {
            center: {x: canvas.width/2, y: canvas.height/2},
            rotation: 0,
            imageSrc: src,
            width: canvas.width,
            height: canvas.height,
        };
        return Texture(bck);
    }

    //------------------------------------------------------------------
    /*
    Letters expects a spec with...
      text
      font
      x 
      y 
      lineWidth (optional)
      fillStyle (optional)
      strokeStyle (optional)
      align (optional)
      baseline (optional)
    */
    //------------------------------------------------------------------
    function Letters(spec){
        let that = {};

        that.draw = function(){
            context.font = spec.font;
            if (spec.hasOwnProperty('lineWidth')){
                context.lineWidth = spec.lineWidth;
            }
            if (spec.hasOwnProperty('align')){
                context.textAlign = spec.align;
            }
            if (spec.hasOwnProperty('baseline')){
                context.textBaseline = spec.baseline;
            }
            if (spec.hasOwnProperty('fillStyle')){
                context.fillStyle = spec.fillStyle;
                context.fillText(spec.text, spec.x, spec.y);
            }
            if (spec.hasOwnProperty('strokeStyle')){
                context.strokeStyle = spec.strokeStyle;
                context.strokeText(spec.text, spec.x, spec.y);
            }
        }

        return that;
    }

    return {
        getClientWidth : getClientWidth,
        getClientHeight : getClientHeight,
        getCanvasHeight : getCanvasHeight,
        getCanvasWidth : getCanvasWidth,
        updateCanvas: updateCanvas,
        viewPort : viewPort,
        clear: clear,
        saveContext: saveContext,
        restoreContext: restoreContext,
        rotateCanvas: rotateCanvas,
        drawMapPortion: drawMapPortion,
        drawImage: drawImage,
        drawImageSpriteSheet: drawImageSpriteSheet,
        drawCircle: drawCircle,
        Circle: Circle,
        Rectangle: Rectangle,
        Texture: Texture,
        Background: Background,
        Letters: Letters,
    };
}());
