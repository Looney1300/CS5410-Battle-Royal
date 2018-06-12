(function (exports) {
    'use strict';

    let randomFile = require ('../utilities/random');
    
    exports.create = function(map, startDiameterAsPercentOfMapWidth, minutesBetweenShieldMoves, shrinkDownTo, shieldMovesTotal){
        let that = {};
        let random = randomFile.create();
        let firstRadius = map.mapWidth * startDiameterAsPercentOfMapWidth/2;
        let currentRadius = firstRadius;

        let position = {x: map.mapWidth/2, y: map.mapHeight/2};
        let waitTime = 1000 * 60 * minutesBetweenShieldMoves;
        let timeTilNextShield = waitTime;
        let nextPosition = {x: map.mapWidth/2, y: map.mapHeight/2};
        let shieldMovesDone = 0;

        //Find the decrement factor by subtracting the percent from the other percent divided by the total number of shields.
        // adjustment added to make it non-negative after all updates.
        let percentLessEachShrink = (startDiameterAsPercentOfMapWidth - shrinkDownTo)/(shieldMovesTotal);
        //Find how much exactly to subtract from each new shield.
        let differenceInRadii = percentLessEachShrink * map.mapWidth/2;
        //Set the next radius by subtracting that difference from the first radius.
        let nextRadius = firstRadius - differenceInRadii;
        //ShrinkRate is equal to the distance to travel divided by the time to travel
        let shrinkRate = differenceInRadii/(waitTime/2);

        let gameStarted = false;
        let diffX = nextPosition.x - position.x;
        let diffY = nextPosition.y - position.y;

        Object.defineProperty(that, 'position', {
            get: () => position
        });

        Object.defineProperty(that, 'center', {
            get: () => position
        });

        Object.defineProperty(that, 'worldCordinates', {
            get: () => position
        });

        Object.defineProperty(that, 'nextWorldCordinates', {
            get: () => nextPosition
        });

        Object.defineProperty(that, 'radius', {
            get: () => currentRadius
        });

        Object.defineProperty(that, 'collision_radius', {
            get: () => currentRadius
        });

        Object.defineProperty(that, 'timeTilNextShield', {
            get: () => timeTilNextShield
        });

        Object.defineProperty(that, 'nextRadius', {
            get: () => nextRadius
        });

        Object.defineProperty(that, 'gameStarted', {
            set: (value) => gameStarted = value
        });

        that.update = function(elapsedTime){
            if (!gameStarted){
                return false;
            }
            if (shieldMovesDone >= shieldMovesTotal){
                return false;
            }
            timeTilNextShield -= elapsedTime;
            if(timeTilNextShield < 0){
                shieldMovesDone += 1;
                timeTilNextShield += waitTime;

                currentRadius = nextRadius;
                nextRadius -= differenceInRadii;

                position.x = nextPosition.x;
                position.y = nextPosition.y;
                let valid = false;
                while (!valid){
                    nextPosition.x = random.nextRange(position.x - currentRadius + nextRadius, position.x + currentRadius - nextRadius);
                    nextPosition.y = random.nextRange(position.y - currentRadius + nextRadius, position.y + currentRadius - nextRadius);
                    valid = map.isValid(nextPosition.y, nextPosition.x);
                }
                diffX = nextPosition.x - position.x;
                diffY = nextPosition.y - position.y;
                return true;
            }
            if (timeTilNextShield < waitTime/2){
                position.x += elapsedTime * diffX/(waitTime/2);
                position.y += elapsedTime * diffY/(waitTime/2);
                currentRadius -= elapsedTime * shrinkRate;
            }
            return false;
        }

        return that;
    };
})(typeof exports === 'undefined' ? this['Shield'] = {} : exports);