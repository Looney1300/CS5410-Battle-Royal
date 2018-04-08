
//------------------------------------- -----------------------------
//
// Model for each player in the game.
//
//------------------------------------------------------------------
MyGame.components.Player = function(mapLogic) {
    'use strict';
    let that = {};
    let map = mapLogic;
    let position = {
        x: 0,
        y: 0
    };
    let worldCordinates = {
        x: 0,
        y: 0
    };
    let size = {
        width: 0.05,
        height: 0.05
    };
    let direction = 0;
    let rotateRate = 0;
    let speed = 0;
    let moveRate = 200;
    let height = 600;
    let width = 600;

    Object.defineProperty(that, 'direction', {
        get: () => direction,
        set: (value) => { direction = value }
    });

    Object.defineProperty(that, 'speed', {
        get: () => speed,
        set: value => { speed = value; }
    });

    Object.defineProperty(that, 'rotateRate', {
        get: () => rotateRate,
        set: value => { rotateRate = value; }
    });

    Object.defineProperty(that, 'position', {
        get: () => position
    });

    Object.defineProperty(that, 'worldCordinates', {
        get: () => worldCordinates,
        set: cords => {
            worldCordinates.x = cords.x;
            worldCordinates.y = cords.y;
        }
    });

    Object.defineProperty(that, 'size', {
        get: () => size
    });

    //------------------------------------------------------------------
    //
    // Public function that moves the player's current direction.
    //
    //------------------------------------------------------------------
    that.changeDirection = function(x, y, viewPort) {
        // direction = Math.atan2(y - (position.y * viewPort.height), x - (position.x * viewPort.width));
        direction = Math.atan2(y - worldCordinates.y, x - worldCordinates.x);
    };

    that.moveUp = function(elapsedTime) {
        let move = speed * elapsedTime;
        if (map.isValid(worldCordinates.y - move, worldCordinates.x)){
            worldCordinates.y -= move;
        }
    };

    that.moveDown = function(elapsedTime) {
        let move = speed * elapsedTime;
        if (map.isValid(worldCordinates.y + move, worldCordinates.x)){
            worldCordinates.y += move;
        }
    };

    that.moveLeft = function(elapsedTime) {
        let move = speed * elapsedTime;
        if (map.isValid(worldCordinates.y, worldCordinates.x - move)){
            worldCordinates.x -= move;
        }
    };

    that.moveRight = function(elapsedTime) {
        let move = speed * elapsedTime;
        if (map.isValid(worldCordinates.y, worldCordinates.x + move)){
            worldCordinates.x += move;
        }
    };

    //------------------------------------------------------------------
    //
    // Public function that rotates the player right.
    //
    //------------------------------------------------------------------
    that.rotateRight = function(elapsedTime) {
        direction += (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Public function that rotates the player left.
    //
    //------------------------------------------------------------------
    that.rotateLeft = function(elapsedTime) {
        direction -= (rotateRate * elapsedTime);
    };

    that.update = function(elapsedTime, viewPort) {
        let diffX = (Math.abs(viewPort.center.x - worldCordinates.x))/viewPort.width;
        let diffY = (Math.abs(viewPort.center.y - worldCordinates.y))/viewPort.height;
        if (worldCordinates.x < viewPort.center.x){
            position.x = 0.5 - diffX;
        }
        else {
            position.x = 0.5 + diffX;
        }
        if (worldCordinates.y < viewPort.center.y) {
            position.y = 0.5 - diffY;
        }
        else {
            position.y = 0.5 + diffY;
        }
    };

    //------------------------------------------------------------------
    //
    // Public function that gets the mouse position and converts it to world cordinates.
    //
    //------------------------------------------------------------------
    that.worldCordinatesFromMouse = function(mouseX, mouseY, viewPort) {
        let cords = {x: 0, y: 0};
        let positionWC = {
            x: position.x * viewPort.width, 
            y: position.y * viewPort.height
        };
        let diffX = Math.abs(mouseX - positionWC.x);
        let diffY = Math.abs(mouseY - positionWC.y);
        if (mouseX < positionWC.x){
            cords.x = worldCordinates.x - diffX;
        }
        else {
            cords.x = worldCordinates.x + diffX;
        }
        if (mouseY < positionWC.y){
            cords.y = worldCordinates.y - diffY;
        }
        else {
            cords.y = worldCordinates.y + diffY;
        }

        return cords;
    }

    return that;
};
