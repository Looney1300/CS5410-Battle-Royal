MyGame.screens['game-play'] = (function() {
    'use strict';
  
    function initialize() {
      console.log('game-play is inited');

    }
  
    function run() {
      let socket = MyGame.main.socket;

      console.log('game-play is running');
      console.log('I am ready to play!');
      socket.emit('readyplayerone','hitme!');
      MyGame.main.initialize();
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());