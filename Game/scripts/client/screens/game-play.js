MyGame.screens['game-play'] = (function() {
    'use strict';
  
    function initialize() {
      console.log('game-play is inited');
      MyGame.main.initialize();
    }
  
    function run() {
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());