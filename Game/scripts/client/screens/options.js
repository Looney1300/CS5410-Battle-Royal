BattleRoyal.screens['options'] = (function(game, graphics, input) {
    'use strict';
 
    let quit;

    let myfov;
    let myKeyboard;
    let myMouse;
    
    let selection;

    let keyText = {};
    for (let key in KeyName){
        keyText[KeyName[key]] = key;
    }
    KeyName = keyText;

    let myTexture;
    let background;

    function assignKeyButton(id, handler){
        let ele = document.getElementById(id);
        ele.addEventListener(
            'click',
            function(){
                selection = ele;
                ele.style.border = "thick solid rgb(0, 255, 0)"
                myKeyboard.registerNextKeyPress(ele, handler);
            }
        );
    }

    function initialize() {
        myfov = graphics.FOV();
        myKeyboard = input.Keyboard();
        myMouse = input.Mouse();
        
        myTexture = graphics.Model({
            image : 'assets/USU-Logo.png',
            center : { x : 300, y : 300 },
            width : 50, height : 50,
            rotation : 0,
            moveRate: 200, // pixels per second
            rotateRate: 3.14159 // radians per second
        });
        background = graphics.BackGround({
            image : 'assets/FortDayMapTest.png'
        });

        myMouse.registerCommand('mousemove', function(e){
            myfov.move(e.clientX, e.clientY);
        });

        myMouse.registerCommand('mousepress', function(e){
            console.log('clicked');
        });

        document.addEventListener('keyup', function(){
            if(selection){
                selection.style.border="0px solid rgba(0, 0, 0, 0)";
                selection = null;
            }
        }); 

        //Default Key registrations
        myKeyboard.registerCommand(KeyEvent.DOM_VK_W, myTexture.moveUp);
        myKeyboard.registerCommand(KeyEvent.DOM_VK_S, myTexture.moveDown);
        myKeyboard.registerCommand(KeyEvent.DOM_VK_A, myTexture.moveLeft);
        myKeyboard.registerCommand(KeyEvent.DOM_VK_D, myTexture.moveRight);
        myKeyboard.registerCommand(KeyEvent.DOM_VK_E, myfov.widen);
        myKeyboard.registerCommand(KeyEvent.DOM_VK_Q, myfov.thin);
        
        document.getElementById('moveLeft').name = KeyEvent.DOM_VK_A;
        document.getElementById('moveRight').name = KeyEvent.DOM_VK_D;
        document.getElementById('moveUp').name = KeyEvent.DOM_VK_W;
        document.getElementById('moveDown').name = KeyEvent.DOM_VK_S;

        document.getElementById('id-options-back').addEventListener(
            'click',
            function() { quit = true; game.showScreen('main-menu'); }
        );

        assignKeyButton('moveLeft', myTexture.moveLeft);
        assignKeyButton('moveRight', myTexture.moveRight);
        assignKeyButton('moveUp', myTexture.moveUp);
        assignKeyButton('moveDown', myTexture.moveDown);

        //game.updateKeyBinding(nextClick)
    }

  
    function run() {
        console.log('credits running');
        quit = false;        
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
        run : run,
    };
  
  }(BattleRoyal.game, BattleRoyal.graphics, BattleRoyal.input));