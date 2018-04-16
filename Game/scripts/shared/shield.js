(function (exports) {
    'use strict';

    let random = require ('../utilities/random');
    
    exports.create = function(map, startDiameterAsPercentOfMapWidth, minutesBetweenShieldMoves){
        let that = {};
        let firstRadius = map.mapWidth * startDiameterAsPercentOfMapWidth/2;
        let currentRadius = map.mapWidth*10;
        let nextRadius = firstRadius;
        let position = {x: map.mapWidth/2, y: map.mapWidth/2};
        let waitTime = 1000 * 60 * minutesBetweenShieldMoves;
        let timeTilNextShield = waitTime;
        let percentLessEachShrink = .14;
        let nextPosition = {};
        let shieldMovesDone = 0;
        let shieldMovesTotal = 4;

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

        that.update = function(elapsedTime){
            if (shieldMovesDone > shieldMovesTotal){
                return false;
            }
            timeTilNextShield -= elapsedTime;
            if(timeTilNextShield < 0){
                shieldMovesDone += 1;
                timeTilNextShield += waitTime;
                if (currentRadius > firstRadius){
                    currentRadius = firstRadius;
                    nextRadius = firstRadius - percentLessEachShrink * map.mapWidth/2;
                }else{
                    nextRadius = currentRadius;
                    currentRadius -= percentLessEachShrink * map.mapWidth/2;
                }
                position.x = nextPosition.x;
                position.y = nextPosition.y;
                let valid = false;
                while (!valid && shieldMovesDone <= shieldMovesTotal){
                    let nextRadius = currentRadius - percentLessEachShrink * map.mapWidth/2;
                    nextPosition.x = random.nextRange(position.x - currentRadius + nextRadius, position.x + currentRadius - nextRadius);
                    nextPosition.y = random.nextRange(position.y - currentRadius + nextRadius, position.y + currentRadius - nextRadius);
                    valid = map.isValid(nextPosition.y, nextPosition.x);
                }
                console.log('shield moved to', position, 'radius', currentRadius);
                return true;
            }
            return false;
        }

        return that;
    };
})(typeof exports === 'undefined' ? this['Shield'] = {} : exports);