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
      console.log('about is running');
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());