MyGame.screens['join-room'] = (function() {
    'use strict';

    let socket = MyGame.main.socket;
    let user = null;
    let roomies = [];
    let host = null;
  
    function initialize() {
      console.log('join-room is inited');

      socket.on('youAreHost', function(){
        document.getElementById('youAreHostDiv').innerHTML = "You are the Game's Host, press 'Begin Game' button to start the game.";
        document.getElementById('startGame').onclick = function (){ socket.emit('hostStartGame'); };
        document.getElementById('startGame').hidden = false;
      });

      socket.on('notEnoughPlayers', function(){
        document.getElementById('youAreHostDiv').innerHTML += "<div style=\"color: red; font-size=2em;\" >Need at least two players to start game.</div>";
      });

      function loadRoomies(){
        console.log(roomies);
        document.getElementById('joined-chat').innerHTML = "";
        for (let i=0; i < roomies.length; ++i){
          if (roomies[i] === host){
            document.getElementById('joined-chat').innerHTML += "<span style=\"color: red;\" > Host: " + roomies[i] + "</span>, ";
          } else {
            document.getElementById('joined-chat').innerHTML += roomies[i] + ', ';
          }
        }
      }

      socket.on('enteredChat', function(users){
        roomies = users;
        loadRoomies();
      });

      socket.on('chatData', function(data) {
        user = data.username;
        host = data.host;
        roomies = data.users;
        loadRoomies();
      });

      socket.on('playerExited', function(data){
        if (data.hostId === 0){
          host = null;
        }
        roomies = data.users;
        loadRoomies();
      });

      socket.on('newmsg', function(data) {
        if(user) {
          document.getElementById('message-container').innerHTML += '<div><b>' + 
            data.user + '</b>: ' + data.message + '</div>';
        }
      });
    
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
      socket.emit('joinedChat', username);
      
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