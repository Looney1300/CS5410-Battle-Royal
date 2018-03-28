MyGame.screens['high-scores'] = (function() {
    'use strict';
  
    function initialize() {
      console.log('high score is inited');
      document.getElementById('id-high-scores-back').addEventListener(
        'click',
        function() {
          MyGame.pregame.showScreen('main-menu');
        }
      );
    }
  
    function run() {
      console.log('high scores is running');
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());