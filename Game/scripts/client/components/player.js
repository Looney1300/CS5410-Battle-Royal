
// let mapFile = require('../../shared/map');
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
    // Public function that moves the player in the current direction.
    //
    //------------------------------------------------------------------
    that.move = function(elapsedTime) {
        let vectorX = Math.cos(direction);
        let vectorY = Math.sin(direction);

        // position.x += (vectorX * elapsedTime * speed);
        // position.y += (vectorY * elapsedTime * speed);
        // worldCordinates.x += (vectorX * elapsedTime * 2);
        // worldCordinates.y += (vectorY * elapsedTime * 2);
    };

    that.moveUp = function(elapsedTime) {
        let move = (moveRate / 1000) * elapsedTime;
        if (map.isValid(worldCordinates.y - move, worldCordinates.x)){
            worldCordinates.y -= move;
        }
    };

    that.moveDown = function(elapsedTime) {
        let move = (moveRate / 1000) * elapsedTime;
        if (map.isValid(worldCordinates.y + move, worldCordinates.x)){
            worldCordinates.y += move;
        }
    };

    that.moveLeft = function(elapsedTime) {
        let move = (moveRate / 1000) * elapsedTime;
        if (map.isValid(worldCordinates.y, worldCordinates.x - move)){
            worldCordinates.x -= move;
        }
    };

    that.moveRight = function(elapsedTime) {
        let move = (moveRate / 1000) * elapsedTime;
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

    that.update = function(elapsedTime) {
    };

    return that;
};
