MyGame.screens['map-screen'] = (function() {
    'use strict';
    let socket = MyGame.main.socket;
    let c = document.getElementById('canvasMapper');        
    let context = c.getContext('2d');
    let isInMap = false;
    
    function initialize() {
        console.log('map-screen is inited');
        
        let hasChosen = false;

        let xPos = 0;
        let yPos = 0;
        
        c.addEventListener('click', function(event) {
            var rect = c.getBoundingClientRect();
            xPos = event.clientX - rect.left;
            yPos = event.clientY - rect.top;
            xPos = xPos/500;
            xPos = xPos*3200;
            yPos = yPos/500;
            yPos = yPos*3200;
            socket.emit('isValidStart',{x:xPos,y:yPos});
        }, false);

        socket.on('forceGameScreen', function(){
            if(!hasChosen){
                socket.emit('readyplayerone');
                MyGame.pregame.showScreen('game-play');
            }
        });

        socket.on('isValidRes',function(data){
            if(isInMap){
                // draw on the map
                let tempx = data.x/3200;
                tempx = tempx*500;
                let tempy = data.y/3200;
                tempy = tempy*500;
                context.fillStyle = '#FF0000';
                context.fillRect(tempx,tempy,10,10);
            }
        });
        
        socket.on('isValidForYou',function(input){
            hasChosen = true;
            console.log('readyplayerone');
            socket.emit('readyplayerone');
            MyGame.pregame.showScreen('game-play');
        });
    }
  
    function run() {
        socket.emit('inMapScreen');        
        isInMap = true;
        let image = document.getElementById('playerPicker');
        context.drawImage(image,0,0,500,500);
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());