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
        let hasChosen = false;
        let isInMap = true;

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
            socket.emit('isValidStart',{x:xPos,y:yPos});
            console.log("x: " + xPos + " y: " + yPos); 
        }, false);

        socket.on('forceGameScreen', function(){
            if(!hasChosen){
                socket.emit('readyplayerone');
                MyGame.pregame.showScreen('game-play');
            }
        });
        socket.emit('inMapScreen');

        socket.on('isValidRes',function(data){
            if(isInMap){
                // draw on the map
                //console.log(data);
                let tempx = data.x/3200;
                tempx = tempx*500;
                let tempy = data.y/3200;
                tempy = tempy*500;
                //console.log('hahahahah',tempx,' ',tempy);
                context.fillStyle = '#FF0000';
                context.fillRect(tempx,tempy,10,10);
            }
        });

        socket.on('isValidForYou',function(input){
            hasChosen = true;
            console.log(input);
            socket.emit('readyplayerone', input);
            MyGame.pregame.showScreen('game-play');
        });

        // Need to receive and draw updates to the map

        // Need to receive the game start message

    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());