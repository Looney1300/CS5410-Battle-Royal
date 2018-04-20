MyGame.screens['map-screen'] = (function() {
    'use strict';
  
    function initialize() {
      console.log('map-screen is inited');
    }
  
    function run() {
        let socket = MyGame.main.socket;
        let c = document.getElementById("canvasMapper");
        let context = c.getContext("2d");
        let image = document.getElementById('playerPicker');

        let xPos = 0;
        let yPos = 0;

        context.drawImage(image,0,0,500,500);
        c.addEventListener('click', function(event) {
            var rect = c.getBoundingClientRect();
            xPos = event.clientX - rect.left;
            yPos = event.clientY - rect.top;
            xPos = xPos/500;
            xPos = xPos*3200;
            yPos = yPos/500;
            yPos = yPos*3200;
            //socket.emit('isValidStart','hitme!');
            console.log("x: " + xPos + " y: " + yPos); 
        }, false);

        socket.on('doTheThing',function(){
            console.log('is it here?????');
            MyGame.pregame.showScreen('game-play');
        });

        socket.emit('inMapScreen');

        

        // Need to receive and draw updates to the map

        // Need to receive the game start message

        

    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());