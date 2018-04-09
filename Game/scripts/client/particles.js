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

    //UpdateParticles updates the particles and removes them when dead, and their corresponding graphics.
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

    function renderParticleSystem(){
        for (let i=0; i<particleGraphics.length; ++i){
            particleGraphics[i].draw(particles[i].particles);
        }
    }

    return {
        ParticleEffect: ParticleEffect,
        update: updateParticles,
        render: renderParticleSystem
    };

}(MyGame.graphics));

// --------------------------------------------------------
//
//          Game specific particle effects
//
// Just call these functions with the correct location when
// one of these effects is needed.
//
// --------------------------------------------------------
MyGame.particleSystem.clientEliminated = function(location){
    let particleSpec = {
        drawUsing: MyGame.graphics.Rectangle,
        x: location.x - .02,
        y: location.y - .02,
        xMax: location.x + .02,
        yMax: location.y + .02,
        particlesPerSec: 40,
        // imageSrc: 'bubble1b.png',
        fill: Color.green,
        stroke: Color.brown,
        lineWidth: 2,
        rotationMax: 1,
        lifetime: {mean: 1500, std: 100},
        speed: {mean: .02, std: .01},
        size: {mean: .01, std: .001},
        onTop: true,
        gravity: 0,
        disappear: true,
        duration: 500,
    }

    MyGame.particleSystem.ParticleEffect(particleSpec);
};

MyGame.particleSystem.enemyEliminated = function(location){
    let particleSpec = {
        drawUsing: MyGame.graphics.Rectangle,
        x: location.x - .02,
        y: location.y - .02,
        xMax: location.x + .02,
        yMax: location.y + .02,
        particlesPerSec: 40,
        // imageSrc: 'bubble1b.png',
        fill: Color.red,
        stroke: Color.brown,
        lineWidth: 2,
        rotationMax: 1,
        lifetime: {mean: 1500, std: 100},
        speed: {mean: .02, std: .01},
        size: {mean: .01, std: .001},
        onTop: true,
        gravity: 0,
        disappear: true,
        duration: 500,
    }

    MyGame.particleSystem.ParticleEffect(particleSpec);
};

MyGame.particleSystem.shotSmoke = function(location, direction){
    let smokeDirection = direction;
    while (smokeDirection > 2*Math.PI){
        smokeDirection -= 2*Math.PI;
    }
    while (smokeDirection < -2*Math.PI){
        smokeDirection += 2*Math.PI;
    }
    console.log(MyGame.assets['explosion']);
    let particleSpec = {
        drawUsing: MyGame.graphics.Texture,
        x: location.x,
        y: location.y,
        particlesPerSec: 60,
        // imageSrc: 'assets/USU-Logo.png',
        fill: Color.grey,
        stroke: Color.grey,
        lineWidth: 2,
        rotationMax: 1,
        lifetime: {mean: 300, std: 100},
        speed: {mean: .1, std: 0},
        size: {mean: .005, std: .001},
        specifyDirection: {angle: smokeDirection, std: .5},
        onTop: true,
        gravity: 0,
        disappear: true,
        duration: 100,
    }

    MyGame.particleSystem.ParticleEffect(particleSpec);
};

MyGame.particleSystem.shieldSparks = function(center, radius){
    SPARKSPERCIRCUMFRANCEUNIT = 2;
    for (let i=0; i<radius*3.14159*SPARKSPERCIRCUMFRANCEUNIT; ++i){
        let cvec = random.nextCircleVector(radius);
        let particleSpec = {
            drawUsing: MyGame.graphics.Rectangle,
            x: center.x + cvec.x,
            y: center.y + cvec.y,
            particlesPerSec: 2,
            // imageSrc: 'bubble1b.png',
            fill: Color.blue,
            rotationMax: 1,
            lifetime: {mean: 200, std: 70},
            speed: {mean: 400, std: 50},
            size: {mean: 20, std: 1},
            onTop: true,
        }
        MyGame.particleSystem.ParticleEffect(particleSpec);
    }
};

MyGame.particleSystem.buildingHit = function(location){
    let particleSpec = {
        drawUsing: MyGame.graphics.Rectangle,
        x: location.x - .02,
        y: location.y - .02,
        xMax: location.x + .02,
        yMax: location.y + .02,
        particlesPerSec: 40,
        // imageSrc: 'bubble1b.png',
        fill: Color.green,
        stroke: Color.brown,
        lineWidth: 2,
        rotationMax: 1,
        lifetime: {mean: 1500, std: 100},
        speed: {mean: .02, std: .01},
        size: {mean: .01, std: .001},
        onTop: true,
        gravity: 0,
        disappear: true,
        duration: 500,
    }

    MyGame.particleSystem.ParticleEffect(particleSpec);
};
