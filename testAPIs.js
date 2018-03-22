MyGame.main = (function (graphics, input, particleSystem, persistence) {
    let previousTime = performance.now();

    let keyboard = input.Keyboard();

    let menuSpec = {
        background: '',
        button: {
            fill: color.addAlpha(color.red, .8),
            stroke: 'rgba(0, 150, 255, 1)',
            //width: 900,
            //height: 150,
        },
        text: {
            size: '4em',
            font: 'Courier',
            fillStyle: 'rgba(0, 200, 0, 1)',
            strokeStyle: 'rgba(0, 150, 0, 1)',
            lineWidth: 3
        },
        buttons: ['New Game', 'Key Bindings', 'High Scores', 'Join Game', 'h', 'a', ''],
        //gap: 100
    }

    let menuGraphic = graphics.Menu(menuSpec);

    let text = {
        text: 'hello',
        size: '2em',
        font: 'Courier',
        fillStyle: 'rgba(0, 100, 0, 1)',
        strokeStyle: 'rgba(0, 100, 0, 1)',
        align: 'center',
        baseline: 'bottom',
        lineWidth: 3,
        x: 100,
        y: 100
    }

    let letters = graphics.Letters(text);

    let particleSpec = {
        x: 0,
        y: 0,
        xMax: 1600,
        yMax: 0,
        particlesPerSec: 10,
        // fill: color.red,
        // lineWidth: 1,
        // stroke: color.black,
        imageSrc: 'snow.png',
        rotationMax: 1,
        lifetime: {mean: 10000, std: 100},
        speed: {mean: 100, std: 0},
        size: {mean: 50, std: 10},
        gravity: 0,
        limitY: 1,
        limitX: 0,
        // duration: 200,
    }

    particleSystem.ParticleEffect(particleSpec);

    let particleSpec2 = {
        x: 600,
        y: 100,
        // xMax: 850,
        // yMax: 550,
        particlesPerSec: 20,
        fill: color.white,
        lineWidth: 1,
        // stroke: color.green,
        // imageSrc: 'bubble1b.png',
        rotationMax: 1,
        lifetime: {mean: 10000, std: 100},
        speed: {mean: 50, std: 10},
        size: {mean: 10, std: 1},
        gravity: 1,
        // duration: 10000,
    }

    // particleSystem.ParticleEffect(particleSpec2);
 
    let particleSpec3 = {
        x: 625,
        y: 100,
        // xMax: 850,
        // yMax: 550,
        particlesPerSec: 20,
        fill: color.green,
        lineWidth: 1,
        // stroke: color.green,
        // imageSrc: 'bubble1b.png',
        rotationMax: 1,
        lifetime: {mean: 10000, std: 100},
        speed: {mean: 50, std: 10},
        size: {mean: 10, std: 1},
        gravity: 1,
        onTop: true,
        // duration: 10000,
    }

    // particleSystem.ParticleEffect(particleSpec3);

    //-----------------------------------------------------
    //
    //                  Actual Game Loop
    //
    //-----------------------------------------------------

    function update(elapsedTime) {
        particleSystem.update(elapsedTime);
    }

    function processInput(elapsedTime) {
        keyboard.processInput(elapsedTime);
    }

    function render() {
        graphics.clear();
        particleSystem.draw();
    }

    function gameLoop(time) {
        let elapsedTime = time - previousTime;
        previousTime = time;

        processInput(elapsedTime);
        update(elapsedTime);
        render();
        requestAnimationFrame(gameLoop);
    }

    console.log('game initializing...');
    requestAnimationFrame(gameLoop);

})(MyGame.graphics, MyGame.input, MyGame.particleSystem, MyGame.persistence);
