MyGame.screens['options'] = (function() {
    'use strict';
  
    function initialize() {
      console.log('options is inited');
      document.getElementById('id-options-back').addEventListener(
        'click',
        function() {
          MyGame.pregame.showScreen('main-menu');
        }
      );
    }
  
    function run() {
      console.log('options is running');
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());