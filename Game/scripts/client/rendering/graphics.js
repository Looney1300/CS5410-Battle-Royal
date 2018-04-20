// ------------------------------------------------------------------
//
// This is the graphics rendering code for the game.
//
// ------------------------------------------------------------------
MyGame.graphics = (function() {
    'use strict';

    let canvas = document.getElementById('canvas-main');
    let context = canvas.getContext('2d');
    let fovClipping = false;
    let miniMapClipping = false;
    
    let map = Map.create();
    // let smallMap = SmallMap.create();
    let medium = MediumMap.create();
    map.setMap(medium.data);
    let image = new Image();
    image.src = map.mapFile.tilesets[1].image;
    let viewPort = MyGame.components.ViewPortal();
    viewPort.mapWidth = map.mapWidth;
    viewPort.mapHeight = map.mapHeight;
    
    let shieldClipping = false;

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
        canvas.width = 600;
        canvas.height = 600;
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
    // Draw the field of view for the playerSelf
    //
    //------------------------------------------------------------------
    function drawFOV(fov) {
        context.beginPath();
        context.moveTo(fov.center.x * viewPort.width, fov.center.y * viewPort.height);
        context.lineTo(fov.firstPoint.x * viewPort.width, fov.firstPoint.y * viewPort.height);
        context.lineTo(fov.secondPoint.x * viewPort.width, fov.secondPoint.y * viewPort.height);
        context.closePath();
        context.lineWidth = 2;
        context.strokeStyle = '#666666';
        context.stroke();
        if(!fovClipping){
            context.clip();
            fovClipping = true;
        }
    }

    function disableFOVClipping() {
        if (fovClipping){
            context.restore();
            fovClipping = false;
        }
    }

    //------------------------------------------------------------------
    //
    // Draw an image into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawImage(texture, center, size) {
        // center is model.position
        // size is model.size
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

    function drawHealth(center, size, life_remaining){
        let localCenter = {
            x: center.x * viewPort.width,
            y: center.y * viewPort.height
        };
        let localSize = {
            width: size.width * viewPort.width,
            height: size.height * viewPort.height
        };


        if(life_remaining > 0){
            context.fillStyle="#FF0000";
            context.fillRect((localCenter.x - (localSize.width / 2)),
                (localCenter.y - localSize.height / 2) - (localSize.height/2),
                localSize.width,
                localSize.height/5);
    
            let life_bar_total = (localSize.width);
            let life_bar_actual = life_bar_total*life_remaining/100;
            context.fillStyle='#00FF00';
            context.fillRect((localCenter.x - (localSize.width / 2)),
            (localCenter.y - localSize.height / 2) - (localSize.height/2),
            life_bar_actual,
            localSize.height/5);
        }
        else{
            context.fillStyle="#000000";
            context.fillRect((localCenter.x - (localSize.width / 2)),
                (localCenter.y - localSize.height / 2) - (localSize.height/2),
                localSize.width,
                localSize.height/5);
        }
    };

    function drawGameStatus(printArr){
        context.font = "bold 40px Arial";
        context.fillStyle = 'red';
        context.fillText(printArr.killer,0,canvas.height/20);
        context.fillText('was killed by',0,canvas.height/10);
        context.fillText(printArr.killed,0,canvas.height/6.5);
    };

    //------------------------------------------------------------------
    //
    // Draw a portion of an image on the canvasd
    //
    //------------------------------------------------------------------
    function drawCroppedImage(texture, cord, size, clipping){
        context.drawImage(texture, clipping.x, clipping.y, clipping.size.width, clipping.size.height,
            cord.x * viewPort.width, cord.y * viewPort.height, 
            size.width * viewPort.width, size.height * viewPort.height);
    }

    //------------------------------------------------------------------
    //
    // Draw a time at a specific place on the canvas
    //
    //------------------------------------------------------------------
    function drawTime(time, cord) {
        context.font = "12px Arial";
        context.fillStyle = "#ffffff";
        context.fillText(time, cord.x * viewPort.width, cord.y * viewPort.height);
    }

    //------------------------------------------------------------------
    //
    // Draw an image out of a spritesheet into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawImageSpriteSheet(spriteSheet, spriteSize, sprite, printCenter, size) {
        // center is still the world coords.
        // center needs to be where the player can see.
        let localCenter = {
            x: printCenter.x * viewPort.width,
            y: printCenter.y * viewPort.width
        };
        let localSize = {
            width: size.width * viewPort.width,
            height: size.height * viewPort.height
        };
        context.drawImage(spriteSheet,
            sprite * spriteSize.width, 0,                 // which sprite to render
            spriteSize.width, spriteSize.height,    // size in the spritesheet
            localCenter.x,
            localCenter.y,
            localSize.width, localSize.height);
    }

    //------------------------------------------------------------------
    //
    // Draw a circle into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawCircle(center, radius, color) {
        //console.log(center);
        context.beginPath();
        context.arc(center.x * canvas.width, center.y * canvas.width, 2 * radius * canvas.width, 2 * Math.PI, false);
        context.closePath();
        context.fillStyle = color;
        context.fill();
    }

    function drawRectangle(center, size) {
        let localCenter = {
            x: center.x * viewPort.width,
            y: center.y * viewPort.height
        };
        let localSize = {
            width: size.width * viewPort.width,
            height: size.height * viewPort.height
        };
        context.beginPath();
        context.rect(localCenter.x - localSize.width / 2,
            localCenter.y - localSize.height / 2,
            localSize.width,
            localSize.height);
        context.closePath();
    }

    function drawMiniMapCircle(shield, shouldStroke) {
        context.beginPath();
        if (shield.radius < 0){
            shield.radius = 0.000001;
        }
        context.arc(shield.center.x * viewPort.width, shield.center.y * viewPort.height, shield.radius, 0, 2*Math.PI);
        context.closePath();
        if (shouldStroke){
            context.strokeStyle = "#ffffff";
            context.stroke();
        }
    }

    function enableMiniMapClipping() {
        if (!miniMapClipping) {
            miniMapClipping = true;
            context.clip();
        }
    }

    function disableMiniMapClipping() {
        if (miniMapClipping){
            miniMapClipping = false;
            context.restore();
        }
    }
    // Circle, Rectangle, and Texture, are made for use by particleSystem.
    //------------------------------------------------------------------
    //
    // Draw the shield into the local canvas coordinate system.
    //
    //------------------------------------------------------------------
    function drawShield(center, radius, color) {

        context.save();
        context.beginPath();
        context.arc(center.x * canvas.width, center.y * canvas.width, 30000 * canvas.width, 0, 2 * Math.PI, false);
        context.arc(center.x * canvas.width, center.y * canvas.width, 2 * radius * canvas.width, 0, 2 * Math.PI, true);
        context.closePath();
        context.fillStyle = color;
        context.fill()

    }

    //------------------------------------------------------------------
    /*
    Circle expects a spec with
        x
        y
        width
        fillStyle
        strokeStyle
        lineWidth
    */
    //------------------------------------------------------------------
    function Circle(spec){
        let that = {};
        let hasFillStyle = spec.hasOwnProperty('fillStyle');
        let hasLineWidth = spec.hasOwnProperty('lineWidth');
        let hasStrokeStyle = spec.hasOwnProperty('strokeStyle');

        that.draw = function(viewPort){
            let posX = canvas.width/2 - (viewPort.center.x - spec.x);
            let posY = canvas.height/2 - (viewPort.center.y - spec.y);
            context.beginPath();
            context.arc(posX, posY, spec.width/2 * canvas.width, 2 * Math.PI, false);
            context.closePath();
            if (hasLineWidth){
                context.lineWidth = spec.lineWidth;
            }
            if (hasStrokeStyle){
                context.strokeStyle = spec.strokeStyle;
                context.stroke();
            }
            if (hasFillStyle){
                context.fillStyle = spec.fillStyle;
                context.fill();
            }
            context.restore();
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

        that.draw = function(viewPort){
            let posX = canvas.width/2 - (viewPort.center.x - spec.x);
            let posY = canvas.height/2 - (viewPort.center.y - spec.y);
            //Rotating a shape
            //1. Translate (0,0) of canvas to center of shape
            context.save();
            context.translate(posX + spec.width*canvas.width/2, posY + spec.height*canvas.height/2);
            //2. Rotate canvas
            context.rotate(spec.rotation);
            context.translate(-(posX + spec.width*canvas.width/2), -(posY + spec.height*canvas.height/2));
            //3. Draw shape at original coordinates
            if (hasFillStyle){
                context.fillStyle = spec.fillStyle;
                context.fillRect(posX, posY, spec.width * canvas.width, spec.height * canvas.height);
            }
            if (hasLineWidth){
                context.lineWidth = spec.lineWidth;
            }
            if (hasStrokeStyle){
                context.strokeStyle = spec.strokeStyle;
                context.strokeRect(posX, posY, spec.width * canvas.width, spec.height * canvas.height);
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
      spec.x
      spec.y
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
        
        that.draw = function(viewPort){
            let posX = canvas.width/2 - (viewPort.center.x - spec.x) - spec.width*canvas.width/2;
            let posY = canvas.height/2 - (viewPort.center.y - spec.y) - spec.height*canvas.height/2;
            if (ready){
                context.save();
                context.translate(posX + spec.width*canvas.width/2, posY + spec.height*canvas.height/2);
                context.rotate(spec.rotation);
                context.translate(-(posX + spec.width*canvas.width/2), -(posY + spec.height*canvas.height/2));

                //For fading textures
                context.globalAlpha = spec.o;

                context.drawImage(
                    image,
                    (posX),
                    (posY),
                    spec.width * canvas.width, 
                    spec.height * canvas.height);

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
                context.fillText(spec.text, spec.x * canvas.width, spec.y * canvas.height);
            }
            if (spec.hasOwnProperty('strokeStyle')){
                context.strokeStyle = spec.strokeStyle;
                context.strokeText(spec.text, spec.x * canvas.width, spec.y * canvas.height);
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
        drawGameStatus: drawGameStatus,
        drawMapPortion: drawMapPortion,
        drawRectangle: drawRectangle,
        drawMiniMapCircle : drawMiniMapCircle,
        enableMiniMapClipping: enableMiniMapClipping,
        disableMiniMapClipping : disableMiniMapClipping,
        drawFOV : drawFOV,
        disableFOVClipping : disableFOVClipping,
        drawImage: drawImage,
        drawCroppedImage: drawCroppedImage,
        drawTime: drawTime,
        drawHealth: drawHealth,
        drawImageSpriteSheet: drawImageSpriteSheet,
        drawCircle: drawCircle,
        drawShield: drawShield,
        Circle: Circle,
        Rectangle: Rectangle,
        Texture: Texture,
        Background: Background,
        Letters: Letters,
    };
}());
