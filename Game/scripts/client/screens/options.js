MyGame.screens['options'] = (function(input, persistence) {
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
              //Will get added back into in the input file in Keyboard.registerNextKeyPress.
              persistence.remove(id);
              console.log('removed ', id, ele.name);
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

    //Get keybindings
    let keybindings = persistence.retrieveKeyBindings();

    //If they don't exist set them.
    if (!keybindings.hasOwnProperty('moveUp')){
        persistence.add('moveUp', input.KeyEvent.moveUp);
        persistence.add('moveRight', input.KeyEvent.moveRight);
        persistence.add('moveLeft', input.KeyEvent.moveLeft);
        persistence.add('moveDown', input.KeyEvent.moveDown);
        persistence.add('fire', input.KeyEvent.fire);
        persistence.add('rapidFire', input.KeyEvent.rapidFire);
        persistence.add('extendFOV', input.KeyEvent.extendFOV);
        persistence.add('shortenFOV', input.KeyEvent.shortenFOV);
        persistence.add('sprint', input.KeyEvent.sprint);
    }else{
        input.KeyEvent.moveUp = keybindings.moveUp;
        input.KeyEvent.moveDown = keybindings.moveDown;
        input.KeyEvent.moveLeft = keybindings.moveLeft;
        input.KeyEvent.moveRight = keybindings.moveRight;
        input.KeyEvent.fire = keybindings.fire;
        input.KeyEvent.rapidFire = keybindings.rapidFire;
        input.KeyEvent.extendFOV = keybindings.extendFOV;
        input.KeyEvent.shortenFOV = keybindings.shortenFOV;
        input.KeyEvent.sprint = keybindings.sprint;
    }

    //This is for changing the background back of the keybinding buttons.
    document.addEventListener('keyup', function(){
        if(selection){
            selection.style.backgroundColor = backgroundColr;
            selection = null;
        }
    }); 
      
    document.getElementById('moveLeft').name = input.KeyEvent.moveLeft;
    document.getElementById('moveRight').name = input.KeyEvent.moveRight;
    document.getElementById('moveUp').name = input.KeyEvent.moveUp;
    document.getElementById('moveDown').name = input.KeyEvent.moveDown;
    document.getElementById('extendFOV').name = input.KeyEvent.extendFOV;
    document.getElementById('shortenFOV').name = input.KeyEvent.shortenFOV;
    document.getElementById('rapidFire').name = input.KeyEvent.rapidFire;
    document.getElementById('fire').name = input.KeyEvent.fire;
    document.getElementById('sprint').name = input.KeyEvent.sprint;

    //Assign button text
    document.getElementById('moveLeft').innerText = input.KeyName[input.KeyEvent.moveLeft];
    document.getElementById('moveRight').innerText = input.KeyName[input.KeyEvent.moveRight];
    document.getElementById('moveUp').innerText = input.KeyName[input.KeyEvent.moveUp];
    document.getElementById('moveDown').innerText = input.KeyName[input.KeyEvent.moveDown];
    document.getElementById('extendFOV').innerText = input.KeyName[input.KeyEvent.extendFOV];
    document.getElementById('shortenFOV').innerText = input.KeyName[input.KeyEvent.shortenFOV];
    document.getElementById('rapidFire').innerText = input.KeyName[input.KeyEvent.rapidFire];
    document.getElementById('fire').innerText = input.KeyName[input.KeyEvent.fire];
    document.getElementById('sprint').innerText = input.KeyName[input.KeyEvent.sprint];
    
    document.getElementById('id-options-back').addEventListener(
        'click',
        function() { MyGame.pregame.showScreen('main-menu'); }
    );

    assignKeyButton('moveLeft');
    assignKeyButton('moveRight');
    assignKeyButton('moveUp');
    assignKeyButton('moveDown');
    assignKeyButton('extendFOV');
    assignKeyButton('shortenFOV');
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

}(MyGame.input, MyGame.persistence));