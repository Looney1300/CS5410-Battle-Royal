MyGame.screens['options'] = (function(graphics, input) {
  'use strict';

  let quit;

  let myfov;
  let myKeyboard;
  let myMouse;
  
  let selection;
  let backgroundColr;
  backgroundColr = document.getElementById('moveUp').style.backgroundColor;

  // --This initializes the key value pairs for the right functionality.
  let keyText = {};
  for (let key in input.KeyName){
      keyText[input.KeyName[key]] = key;
  }
  input.KeyName = keyText;
  // ---------------------------------------------

  let myTexture;
  let background;

  function assignKeyButton(id, handler){
      let ele = document.getElementById(id);
      ele.addEventListener(
          'click',
          function(){
              selection = ele;
              ele.style.backgroundColor = 'rgb(0, 200, 0)';
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

      myMouse.registerHandler('mousemove', function(e){
          myfov.move(e.clientX, e.clientY);
      });

      //TODO: firing
      myMouse.registerHandler('mousedown', function(e){
          console.log('clicked');
          
      });

      //This is for changing the background back of the keybinding buttons.
      document.addEventListener('keyup', function(){
          if(selection){
              selection.style.backgroundColor = backgroundColr;
              selection = null;
          }
      }); 

      //Default Key registrations
      myKeyboard.registerHandler(myTexture.moveUp, input.KeyEvent.DOM_VK_W, true);
      myKeyboard.registerHandler(myTexture.moveDown, input.KeyEvent.DOM_VK_S, true);
      myKeyboard.registerHandler(myTexture.moveLeft, input.KeyEvent.DOM_VK_A, true);
      myKeyboard.registerHandler(myTexture.moveRight, input.KeyEvent.DOM_VK_D, true);
      myKeyboard.registerHandler(myfov.widen, input.KeyEvent.DOM_VK_E, true);
      myKeyboard.registerHandler(myfov.thin, input.KeyEvent.DOM_VK_Q, true);
      
      document.getElementById('moveLeft').name = input.KeyEvent.DOM_VK_A;
      document.getElementById('moveRight').name = input.KeyEvent.DOM_VK_D;
      document.getElementById('moveUp').name = input.KeyEvent.DOM_VK_W;
      document.getElementById('moveDown').name = input.KeyEvent.DOM_VK_S;

      document.getElementById('id-options-back').addEventListener(
          'click',
          function() { quit = true; MyGame.pregame.showScreen('main-menu'); }
      );

      assignKeyButton('moveLeft', myTexture.moveLeft);
      assignKeyButton('moveRight', myTexture.moveRight);
      assignKeyButton('moveUp', myTexture.moveUp);
      assignKeyButton('moveDown', myTexture.moveDown);

  }


  function run() {
      console.log('credits running');
      quit = false;
      
      let lastTimeStamp = performance.now();

      function processInput(elapsedTime) {
          myKeyboard.update(elapsedTime);
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

}(MyGame.miniCanvas, MyGame.input));