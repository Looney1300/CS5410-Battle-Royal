MyGame.screens['join-room'] = (function() {
    'use strict';
  
    function initialize() {
      console.log('join-room is inited');

    }
  
    function run() {
        let socket = MyGame.main.socket;
      //console.log('join-room is running with id: ', MyGame.main.socket);
      //MyGame.main.initialize();

        document.getElementById('id-chat-start-button').addEventListener('click', function() {
            // When the button is clicked set the user name equal to the input
            socket.emit('setUsername', document.getElementById('id-chat-name').value);
        });



        socket.on('userExists', function(data) {
            document.getElementById('error-container').innerHTML = data;
        });
    
        var user;
    
        socket.on('userSet', function(data) {
           user = data.username;
           document.getElementById('join-room').innerHTML = '<input type = "text" id = "message">\
           <button type = "button" id = "id-chat-start-buttonp2" >Send</button>\
           <div id = "message-container"></div>';
    
           document.getElementById('id-chat-start-buttonp2').addEventListener(
            'click',
            function sendMessage() {
              var msg = document.getElementById('message').value;
              if(msg) {
                 socket.emit('msg', {message: msg, user: user});
              }
           });
        });
    
        socket.on('newmsg', function(data) {
            if(user) {
               document.getElementById('message-container').innerHTML += '<div><b>' + 
                  data.user + '</b>: ' + data.message + '</div>'
            }
        })
    
        socket.on('BeginCountDown', function(){
            console.log('The server says to begin the count down');
            var seconds_left = 3;
            var interval = setInterval(function() {
                document.getElementById('join-room').innerHTML += --seconds_left;
            
                if (seconds_left <= 0)
                {
                    console.log('the game has begun');
                    document.getElementById('join-room').innerHTML = 'You are ready';
                    MyGame.pregame.showScreen('game-play');
                    //gameHasBegun = true;
                    //requestAnimationFrame(gameLoop);
                    //showScreen('game-play');
                    //showScreen(game-play);
                    clearInterval(interval);
                    
                }
            }, 1000);
            
        })





      
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());