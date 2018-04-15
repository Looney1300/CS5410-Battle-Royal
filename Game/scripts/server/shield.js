MyGame.shield = function(map, startRadiusAsPercentOfMapWidth, minutesBetweenShieldMoves){
    let that = {};
    let firstRadius = map.mapWidth * startRadiusAsPercentOfMapWidth;
    let currentRadius = 0;
    let position = {x: map.mapWidth/2, y: map.mapWidth/2};
    let waitTime = 1000 * 60 * minutesBetweenShieldMoves;
    let timeTilNextShield = waitTime;

    that.update = function(elapsedTime){
        timeTilNextShield -= elapsedTime;
        if(timeTilNextShield < 0){
            timeTilNextShield += waitTime;
            if (this.currentRadius === 0){
                this.currentRadius = this.firstRadius;
            }else{
                this.currentRadius -= 0.08 * this.firstRadius;
                this.position.x = nextRange(this.position.x - this.currentRadius, this.position.x + this.currentRadius);
                this.position.y = nextRange(this.position.y - this.currentRadius, this.position.y + this.currentRadius);
            }
        }else{

        }
    }
    return that;
};