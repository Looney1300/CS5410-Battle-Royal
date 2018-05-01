
//------------------------------------- -----------------------------
//
// Model for each player in the game.
//
//------------------------------------------------------------------
MyGame.components.Player = function(mapLogic) {
    'use strict';
    let that = {};
    let map = mapLogic;
    let canvas = document.getElementById('canvas-main');
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

    let userName = '';

    let direction = 0;
    let rotateRate = 0;
    let speed = 0;
    let moveRate = 200;
    let height = 600;
    let width = 600;


    let hasBullets = false;
    let life_remaining = 0;
    let is_alive = true;
    let isSprinting = false;
    let hasWeapon = false;
    let hasRapidFire = false;
    let sprintEnergy = 100;
    let SPRINT_FACTOR = 2; // how fast to sprint vs regular speed
    let SPRINT_DECREASE_RATE = .1 // this is per millisecond
    let SPRINT_RECOVERY_RATE = .05 // this is per millisecond

    let killer = '';

    Object.defineProperty(that, 'killer', {
        get: () => killer,
        set: value => killer = value
    })


    Object.defineProperty(that, 'SPRINT_DECREASE_RATE', {
        get: () => SPRINT_DECREASE_RATE,
        set: value => SPRINT_DECREASE_RATE = value
    })

    Object.defineProperty(that, 'SPRINT_RECOVERY_RATE', {
        get: () => SPRINT_RECOVERY_RATE,
        set: value => SPRINT_RECOVERY_RATE = value
    })

    Object.defineProperty(that, 'isSprinting', {
        get: () => isSprinting,
        set: value => isSprinting = value
    })

    Object.defineProperty(that, 'sprintEnergy', {
        get: () => sprintEnergy,
        set: value => sprintEnergy = value
    })


    Object.defineProperty(that, 'life_remaining', {
        get: () => life_remaining,
        set: (value) => { life_remaining = value }
    });


    Object.defineProperty(that, 'is_alive', {
        get: () => is_alive,
        set: (value) => { is_alive = value }
    });

    Object.defineProperty(that, 'hasWeapon', {
        get: () => hasWeapon,
        set: (value) => { hasWeapon = value }
    });


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
        get: () => position,
        set: cords => {
            position.x = cords.x;
            position.y = cords.y;
        }
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

    Object.defineProperty(that, 'hasBullets', {
        get: () => hasBullets,
        set: value => hasBullets = value
    });

    Object.defineProperty(that, 'hasRapidFire', {
        get: () => hasRapidFire,
        set: value => hasRapidFire = value
    });

    //------------------------------------------------------------------
    //
    // Public function that moves the player's current direction.
    //
    //------------------------------------------------------------------
    that.changeDirection = function(x, y, viewPort) {
        // direction = Math.atan2(y - (position.y * viewPort.height), x - (position.x * viewPort.width));
        direction = Math.atan2(y - this.worldCordinates.y, x - this.worldCordinates.x);
    };

    that.moveUp = function(elapsedTime) {
        let tempSpeed = speed;
        if (isSprinting && sprintEnergy > 0){
            tempSpeed *= SPRINT_FACTOR;
            sprintEnergy -= SPRINT_DECREASE_RATE * elapsedTime;
        }
        let move = tempSpeed * elapsedTime;
        if (map.isValid(this.worldCordinates.y - move, this.worldCordinates.x)){
            this.worldCordinates.y -= move;
        }
    };

    that.moveDown = function(elapsedTime) {
        let tempSpeed = speed;
        if (isSprinting && sprintEnergy > 0){
            tempSpeed *= SPRINT_FACTOR;
            sprintEnergy -= SPRINT_DECREASE_RATE * elapsedTime;
        }
        let move = tempSpeed * elapsedTime;
        if (map.isValid(this.worldCordinates.y + move, this.worldCordinates.x)){
            this.worldCordinates.y += move;
        }
    };

    that.moveLeft = function(elapsedTime) {
        let tempSpeed = speed;
        if (isSprinting && sprintEnergy > 0){
            tempSpeed *= SPRINT_FACTOR;
            sprintEnergy -= SPRINT_DECREASE_RATE * elapsedTime;
        }
        let move = tempSpeed * elapsedTime;
        if (map.isValid(this.worldCordinates.y, this.worldCordinates.x - move)){
            this.worldCordinates.x -= move;
        }
    };

    that.moveRight = function(elapsedTime) {
        let tempSpeed = speed;
        if (isSprinting && sprintEnergy > 0){
            tempSpeed *= SPRINT_FACTOR;
            sprintEnergy -= SPRINT_DECREASE_RATE * elapsedTime;
        }
        let move = tempSpeed * elapsedTime;
        if (map.isValid(this.worldCordinates.y, this.worldCordinates.x + move)){
            this.worldCordinates.x += move;
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
        if (sprintEnergy < 100 && !isSprinting){
            sprintEnergy += SPRINT_RECOVERY_RATE * elapsedTime;
        }
        isSprinting = false;
        let diffX = (viewPort.center.x - this.worldCordinates.x)/viewPort.width;
        let diffY = (viewPort.center.y - this.worldCordinates.y)/viewPort.height;
        this.position.x = 0.5 - diffX;
        this.position.y = 0.5 - diffY;
    };

    //------------------------------------------------------------------
    //
    // Public function that gets the mouse position and converts it to world cordinates.
    //
    //------------------------------------------------------------------
    that.worldCordinatesFromMouse = function(e, viewPort) {
        //TODO: figure this out.
        let x,
            y;
        //The following if/else statement from 
        // https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
        if (e.x || e.y) { 
            x = e.x;
            y = e.y;
        } else { 
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
        } 
        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;
        let cords = {x: 0, y: 0};
        console.log(x, y);
        let diffX = x - this.position.x * canvas.clientWidth;
        let diffY = y - this.position.y * canvas.clientHeight;
        cords.x = this.worldCordinates.x + diffX;
        cords.y = this.worldCordinates.y + diffY;
        console.log(cords)

        return cords;
    };

    return that;
};
