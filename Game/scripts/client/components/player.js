
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

    let userName = '';

    let direction = 0;
    let rotateRate = 0;
    let speed = 0;
    let moveRate = 200;
    let height = 600;
    let width = 600;



    let score = 0;
    let life_remaining = 0;
    let is_alive = true;
    let isSprinting = false;
    let sprintEnergy = 100;
    let SPRINT_FACTOR = 2; // how fast to sprint vs regular speed
    let SPRINT_DECREASE_RATE = .1 // this is per millisecond
    let SPRINT_RECOVERY_RATE = .05 // this is per millisecond

    let killer = '';
    let kills = 0;



    Object.defineProperty(that, 'kills', {
        get: () => kills,
        set: value => kills = value
    })

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


    Object.defineProperty(that, 'score', {
        get: () => score,
        set: (value) => { score = value }
    });


    Object.defineProperty(that, 'life_remaining', {
        get: () => life_remaining,
        set: (value) => { life_remaining = value }
    });


    Object.defineProperty(that, 'is_alive', {
        get: () => is_alive,
        set: (value) => { is_alive = value }
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

    //------------------------------------------------------------------
    //
    // Public function that moves the player's current direction.
    //
    //------------------------------------------------------------------
    that.changeDirection = function(x, y, viewPort) {
        // direction = Math.atan2(y - (position.y * viewPort.height), x - (position.x * viewPort.width));
        this.direction = Math.atan2(y - this.worldCordinates.y, x - this.worldCordinates.x);
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
    that.worldCordinatesFromMouse = function(mouseX, mouseY, viewPort) {
        let cords = {x: 0, y: 0};
        let positionWC = {
            x: this.position.x * viewPort.width, 
            y: this.position.y * viewPort.height
        };
        let diffX = Math.abs(mouseX - positionWC.x);
        let diffY = Math.abs(mouseY - positionWC.y);
        if (mouseX < positionWC.x){
            cords.x = this.worldCordinates.x - diffX;
        }
        else {
            cords.x = this.worldCordinates.x + diffX;
        }
        if (mouseY < positionWC.y){
            cords.y = this.worldCordinates.y - diffY;
        }
        else {
            cords.y = this.worldCordinates.y + diffY;
        }

        return cords;
    }

    return that;
};
