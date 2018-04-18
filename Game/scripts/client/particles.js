/*
EXAMPLE spec object:
 let particleSpec3 = {
     drawUsing: MyGame.graphics.Rectangle,
     x: 625,
     y: 100,
     // xMax: 850,
     // yMax: 550,
     particlesPerSec: 20,
     fill: Color.green,
     lineWidth: 1,
     stroke: Color.green,
     imageSrc: 'bubble1b.png',
     rotationMax: 1,
     lifetime: {mean: 500, std: 100},
     speed: {mean: 200, std: 10},
     size: {mean: 50, std: 1},
     specifyDirection: {angle: Math.PI/3, std: .1},
     gravity: 1,
     onTop: true,
     disappear: true,
     duration: 10000,
 }
*/
MyGame.particleSystem = (function(graphics){

    let particles = [];
    let activeParticleEffects = [];
    let particleGraphics = [];

    /*
    Particles makes a list of particle graphics.
    */
    function Particle(particle){
        if (particle.hasOwnProperty('fill')){
            particle.fillStyle = particle.fill;
        }
        if (particle.hasOwnProperty('stroke')){
            particle.strokeStyle = particle.stroke;
        }
        particle.x = particle.position.x;
        particle.y = particle.position.y;
        particle.width = particle.size;
        particle.height = particle.size;
        return particle.graphicsFunction(particle);
    }

    /*
    ParticleEffect creates a particle effect based on spec passed to it, which has...
      drawUsing - a reference to the graphics function to use when drawing this particle effect.
      x - position of particle
      y
      xMax (optional) - for effect over a range.
      yMax (optional) -  "    "     "     "
      limitY (optional) - expects 1, 0, or -1 : limits y direction of particles to either only up or only down, or no change in y.
      limitX (optional) - expects 1, 0, or -1 : limits x directoin of particles to either only right or only left, or no change in x.
      particlesPerSec
      lifetime.mean
      lifetime.std
      size.mean
      size.std
      speed.mean
      speed.std
      gravity
      stroke/fill/imageSrc
      disappear (optional)
      rotationMax (optional)
      duration (optional) - how long the effect will last, if left blank, will continue endlessly.
    Returns true if still active, and false if effect duration is finished.
    */
    function ParticleEffect(spec){
        activeParticleEffects.push(MakeParticleEffect(spec));
    }

    function MakeParticleEffect(spec){
        let that = {};
        let time = 1001/spec.particlesPerSec;
        let effectDuration = 0.0;
        let hasDuration = spec.hasOwnProperty('duration');
        let hasLimitDirection = spec.hasOwnProperty('specifyDirection');
        let hasDissappear = spec.hasOwnProperty('disappear');
        let hasRotationMax = spec.hasOwnProperty('rotationMax');
        let hasGravity = spec.hasOwnProperty('gravity');
        let hasFill = spec.hasOwnProperty('fill');
        let hasLineWidth = spec.hasOwnProperty('lineWidth');
        let hasStroke = spec.hasOwnProperty('stroke');
        let hasImageSrc = spec.hasOwnProperty('imageSrc');
        let hasXMax = spec.hasOwnProperty('xMax');
        let hasYMax = spec.hasOwnProperty('yMax');
        let hasOnTop = spec.hasOwnProperty('onTop');

        that.update = function(elapsedTime){
            time += elapsedTime;
            effectDuration += elapsedTime;
            //Makes a certain number of particles per second.
            // make one particle every 1000/spec.particlesPerSec
            if (hasDuration && effectDuration > spec.duration){
                return false;
            }
            for (time; time > (1000/spec.particlesPerSec); time -= (1000/spec.particlesPerSec) ){
                let p = {
                    graphicsFunction: spec.drawUsing,
                    speed: Math.abs(nextGaussian(spec.speed.mean/1000, spec.speed.std/1000)),	// pixels per millisecond
                    rotation: 0,
                    lifetime: Math.abs(nextGaussian(spec.lifetime.mean, spec.lifetime.std)),	// milliseconds
                    alive: 0,
                    size: nextGaussian(spec.size.mean, spec.size.std),
                    o: 1,
                };
                if (hasLimitDirection){
                    p.direction = nextCircleVectorAround(1, spec.specifyDirection.angle, spec.specifyDirection.std);
                }else{
                    p.direction = nextCircleVector(1);
                }
                if (hasDissappear){
                    p.disappear = spec.disappear;
                }
                if (hasRotationMax){
                    p.rotationRate = nextGaussian(0, spec.rotationMax);
                }
                if (hasGravity){
                    p.gravity = spec.gravity;
                }
                if (hasFill){
                    p.fill = spec.fill;
                }
                if (hasLineWidth){
                    p.lineWidth = spec.lineWidth;
                }
                if (hasStroke){
                    p.stroke = spec.stroke;
                }
                if (hasImageSrc){
                    p.imageSrc = spec.imageSrc;
                }
                if (hasXMax && hasYMax){
                    p.position = { x: nextRangeFloat(spec.x, spec.xMax), y: nextRangeFloat(spec.y, spec.yMax)};
                }else{
                    p.position = {x: spec.x, y: spec.y};
                }
                let index = Math.random()*100000 % particles.length;
                if (hasOnTop){
                    index = particles.length - 1;
                }
                particles.splice(index, 0, p);
                particleGraphics.splice(index, 0, Particle(p));
            }

            return true;
        }

        return that;
    }

    // UpdateParticles updates the particles and removes them when dead, and their corresponding graphics.
    function updateParticles(elapsedTime){
        //Loop through particles
        for (let particle = (particles.length-1); particle >= 0; --particle) {
            particles[particle].alive += elapsedTime;
            particles[particle].direction.y += (elapsedTime * particles[particle].gravity/1000);
            particles[particle].x += (elapsedTime * particles[particle].speed * particles[particle].direction.x);
            particles[particle].y += (elapsedTime * particles[particle].speed * particles[particle].direction.y);
            // console.log(particles[0]);
            
            if (particles[particle].disappear){
                let transparency = 1-(particles[particle].alive/particles[particle].lifetime);
                if (particles[particle].hasOwnProperty('stroke')){
                    particles[particle].strokeStyle = Color.addAlpha(particles[particle].stroke, transparency);
                }
                if (particles[particle].hasOwnProperty('fill')){
                    particles[particle].fillStyle = Color.addAlpha(particles[particle].fill, transparency);
                }
                if (particles[particle].hasOwnProperty('imageSrc')){
                    particles[particle].o = transparency;
                }
            }
            if (particles[particle].hasOwnProperty('rotationRate')){
                particles[particle].rotation += (elapsedTime * particles[particle].rotationRate/1000);
            }
            if (particles[particle].alive > particles[particle].lifetime) {
                particles.splice(particle, 1);
                particleGraphics.splice(particle, 1);
            }
        }
        //Add any new particles from ActiveParticleEffects and remove finished effects
        for (let i = (activeParticleEffects.length-1); i >= 0; --i){
            if (!activeParticleEffects[i].update(elapsedTime)){
                activeParticleEffects.splice(i, 1);
            }
        }
    }

    function renderParticleSystem(viewPort){
        for (let i=0; i<particleGraphics.length; ++i){
            particleGraphics[i].draw(viewPort);
        }
    }

    // This only clears the Active particle Effects, meaning all particles still alive will continue
    //  but any effects that are generating new particles will cease to produce new particles.
    function clearParticleEffects(){
        activeParticleEffects.length = 0;
    }

    // Clears all particles, associated graphics, and effects.
    function clearAll(){
        activeParticleEffects.length = 0;
        particleGraphics.length = 0;
        particles.length = 0;
    }

    return {
        ParticleEffect: ParticleEffect,
        update: updateParticles,
        render: renderParticleSystem,
        clearEffects: clearParticleEffects,
        clearAll: clearAll
    };

}(MyGame.graphics));

// --------------------------------------------------------
//
//          Game specific particle effects
//
// Just call these functions with the correct location in world coords when
// one of these effects is needed, graphics functions take care of conversion.
//
// --------------------------------------------------------
function particleIsInside(location, center, maxD){
    if (Math.abs(location.x-center.x) > maxD){
        return false;
    }
    else if(Math.abs(location.y-center.y) > maxD){
        return false;
    }
    return true;
}

MyGame.particleSystem.playerDied = function(location, direction, viewPortCenter, maxD){
    if (!particleIsInside(location, viewPortCenter, maxD)){
        return;
    }
    let shotDirection = direction;
    let dx = Math.cos(shotDirection);
    let dy = Math.sin(shotDirection);
    let loc = {x:location.x - 8.5*dx, y:location.y - 7*dy};
    let particleSpec = {
        drawUsing: MyGame.graphics.Rectangle,
        x: loc.x,
        y: loc.y,
        xMax: loc.x,
        yMax: loc.y,
        particlesPerSec: 500,
        fill: Color.green_dark,
        stroke: Color.black,
        lineWidth: .5,
        rotationMax: 1,
        lifetime: {mean: 500, std: 50},
        speed: {mean: 20, std: 10},
        size: {mean: .004, std: .0003},
        gravity: 0,
        disappear: true,
        duration: 100,
    }
    MyGame.particleSystem.ParticleEffect(particleSpec);

    let particleSpec2 = {
        drawUsing: MyGame.graphics.Circle,
        x: loc.x,
        y: loc.y,
        xMax: loc.x,
        yMax: loc.y,
        particlesPerSec: 500,
        fill: Color.red,
        // stroke: Color.black,
        // lineWidth: .5,
        // rotationMax: 1,
        lifetime: {mean: 150, std: 0},
        speed: {mean: 60, std: 20},
        size: {mean: .004, std: .001},
        gravity: 0,
        duration: 70,
    }
    MyGame.particleSystem.ParticleEffect(particleSpec2);
    
    let particleSpec3 = {
        drawUsing: MyGame.graphics.Circle,
        x: loc.x,
        y: loc.y,
        particlesPerSec: 9,
        fill: Color.red_dark,
        stroke: Color.black,
        lineWidth: 2,
        rotationMax: 1,
        lifetime: {mean: 700, std: 0},
        speed: {mean: 1, std: .2},
        size: {mean: .012, std: 0},
        onTop: true,
        gravity: 0,
        disappear: true,
        duration: 100,
    }
    MyGame.particleSystem.ParticleEffect(particleSpec3);
};

MyGame.particleSystem.playerSelfDied = function(location, direction, viewPortCenter, maxD){
    if (!particleIsInside(location, viewPortCenter, maxD)){
        return;
    }
    let shotDirection = direction;
    let dx = Math.cos(shotDirection);
    let dy = Math.sin(shotDirection);
    let loc = {x:location.x - 8.5*dx, y:location.y - 7*dy};

    let particleSpec = {
        drawUsing: MyGame.graphics.Rectangle,
        x: loc.x ,
        y: loc.y ,
        xMax: loc.x ,
        yMax: loc.y ,
        particlesPerSec: 1000,
        fill: Color.green_dark,
        stroke: Color.black,
        lineWidth: .5,
        rotationMax: 2,
        lifetime: {mean: 700, std: 200},
        speed: {mean: 40, std: 10},
        size: {mean: .004, std: .001},
        gravity: 0,
        duration: 100,
    }
    MyGame.particleSystem.ParticleEffect(particleSpec);

    let particleSpec2 = {
        drawUsing: MyGame.graphics.Circle,
        x: loc.x ,
        y: loc.y ,
        xMax: loc.x ,
        yMax: loc.y ,
        particlesPerSec: 1000,
        fill: Color.brown,
        stroke: Color.black,
        lineWidth: .5,
        rotationMax: 1,
        lifetime: {mean: 500, std: 50},
        speed: {mean: 20, std: 10},
        size: {mean: .004, std: .0003},
        gravity: 0,
        disappear: true,
        duration: 100,
    }
    MyGame.particleSystem.ParticleEffect(particleSpec2);
    
    let particleSpec3 = {
        drawUsing: MyGame.graphics.Circle,
        x: loc.x,
        y: loc.y,
        particlesPerSec: 9,
        fill: Color.green_dark,
        stroke: Color.black,
        lineWidth: 2,
        rotationMax: 1,
        lifetime: {mean: 500, std: 50},
        speed: {mean: 1, std: .2},
        size: {mean: .012, std: 0},
        onTop: true,
        gravity: 0,
        disappear: true,
        duration: 100,
    }
    MyGame.particleSystem.ParticleEffect(particleSpec3);
};

MyGame.particleSystem.enemyHit = function(location, viewPortCenter, maxD){
    if (!particleIsInside(location, viewPortCenter, maxD)){
        return;
    }
    let particleSpec = {
        drawUsing: MyGame.graphics.Circle,
        x: location.x,
        y: location.y,
        particlesPerSec: 200,
        fill: Color.red,
        // stroke: Color.red,
        lineWidth: 0,
        rotationMax: 1,
        lifetime: {mean: 200, std: 50},
        speed: {mean: 20, std: 10},
        size: {mean: .003, std: .0005},
        onTop: true,
        gravity: 0,
        disappear: true,
        duration: 80,
    }

    MyGame.particleSystem.ParticleEffect(particleSpec);
};

MyGame.particleSystem.shotSmoke = function(location, direction, viewPortCenter, maxD){
    // if (!particleIsInside(location, viewPortCenter, maxD)){
    //     return;
    // }
    let shotDirection = direction;
    while (shotDirection > 2*Math.PI){
        shotDirection -= 2*Math.PI;
    }
    while (shotDirection < -2*Math.PI){
        shotDirection += 2*Math.PI;
    }
    let fireParticleSpec = {
        drawUsing: MyGame.graphics.Rectangle,
        // imageSrc: 'assets/USU-Logo.png',
        fill: Color.yellow,
        // stroke: Color.yellow,
        // lineWidth: 2,
        size: {mean: .004, std: 0},
        x: location.x,
        y: location.y,
        particlesPerSec: 800,
        rotationMax: 0,
        lifetime: {mean: 50, std: 0},
        speed: {mean: 400, std: 300},
        specifyDirection: {angle: shotDirection, std: 0},
        onTop: true,
        gravity: 0,
        disappear: true,
        duration: 50,
    }
    let smokeParticleSpec = {
        drawUsing: MyGame.graphics.Circle,
        fill: Color.grey,
        stroke: Color.grey,
        lineWidth: 2,
        size: {mean: .002, std: .0004},
        x: location.x,
        y: location.y,
        particlesPerSec: 60,
        rotationMax: 1,
        lifetime: {mean: 200, std: 50},
        speed: {mean: 50, std: 10},
        specifyDirection: {angle: shotDirection, std: .3},
        onTop: true,
        gravity: 0,
        disappear: true,
        duration: 100,
    }

    MyGame.particleSystem.ParticleEffect(fireParticleSpec);
    MyGame.particleSystem.ParticleEffect(smokeParticleSpec);
    
};

MyGame.particleSystem.shieldSparks = function(center, radius, duration, viewPortCenter, maxD){
    let SPARKSPERCIRCUMFRANCEUNIT = .025;
    for (let i=0; i<radius*Math.PI*SPARKSPERCIRCUMFRANCEUNIT; ++i){
        let cvec = nextCircleVector(radius);
        //If inside extended viewport, then add a particle effect there.
        if (particleIsInside({x:center.x + cvec.x, y:center.y + cvec.y}, viewPortCenter, maxD)){
            let particleSpec = {
                drawUsing: MyGame.graphics.Texture,
                x: center.x + cvec.x,
                y: center.y + cvec.y,
                particlesPerSec: 1,
                imageSrc: 'assets/spark.png',
                rotationMax: 4,
                lifetime: {mean: 1000, std: 500},
                speed: {mean: 15, std: 5},
                size: {mean: .01, std: .005},
                specifyDirection: {angle: Math.atan2(cvec.y, cvec.x) + Math.PI, std: .5},
                onTop: true,
                gravity: 0,
                duration: duration,
            }
            MyGame.particleSystem.ParticleEffect(particleSpec);
        }
    }
};

MyGame.particleSystem.hitBuilding = function(location, viewPortCenter, maxD){
    if (!particleIsInside(location, viewPortCenter, maxD)){
        return;
    }
    let particleSpec = {
        drawUsing: MyGame.graphics.Rectangle,
        x: location.x,
        y: location.y,
        particlesPerSec: 100,
        // imageSrc: 'bubble1b.png',
        fill: Color.yellow,
        rotationMax: 4,
        lifetime: {mean: 80, std: 30},
        speed: {mean: 100, std: 20},
        size: {mean: .002, std: .0005},
        onTop: true,
        gravity: 0,
        disappear: true,
        duration: 50,
    }

    MyGame.particleSystem.ParticleEffect(particleSpec);
};
