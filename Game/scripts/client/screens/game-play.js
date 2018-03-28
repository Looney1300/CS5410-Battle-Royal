MyGame.screens['game-play'] = (function() {
    'use strict';
  
    function initialize() {
      console.log('game-play is inited');

    }
  
    function run() {
      console.log('game-play is running');
      MyGame.main.initialize();
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());