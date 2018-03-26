/*
MyGame.graphics is an immediately invoked function with the following sub-functions
  clear()
  Texture(spec)
*/
MyGame.graphics = (function(){
    'use strict';

    let canvas = document.getElementById('canvas-main');
    let context = canvas.getContext('2d');
    let brickUnit = 0;

    function clear(){
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.restore();
    }

    /*Rectangle expects a spec with
        rotation
        x
        y
        width
        height
        fillStyle
        strokeStyle
        lineWidth (optional)
    */
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

    /*
    Background makes a texture that has width and height of the canvas.
      src
    */
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

    /*
    Lines function is passed a lineList object that has: 
      maxX 
      maxY
      lineList list of {x,y} pairs
     Each pair represents the start and end of a line.
     max x,y are used for calculating the scale on the canvas. 
     It assumes the associated coordinate system is meant to 
     scale the entire canvas, centered on the canvas.
    */
    function Lines(lines){
        let w;
        lines.maxX > lines.maxY ? w = lines.maxX : w = lines.maxY;
        context.beginPath();
        for(let i=0; i < lines.lineList.length; i+=2){
            context.moveTo(lines.lineList[i].x*(canvas.width/w), lines.lineList[i].y*(canvas.height/w));
            context.lineTo(lines.lineList[i+1].x*(canvas.width/w), lines.lineList[i+1].y*(canvas.height/w));
        }
        context.stroke();
        context.closePath();
    }

    /*
    Rectangles is a shorthand way to generate a list of Rectangle's, and a draw function that draws all the given rectangles.
    */
    function Rectangles(rectangles){
        let that = {};
        let rects = [];
        for (let i=0; i < rectangles.length; ++i){
            rects.push(Rectangle(rectangles[i]));
        }
        that.draw = function(){
            for (let i=0; i < rectangles.length; ++i){
                rects[i].draw();
            }
        };
        return that;
    }

    /*
    Circle takes a spec and draws a circle from it
     centerX
     centerY
     radius
    */
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

    //TODO: make a curvy line drawer.
    function Curves(curveList){ }

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

    /*
    Particles draws a list of particles.
    */
    function Particle(particle){
        let particleGraphic;
        if (particle.hasOwnProperty('imageSrc')){
            particle.center = particle.position;
            particle.width = particle.size;
            particle.height = particle.size;
            particleGraphic = graphics.Texture(particle);
        }
        else if (particle.hasOwnProperty('fill') || particle.hasOwnProperty('stroke')){
            particle.x = particle.position.x;
            particle.y = particle.position.y;
            particle.fillStyle = particle.fill;
            particle.strokeStyle = particle.stroke;
            particle.width = particle.size;
            particle.height = particle.size;
            particleGraphic = graphics.Rectangle(particle);
        }
        //Returns either a rectangle or a texture.
        return particleGraphic;
    }

    /*
    Menu creates a menu from a menu object with...
     background
     button.fill
     button.stroke
     button.width (optional)
     button.height (optional)
     menu.text.color
         .text.size
         .text.font
         .text.fillStyle
         .text.strokeStyle
     menu.buttons - this is a list of text to go on each button
     gap (optional)
    */
    function Menu(menu){
        let that = {};
        let b = Background(menu.background);

        let buttonsXY = [];
        let bgList = [];
        let textgList = [];
        let numOfButtons = menu.buttons.length;

        if (!menu.hasOwnProperty('gap')){
            menu.gap = canvas.height/(4*numOfButtons);
        }
        if (!menu.button.hasOwnProperty('width')){
            menu.button.width = 0.6 * canvas.width;
        }
        if (!menu.button.hasOwnProperty('height')){
            menu.button.height = canvas.height/(2*numOfButtons-1);
        }

        menu.button.y = (canvas.height - ((numOfButtons-1)*menu.gap + numOfButtons*menu.button.height))/2;
        menu.button.x = (canvas.width/2 - (menu.button.width/2));

        for (let i=0; i < menu.buttons.length; ++i){
            bgList.push(Rectangle({
                x: menu.button.x,
                y: menu.button.y,
                rotation: 0,
                width: menu.button.width,
                height: menu.button.height,
                fillStyle: menu.button.fill,
                strokeStyle: menu.button.stroke
            }));
            buttonsXY.push({x: menu.button.x, y: menu.button.y});

            let newSpec = {
                text: menu.buttons[i],
                font: '' + menu.text.size + ' ' + menu.text.font,
                x: canvas.width/2,
                y: menu.button.y + menu.button.height/2,
                lineWidth: menu.text.lineWidth,
                fillStyle: menu.text.fillStyle,
                strokeStyle: menu.text.strokeStyle,
                align: 'center',
                baseline: 'middle'
            }

            textgList.push(Letters(newSpec));
            menu.button.y += menu.gap + menu.button.height;
        }

        that.draw = function(){
            b.draw();
            for (let i=0; i<bgList.length; ++i){
                bgList[i].draw();
                textgList[i].draw();
            }
        };

        //This returns nothing if not on a button, and returns 1,2, or 3 depending on which button on.
        that.isCoordinateOnButton = function(screenCoordinate){
            screenCoordinate.x -= canvas.offsetLeft;
            screenCoordinate.y -= canvas.offsetTop;
            let canvasCoordinate = {
                x: screenCoordinate.x * canvas.width/canvas.scrollWidth, 
                y: screenCoordinate.y * canvas.height/canvas.scrollHeight
            };
            if (canvasCoordinate.x > buttonsXY[0].x && canvasCoordinate.x < buttonsXY[0].x + menu.button.width ){
                for (let i=0; i < buttonsXY.length; ++i){
                    if (canvasCoordinate.y > buttonsXY[i].y && canvasCoordinate.y < buttonsXY[i].y + menu.button.height){
                        return i + 1;
                    }
                }
            }
        }

        return that;
    }
    
    return {
        clear: clear,
        Rectangle: Rectangle,
        Texture: Texture,
        Lines: Lines,
        Circle: Circle,
        Letters: Letters,
        Particle: Particle,
        Menu: Menu,
        Background: Background,
    };

}());