MyGame.screens['join-room'] = (function() {
    'use strict';

    let socket = MyGame.main.socket;
    let user = null;
  
    function initialize() {
      console.log('join-room is inited');
      document.getElementById('id-join-room-back').addEventListener(
        'click',
        function() {
          //socket.emit('exitedchat','gone');  
          MyGame.pregame.showScreen('main-menu');
        }
      );

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
      console.log(socket);
      let username = document.getElementById('userName').value;
      if (username === ""){
        username = document.getElementById('newUserName').value;
      }
      socket.emit('setUsername', username);

      document.getElementById('join-room').innerHTML = '<input type = "text" maxlength = "40" id = "message">\
      <button type = "button" id = "id-chat-start-buttonp2" >Send</button>\
      <button type = "button" id = "id-back-button" >Back</button>\
      <div id = "message-container"></div>';

      document.getElementById('id-back-button').addEventListener('click', function() {
        socket.emit('exitedchat',user);
        document.getElementById('join-room').innerHTML = '<div id = "error-container"></div>\
        <!-- <input type = "text" id = "id-chat-name" value = "" placeholder = "Enter your name!"> -->\
        <button type = "button" id = "id-chat-start-button">Let me chat!</button>\
        <ul class = "menu">\
        <li><button id = "id-join-room-back">Back</button></li>\
        </ul>';
        user = null;
        MyGame.pregame.showScreen('main-menu');
        }
      );
  
      document.getElementById('id-chat-start-buttonp2').addEventListener('click', 
        function sendMessage() {
          let msg = document.getElementById('message').value;
          if(msg) {
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