(function (exports) {
    'use strict';

    let random = require ('../utilities/random');
    
    exports.create = function(map, startDiameterAsPercentOfMapWidth, minutesBetweenShieldMoves){
        let that = {};
        let firstRadius = map.mapWidth * startDiameterAsPercentOfMapWidth/2;
        let currentRadius = map.mapWidth*10;
        let position = {x: map.mapWidth/2, y: map.mapWidth/2};
        let waitTime = 1000 * 60 * minutesBetweenShieldMoves;
        let timeTilNextShield = waitTime;
        let percentLessEachShrink = .14;
        let nextPosition = {
            x: random.nextRange(position.x - currentRadius, position.x + currentRadius),
            y: random.nextRange(position.y - currentRadius, position.y + currentRadius)
        };
        let shieldMovesDone = 0;
        let shieldMovesTotal = 4;

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

        that.update = function(elapsedTime){
            if (shieldMovesDone > shieldMovesTotal){
                nextPosition = position;
                return false;
            }
            timeTilNextShield -= elapsedTime;
            if(timeTilNextShield < 0){
                console.log('Shield moving');
                shieldMovesDone += 1;
                timeTilNextShield += waitTime;
                if (currentRadius > firstRadius){
                    currentRadius = firstRadius;
                }else{
                    currentRadius -= percentLessEachShrink * map.mapWidth/2;
                }
                let valid = false;
                while (!valid){
                    console.log(position);
                    position = nextPosition;
                    nextPosition.x = random.nextRange(position.x - currentRadius, position.x + currentRadius);
                    nextPosition.y = random.nextRange(position.y - currentRadius, position.y + currentRadius);
                    while (nextPosition.x < currentRadius){
                        nextPosition.x += 5;
                    }
                    while (nextPosition.x > map.mapWidth - currentRadius){
                        nextPosition.x -= 5;
                    }
                    while (nextPosition.y < currentRadius){
                        nextPosition.y += 5;
                    }
                    while (nextPosition.y > map.mapWidth - currentRadius){
                        nextPosition.y -= 5;
                    }
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