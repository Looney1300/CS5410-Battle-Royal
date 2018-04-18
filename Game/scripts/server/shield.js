(function (exports) {
    'use strict';

    let random = require ('../utilities/random');
    
    exports.create = function(map, startDiameterAsPercentOfMapWidth, minutesBetweenShieldMoves, shrinkDownTo, shieldMovesTotal){
        let that = {};
        let firstRadius = map.mapWidth * startDiameterAsPercentOfMapWidth/2;
        let currentRadius = firstRadius;
        let position = {x: map.mapWidth/2, y: map.mapWidth/2};
        let waitTime = 1000 * 60 * minutesBetweenShieldMoves;
        let timeTilNextShield = waitTime;
        let nextPosition = {};
        let shieldMovesDone = 0;
        let percentLessEachShrink = (startDiameterAsPercentOfMapWidth - shrinkDownTo)/(shieldMovesTotal);
        let differenceInRadii = percentLessEachShrink * map.mapWidth/2;
        let nextRadius = firstRadius - differenceInRadii;
        let shrinkRate = differenceInRadii/(waitTime/2);
        let gameStarted = false;
        let diffX = 0;
        let diffY = 0;
        console.log(firstRadius, waitTime, percentLessEachShrink, differenceInRadii, shrinkRate);

        //Prep the next position with a valid randomly selected position
        let valid = false;
        while (!valid){
            nextPosition.x = random.nextRange(position.x - firstRadius, position.x + firstRadius);
            nextPosition.y = random.nextRange(position.y - firstRadius, position.y + firstRadius);
            while (nextPosition.x < firstRadius){
                nextPosition.x += 5;
            }
            while (nextPosition.x > map.mapWidth - firstRadius){
                nextPosition.x -= 5;
            }
            while (nextPosition.y < firstRadius){
                nextPosition.y += 5;
            }
            while (nextPosition.y > map.mapWidth - firstRadius){
                nextPosition.y -= 5;
            }
            valid = map.isValid(nextPosition.y, nextPosition.x);
        }     

        diffX = nextPosition.x - position.x;
        diffY = nextPosition.y - position.y;

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

                nextRadius = currentRadius;

                position.x = nextPosition.x;
                position.y = nextPosition.y;
                let valid = false;
                while (!valid){
                    nextRadius = currentRadius - percentLessEachShrink * map.mapWidth/2;
                    nextPosition.x = random.nextRange(position.x - currentRadius + nextRadius, position.x + currentRadius - nextRadius);
                    nextPosition.y = random.nextRange(position.y - currentRadius + nextRadius, position.y + currentRadius - nextRadius);
                    valid = map.isValid(nextPosition.y, nextPosition.x);
                }
                diffX = nextPosition.x - position.x;
                diffY = nextPosition.y - position.y;
                console.log('shield moved to', position, 'radius', currentRadius);
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