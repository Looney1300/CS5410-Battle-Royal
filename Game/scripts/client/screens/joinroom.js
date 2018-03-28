BattleRoyal.screens['joinroom'] = (function(game) {
    'use strict';
    
  
    function initialize() {
      console.log('joinroom running initialize');
      document.getElementById('id-joinroom-back').addEventListener(
        'click',
        function() {
          game.showScreen('main-menu');
        }
      );
    }
  
    function run(socket) {
      console.log('joinroom running', socket);

     document.getElementById('id-chat-start-button').addEventListener(
			'click',
			function() {
        // When the button is clicked set the user name equal to the input
        socket.emit('setUsername', document.getElementById('id-chat-name').value);
      });

      //game.showScreen('game-play');

      

    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }(BattleRoyal.game));