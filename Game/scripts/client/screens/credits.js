MyGame.screens['credits'] = (function() {
    'use strict';
  
    function initialize() {
      console.log('credits is inited');
      document.getElementById('id-credits-back').addEventListener(
        'click',
        function() {
          MyGame.pregame.showScreen('main-menu');
        }
      );
    }
  
    function run() {

    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());