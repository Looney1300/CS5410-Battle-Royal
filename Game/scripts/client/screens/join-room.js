MyGame.screens['join-room'] = (function() {
    'use strict';

    let socket = MyGame.main.socket;
    let user = null;
    let chatRoomies = [];
  
    function initialize() {
      console.log('join-room is inited');

      socket.on('youAreHost', function(){
        document.getElementById('youAreHostDiv').innerHTML = "You are the Game's Host, press 'Begin Game' button to start the game.";
        document.getElementById('startGame').onclick = function (){ socket.emit('hostStartGame'); };
        document.getElementById('startGame').hidden = false;
      });

      socket.on('enteredChat', function(usrname){
          chatRoomies.push(usrname);
          document.getElementById('joined-chat').innerHTML += usrname + ', ';
      })

      socket.on('userSet', function(data) {
        user = data.username;
      });

      socket.on('newmsg', function(data) {
        if(user) {
          document.getElementById('message-container').innerHTML += '<div><b>' + 
            data.user + '</b>: ' + data.message + '</div>';
        }
      })
    
      socket.on('BeginCountDown', function(){
        if(user){
          let seconds_left = 3;
          let interval = setInterval(function() {
            document.getElementById('join-room').innerHTML += --seconds_left;
              if (seconds_left <= 0) {
                console.log('the game has begun');
                document.getElementById('join-room').innerHTML = 'You are ready';
                MyGame.pregame.showScreen('map-screen');
                clearInterval(interval);
              }
            }, 1000);
        }
      });      

    }
  
    function run() {
      let username = document.getElementById('userName').value;
      if (username === ""){
        username = document.getElementById('newUserName').value;
      }
      socket.emit('setUsername', username);
      
      socket.emit('host', username);

      document.getElementById('id-back-button').addEventListener('click', function() {
        socket.emit('exitedchat', user);
        user = null;
        MyGame.pregame.showScreen('main-menu');
        }
      );
  
      document.getElementById('id-chat-start-buttonp2').addEventListener('click', 
        function sendMessage() {
          let msg = document.getElementById('message').value;
          if (msg) {
            socket.emit('msg', {message: msg, user: user});
            document.getElementById('message').value = "";
          }

      });

     
    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }());