// ------------------------------------------------------------------
//
// Nodejs module that represents the model for a player.
//
// ------------------------------------------------------------------
'use strict';

let random = require ('../utilities/random');

//------------------------------------------------------------------
//
// Public function used to initially create a newly connected player
// at some random location.
//
//------------------------------------------------------------------
function createPlayer(mapLogic) {
    let that = {};
    let map = mapLogic;
    
    let position = {
        x: 0.5,
        y: 0.5
    };

    let worldCordinates = random.getRandomMapCords(map, map.mapHeight, map.mapWidth);


    let score = 0;
    let is_alive = true;
    let life_remaining = 100;


    let size = {
        width: 0.01,
        height: 0.01,
        radius: 0.02
    };
    let collision_radius = 15;
    let direction = random.nextDouble() * 2 * Math.PI;    // Angle in radians
    let rotateRate = Math.PI / 1000;    // radians per millisecond
    let speed = 0.2;                  // unit distance per millisecond
    let reportUpdate = false;    // Indicates if this model was updated during the last update
    let moveRate = 200;

    Object.defineProperty(that, 'score', {
        get: () => score
    });

    Object.defineProperty(that, 'is_alive', {
        get: () => is_alive
    });

    Object.defineProperty(that, 'life_remaining', {
        get: () => life_remaining
    });

    Object.defineProperty(that, 'direction', {
        get: () => direction
    });

    Object.defineProperty(that, 'position', {
        get: () => position
    });

    Object.defineProperty(that, 'size', {
        get: () => size
    });

    Object.defineProperty(that, 'speed', {
        get: () => speed
    })

    Object.defineProperty(that, 'rotateRate', {
        get: () => rotateRate
    });

    Object.defineProperty(that, 'reportUpdate', {
        get: () => reportUpdate,
        set: value => reportUpdate = value
    });

    Object.defineProperty(that, 'radius', {
        get: () => size.radius
    });

    Object.defineProperty(that, 'collision_radius', {
        get: () => collision_radius
    });

    Object.defineProperty(that, 'worldCordinates', {
        get: () => worldCordinates
    });

    //------------------------------------------------------------------
    //
    // Moves the player forward based on how long it has been since the
    // last move took place.
    //
    //------------------------------------------------------------------
    that.move = function(elapsedTime) {
        reportUpdate = true;
        let vectorX = Math.cos(direction);
        let vectorY = Math.sin(direction);

    };

    that.changeDirection = function(x, y, viewPort) {
        reportUpdate = true;
        direction = Math.atan2(y - this.worldCordinates.y, x - this.worldCordinates.x);
    };

    that.moveUp = function(elapsedTime) {
        reportUpdate = true;
        let move = speed * elapsedTime;
        if (map.isValid(this.worldCordinates.y - move, this.worldCordinates.x)){
            this.worldCordinates.y -= move;
        }
    };

    that.moveDown = function(elapsedTime) {
        reportUpdate = true;
        let move = speed * elapsedTime;
        if (map.isValid(this.worldCordinates.y + move, this.worldCordinates.x)){
            this.worldCordinates.y += move;
        }
    };

    that.moveLeft = function(elapsedTime) {
        reportUpdate = true;
        let move = speed * elapsedTime;
        if (map.isValid(this.worldCordinates.y, this.worldCordinates.x - move)){
            this.worldCordinates.x -= move;
        }
    };

    that.moveRight = function(elapsedTime) {
        reportUpdate = true;
        let move = speed * elapsedTime;
        if (map.isValid(this.worldCordinates.y, this.worldCordinates.x + move)){
            this.worldCordinates.x += move;
        }
    };

    that.scoredAHit = function(){
        reportUpdate = true;
        score += 1;

    };

    that.wasHit = function(){
        reportUpdate = true;
        life_remaining -= 10;
        if(life_remaining <= 0){
            is_alive = false;
        }
        if(!is_alive){
            console.log('I am dead!');
        }

    };
    

    //------------------------------------------------------------------
    //
    // Rotates the player right based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    that.rotateRight = function(elapsedTime) {
        reportUpdate = true;
        direction += (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Rotates the player left based on how long it has been since the
    // last rotate took place.
    //
    //------------------------------------------------------------------
    that.rotateLeft = function(elapsedTime) {
        reportUpdate = true;
        direction -= (rotateRate * elapsedTime);
    };

    //------------------------------------------------------------------
    //
    // Function used to update the player during the game loop.
    //
    //------------------------------------------------------------------
    that.update = function(when) {
    };

    return that;
}

module.exports.create = mapLogic => createPlayer(mapLogic);
