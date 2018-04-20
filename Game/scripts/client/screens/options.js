MyGame.screens['options'] = (function(input) {
  'use strict';

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

  function assignKeyButton(id){
      let ele = document.getElementById(id);
      ele.addEventListener(
          'click',
          function(){
              selection = ele;
              ele.style.backgroundColor = 'rgb(0, 200, 0)';
              myKeyboard.registerNextKeyPress(ele);
          }
      );
  }

  function initialize() {
    document.getElementById('id-options-back').addEventListener(
            'click',
            function() {
                MyGame.pregame.showScreen('main-menu');
            }
        );
    myKeyboard = input.Keyboard();
    myMouse = input.Mouse();

      //This is for changing the background back of the keybinding buttons.
    document.addEventListener('keyup', function(){
        if(selection){
            selection.style.backgroundColor = backgroundColr;
            selection = null;
        }
    }); 
      
    document.getElementById('moveLeft').name = input.KeyEvent.DOM_VK_A;
    document.getElementById('moveRight').name = input.KeyEvent.DOM_VK_D;
    document.getElementById('moveUp').name = input.KeyEvent.DOM_VK_W;
    document.getElementById('moveDown').name = input.KeyEvent.DOM_VK_S;
    document.getElementById('rapidFire').name = input.KeyEvent.DOM_VK_V;
    document.getElementById('fire').name = input.KeyEvent.DOM_VK_SPACE;
    document.getElementById('sprint').name = input.KeyEvent.DOM_VK_SHIFT;
    
    document.getElementById('id-options-back').addEventListener(
        'click',
        function() { MyGame.pregame.showScreen('main-menu'); }
    );

    assignKeyButton('moveLeft');
    assignKeyButton('moveRight');
    assignKeyButton('moveUp');
    assignKeyButton('moveDown');
    assignKeyButton('rapidFire');
    assignKeyButton('fire');
    assignKeyButton('sprint');

  }


  function run() {
      console.log('credits running');
  
  }

  return {
      initialize : initialize,
      run : run,
  };

}(MyGame.input));