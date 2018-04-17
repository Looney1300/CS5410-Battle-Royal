MyGame.screens['game-over'] = (function() {
    'use strict';
  
    function initialize() {
      //console.log('game-over is inited');
      document.getElementById('id-game-over-back').addEventListener(
        'click',
        function() {
          MyGame.pregame.showScreen('main-menu');
        }
      );

    }
  
    function run() {
      //console.log('I am IN the GO');
      let socket = MyGame.main.socket;
      socket.emit('score-request','hitme!');
      socket.on('score-response',data => {
        console.log(data);
      });
        //console.log('game_over is running');
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());