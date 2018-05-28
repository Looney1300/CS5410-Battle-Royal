MyGame.screens['game-play'] = (function() {
    'use strict';
  
    function initialize() {
      console.log('game-play is inited');

    }
  
    function run() {
      MyGame.main.initialize();
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());