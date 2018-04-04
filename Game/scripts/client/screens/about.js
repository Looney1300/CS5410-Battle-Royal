MyGame.screens['about'] = (function() {
    'use strict';
  
    function initialize() {
      console.log('about is inited');
      document.getElementById('id-about-back').addEventListener(
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