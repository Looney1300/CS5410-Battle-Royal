BattleRoyal.screens['joinroom'] = (function(game) {
    'use strict';
    
  
    function initialize() {
      console.log('joinroom running initialize');
    }
  
    function run(socket) {
      console.log('joinroom running', socket);

     document.getElementById('id-chat-start-button').addEventListener(
			'click',
			function() {
        //console.log(document.getElementById('id-chat-name').value); 
        socket.emit('setUsername', document.getElementById('id-chat-name').value);
      });





      var user;
      socket.on('userExists', function(data) {
         document.getElementById('error-container').innerHTML = data;
      });
      socket.on('userSet', function(data) {
         user = data.username;
         document.getElementById('joinroom').innerHTML = '<input type = "text" id = "message">\
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











    }
  
    return {
      initialize : initialize,
      run : run
    };
  
  }(BattleRoyal.game));