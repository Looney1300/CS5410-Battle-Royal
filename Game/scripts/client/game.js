BattleRoyal.game = (function(screens,components,graphics,renderer,input) {
	'use strict';


    let lastTimeStamp = performance.now();
    let myKeyboard = input.Keyboard();
	let playerSelf = {
        model: components.Player(),
        texture: BattleRoyal.assets['player-self']
		};
    let playerOthers = {};
    // We are not using missiles yet.
    // let missiles = {}
    // let explosions = {}
    // let nextExplosionId = 1;
	let messageHistory = Queue.create();
	let messageId = 1;
	let socket = io();
    let networkQueue = Queue.create();
    let gameHasBegun = false;







	// We are going to throw all of the network messages into a network queue


	socket.on(NetworkIds.CONNECT_ACK, data => {
		console.log('I CONNECTED', data);
        networkQueue.enqueue({
            type: NetworkIds.CONNECT_ACK,
            data: data
        });
    });

    socket.on(NetworkIds.CONNECT_OTHER, data => {
		console.log('SOMEBODY CONNECTED!', data);
        networkQueue.enqueue({
            type: NetworkIds.CONNECT_OTHER,
            data: data
        });
    });

    socket.on(NetworkIds.DISCONNECT_OTHER, function(data) {
		console.log('SOMEBODY DISCONNECTED!', data);
        networkQueue.enqueue({
            type: NetworkIds.DISCONNECT_OTHER,
            data: data
        });
    });

    socket.on(NetworkIds.UPDATE_SELF, data => {
        networkQueue.enqueue({
            type: NetworkIds.UPDATE_SELF,
            data: data
        });
    });

    socket.on(NetworkIds.UPDATE_OTHER, data => {
        networkQueue.enqueue({
            type: NetworkIds.UPDATE_OTHER,
            data: data
        });
    });

    // We are not using missiles yet.
    // socket.on(NetworkIds.MISSILE_NEW, data => {
    //     networkQueue.enqueue({
    //         type: NetworkIds.MISSILE_NEW,
    //         data: data
    //     });
    // });

    // socket.on(NetworkIds.MISSILE_HIT, data => {
    //     networkQueue.enqueue({
    //         type: NetworkIds.MISSILE_HIT,
    //         data: data
    //     });
    // });

     



    // The following socket code is used for chatting in the chat room.
    // Some errors crop up when a client leaves and re-enters the chat room.
    socket.on('userExists', function(data) {
        document.getElementById('error-container').innerHTML = data;
    });

    var user;

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

    socket.on('BeginCountDown', function(){
        console.log('The server says to begin the count down');
        var seconds_left = 10;
        var interval = setInterval(function() {
            document.getElementById('joinroom').innerHTML += --seconds_left;
        
            if (seconds_left <= 0)
            {
                document.getElementById('joinroom').innerHTML = 'You are ready';
                gameHasBegun = true;
                clearInterval(interval);
                
            }
        }, 1000);
        
    })












    //------------------------------------------------------------------
    //
    // Handler for when the server ack's the socket connection.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    function connectPlayerSelf(data) {
        playerSelf.model.position.x = data.position.x;
        playerSelf.model.position.y = data.position.y;

        playerSelf.model.size.x = data.size.x;
        playerSelf.model.size.y = data.size.y;

        playerSelf.model.direction = data.direction;
        playerSelf.model.speed = data.speed;
        playerSelf.model.rotateRate = data.rotateRate;
    }



    //------------------------------------------------------------------
    //
    // Handler for when a new player connects to the game.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    function connectPlayerOther(data) {
        let model = components.PlayerRemote();
        model.state.position.x = data.position.x;
        model.state.position.y = data.position.y;
        model.state.direction = data.direction;
        model.state.lastUpdate = performance.now();

        model.goal.position.x = data.position.x;
        model.goal.position.y = data.position.y;
        model.goal.direction = data.direction;
        model.goal.updateWindow = 0;

        model.size.x = data.size.x;
        model.size.y = data.size.y;

        playerOthers[data.clientId] = {
            model: model,
            texture: BattleRoyal.assets['player-other']
        };
    }


    //------------------------------------------------------------------
    //
    // Handler for when another player disconnects from the game.
    //
    //------------------------------------------------------------------
    function disconnectPlayerOther(data) {
        delete playerOthers[data.clientId];
    }

  //------------------------------------------------------------------
    //
    // Handler for receiving state updates about the self player.
    //
    //------------------------------------------------------------------
    function updatePlayerSelf(data) {
        playerSelf.model.position.x = data.position.x;
        playerSelf.model.position.y = data.position.y;
        playerSelf.model.direction = data.direction;
        //
        // Remove messages from the queue up through the last one identified
        // by the server as having been processed.
        let done = false;
        while (!done && !messageHistory.empty) {
            if (messageHistory.front.id === data.lastMessageId) {
                done = true;
            }
            messageHistory.dequeue();
        }

        //
        // Update the client simulation since this last server update, by
        // replaying the remaining inputs.
        let memory = Queue.create();
        while (!messageHistory.empty) {
            let message = messageHistory.dequeue();
            memory.enqueue(message);
        }
        messageHistory = memory;
    }



    //------------------------------------------------------------------
    //
    // Handler for receiving state updates about other players.
    //
    //------------------------------------------------------------------
    function updatePlayerOther(data) {
        if (playerOthers.hasOwnProperty(data.clientId)) {
            let model = playerOthers[data.clientId].model;
            model.goal.updateWindow = data.updateWindow;

            model.goal.position.x = data.position.x;
            model.goal.position.y = data.position.y;
            model.goal.direction = data.direction;
        }
    }





    // No Missiles yet.
    //------------------------------------------------------------------
    //
    // Handler for receiving notice of a new missile in the environment.
    //
    //------------------------------------------------------------------
    // function missileNew(data) {
    //     missiles[data.id] = components.Missile({
    //         id: data.id,
    //         radius: data.radius,
    //         speed: data.speed,
    //         direction: data.direction,
    //         position: {
    //             x: data.position.x,
    //             y: data.position.y
    //         },
    //         timeRemaining: data.timeRemaining
    //     });
    // }

    //------------------------------------------------------------------
    //
    // Handler for receiving notice that a missile has hit a player.
    //
    //------------------------------------------------------------------
    // function missileHit(data) {
    //     explosions[nextExplosionId] = components.AnimatedSprite({
    //         id: nextExplosionId++,
    //         spriteSheet: MyGame.assets['explosion'],
    //         spriteSize: { width: 0.07, height: 0.07 },
    //         spriteCenter: data.position,
    //         spriteCount: 16,
    //         spriteTime: [ 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
    //     });

    //     //
    //     // When we receive a hit notification, go ahead and remove the
    //     // associated missle from the client model.
    //     delete missiles[data.missileId];
    // }














    //------------------------------------------------------------------
    //
    // Process the registered input handlers here.
    //
    //------------------------------------------------------------------
	function processInput(elapsedTime) {
        if(gameHasBegun){
            //
            // Start with the keyboard updates so those messages can get in transit
            // while the local updating of received network messages are processed.
            myKeyboard.update(elapsedTime);

            //
            // Double buffering on the queue so we don't asynchronously receive messages
            // while processing.
            let processMe = networkQueue;
            networkQueue = networkQueue = Queue.create();
            while (!processMe.empty) {
                let message = processMe.dequeue();
                switch (message.type) {
                    case NetworkIds.CONNECT_ACK:
                        connectPlayerSelf(message.data);
                        break;
                    case NetworkIds.CONNECT_OTHER:
                        connectPlayerOther(message.data);
                        break;
                    case NetworkIds.DISCONNECT_OTHER:
                        disconnectPlayerOther(message.data);
                        break;
                    case NetworkIds.UPDATE_SELF:
                        updatePlayerSelf(message.data);
                        break;
                    case NetworkIds.UPDATE_OTHER:
                        updatePlayerOther(message.data);
                        break;
                    // No missiles yet
                    // case NetworkIds.MISSILE_NEW:
                    //     missileNew(message.data);
                    //     break;
                    // case NetworkIds.MISSILE_HIT:
                    //     missileHit(message.data);
                    //     break;
                }
            }
        }
    }



    //------------------------------------------------------------------
    //
    // Update the game simulation
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        if(gameHasBegun){
            playerSelf.model.update(elapsedTime);
            for (let id in playerOthers) {
                playerOthers[id].model.update(elapsedTime);
            }

            // No missiles yet.
            // let removeMissiles = [];
            // for (let missile in missiles) {
            //     if (!missiles[missile].update(elapsedTime)) {
            //         removeMissiles.push(missiles[missile]);
            //     }
            // }
    
            // for (let missile = 0; missile < removeMissiles.length; missile++) {
            //     delete missiles[removeMissiles[missile].id];
            // }
    
            // for (let id in explosions) {
            //     if (!explosions[id].update(elapsedTime)) {
            //         delete explosions[id];
            //     }
            // }

        }
    }


	function render() {
        if(gameHasBegun){
            console.log('client is rendering');
            graphics.clear();
            renderer.Player.render(playerSelf.model, playerSelf.texture);
            for (let id in playerOthers) {
                let player = playerOthers[id];
                renderer.PlayerRemote.render(player.model, player.texture);
            }
    
            // Still no missiles
            // for (let missile in missiles) {
            //     renderer.Missile.render(missiles[missile]);
            // }
    
            // for (let id in explosions) {
            //     renderer.AnimatedSprite.render(explosions[id]);
            // }
        }
        //console.log('clientside rendering is happening');
	}


    //------------------------------------------------------------------
    //
    // Client-side game loop
    //
    //------------------------------------------------------------------
    function gameLoop(time) {
        let elapsedTime = time - lastTimeStamp;
        lastTimeStamp = time;

        processInput(elapsedTime);
        update(elapsedTime);
        render();

        requestAnimationFrame(gameLoop);
    };




	
	//------------------------------------------------------------------
	//
	// This function is used to change to a new active screen.
	//
	//------------------------------------------------------------------
	function showScreen(id) {
		let screen = 0;
		let active = null;
		//
		// Remove the active state from all screens.  There should only be one...
		active = document.getElementsByClassName('active');
		for (screen = 0; screen < active.length; screen++) {
			active[screen].classList.remove('active');
		}
		//
		// Tell the screen to start actively running
		screens[id].run(socket);
		//
		//console.log('hello' + toString(id));
		// Then, set the new screen to be active
		document.getElementById(id).classList.add('active');
	}

	//------------------------------------------------------------------
	//
	// This function performs the one-time game initialization.
	//
	//------------------------------------------------------------------
	function initialize() {
		let screen = null;
		console.log('game initializing!');
		//
		// Go through each of the screens and tell them to initialize
		for (screen in screens) {
			if (screens.hasOwnProperty(screen)) {
				screens[screen].initialize();
			}
        }
        









        myKeyboard.registerHandler(elapsedTime => {
            let message = {
                id: messageId++,
                elapsedTime: elapsedTime,
                type: NetworkIds.INPUT_MOVE
            };
            socket.emit(NetworkIds.INPUT, message);
            messageHistory.enqueue(message);
            playerSelf.model.move(elapsedTime);
        },
        BattleRoyal.input.KeyEvent.DOM_VK_W, true);

        myKeyboard.registerHandler(elapsedTime => {
            let message = {
                id: messageId++,
                elapsedTime: elapsedTime,
                type: NetworkIds.INPUT_ROTATE_RIGHT
            };
            socket.emit(NetworkIds.INPUT, message);
            messageHistory.enqueue(message);
            playerSelf.model.rotateRight(elapsedTime);
        },
        BattleRoyal.input.KeyEvent.DOM_VK_D, true);

        myKeyboard.registerHandler(elapsedTime => {
            let message = {
                id: messageId++,
                elapsedTime: elapsedTime,
                type: NetworkIds.INPUT_ROTATE_LEFT
            };
            socket.emit(NetworkIds.INPUT, message);
            messageHistory.enqueue(message);
            playerSelf.model.rotateLeft(elapsedTime);
        },
        BattleRoyal.input.KeyEvent.DOM_VK_A, true);

        // No missile or spacebar functionality yet
        // myKeyboard.registerHandler(elapsedTime => {
        //     let message = {
        //         id: messageId++,
        //         elapsedTime: elapsedTime,
        //         type: NetworkIds.INPUT_FIRE
        //     };
        //     socket.emit(NetworkIds.INPUT, message);
        // },
        // BattleRoyal.input.KeyEvent.DOM_VK_SPACE, false);









		
		//
		// Make the main-menu screen the active one
		showScreen('main-menu');
		requestAnimationFrame(gameLoop);
	}











	
	
	return {
		initialize : initialize,
		showScreen : showScreen
	};
}(BattleRoyal.screens, BattleRoyal.components, BattleRoyal.graphics, BattleRoyal.renderer, BattleRoyal.input));
