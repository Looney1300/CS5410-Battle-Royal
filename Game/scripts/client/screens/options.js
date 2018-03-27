BattleRoyal.screens['options'] = (function(game, graphics, input) {
    'use strict';
    
    let oldKey;
    let newKey;
    let quit = false;

    let myfov = graphics.FOV();
    let lastTimeStamp = performance.now();
    let myKeyboard = input.Keyboard();
    let myMouse = input.Mouse();
    
    let myTexture = graphics.Model({
        image : 'assets/USU-Logo.png',
        center : { x : 300, y : 300 },
        width : 50, height : 50,
        rotation : 0,
        moveRate: 200, // pixels per second
        rotateRate: 3.14159 // radians per second
    });
    let background = graphics.BackGround({
        image : 'assets/FortDayMapTest.png'
    });

    function initialize() {
        myMouse.registerCommand('mousemove', function(e){
            myfov.move(e.clientX, e.clientY);
        })

        myKeyboard.registerCommand(KeyEvent.DOM_VK_W, myTexture.moveUp);
        myKeyboard.registerCommand(KeyEvent.DOM_VK_S, myTexture.moveDown);
        myKeyboard.registerCommand(KeyEvent.DOM_VK_A, myTexture.moveLeft);
        myKeyboard.registerCommand(KeyEvent.DOM_VK_D, myTexture.moveRight);
        myKeyboard.registerCommand(KeyEvent.DOM_VK_E, myfov.widen);
        myKeyboard.registerCommand(KeyEvent.DOM_VK_Q, myfov.thin);

        document.getElementById('id-options-back').addEventListener(
            'click',
            function() { quit = true; game.showScreen('main-menu'); }
        );
        let ele = document.getElementById('moveLeft');
        ele.innerText = KeyEvent.DOM_VK_A;
        ele.addEventListener(
            'click',
            function(){ oldKey = ele.innerHTML; ele.style.border = "thick solid rgb(0, 255, 0)"}
        );
        //game.updateKeyBinding(nextClick)
    }
  
    function run() {
        console.log('credits running');
        let lastTimeStamp = performance.now();

        function processInput(elapsedTime) {
            myKeyboard.processInput(elapsedTime);
            myMouse.update(elapsedTime);
        }
    
        function update() {
            myfov.update(myTexture.getImageCenter());
            background.update(myTexture.getMapCenter());
        }
        
        function render() {
            graphics.clear();
            background.draw();
            myfov.draw();
            myTexture.draw();
        }

        function gameLoop(currentTime) {
            if (!quit){
                let elapsedTime = currentTime - lastTimeStamp;
                lastTimeStamp = currentTime;
                processInput(elapsedTime);
                update();
                render();
        
                requestAnimationFrame(gameLoop);
            }
        };

        requestAnimationFrame(gameLoop);
    
    }
  
    return {
        initialize : initialize,
        run : run
    };
  
  }(BattleRoyal.game, BattleRoyal.graphics, BattleRoyal.input));