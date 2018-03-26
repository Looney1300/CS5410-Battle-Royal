BattleRoyal.screens['joinroom'] = (function(game) {
    'use strict';
    
  
    function initialize() {
      console.log('joinroom running initialize');
    }
  
    function run(socket) {
      console.log('joinroom running', socket);
      socket.emit('hello', 'hi there');

    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }(BattleRoyal.game));