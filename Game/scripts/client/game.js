BattleRoyal.game = (function(screens,components) {
	'use strict';


	let lastTimeStamp = performance.now();
	let playerSelf = {
		model: components.Player(),
		};
	let playerOthers = {};
	let messageHistory = Queue.create();
	let messageId = 1;
	let socket = io();
	let networkQueue = Queue.create();
    let validUsers = null;





	// We are going to throw all of the network messages into a network queue


	socket.on(NetworkIds.CONNECT_ACK, data => {
		console.log('I CONNECTED', socket.id);
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

    socket.on(NetworkIds.VALID_USERS, data =>{
        validUsers = JSON.parse(data);
    });

    //------------------------------------------------------------------
    //
    // Handler for when the server ack's the socket connection.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    function connectPlayerSelf(data) {
        playerSelf.model.position.x = data.position.x;
        playerSelf.model.position.y = data.position.y;
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

        model.state.lastUpdate = performance.now();

        model.goal.position.x = data.position.x;
        model.goal.position.y = data.position.y;

        playerOthers[data.clientId] = {
            model: model
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
            model.goal.position.y = data.position.y
        }
    }

    function requestValidUsers(){
        socket.emit(NetworkIds.VALID_USERS, null);
    }

    function getValidUsers(){
        return validUsers;
    }

    function requestCreateUser(data){
        //request the creation of a new user
        socket.emit(NetworkIds.CREATE_NEW_USER,data);
    }



	function processInput(elapsedTime) {
        //
        // Start with the keyboard updates so those messages can get in transit
        // while the local updating of received network messages are processed.
        //myKeyboard.update(elapsedTime);

        //
        // Double buffering on the queue so we don't asynchronously receive messages
        // while processing.
        // let processMe = networkQueue;
        // networkQueue = networkQueue = Queue.create();
        // while (!processMe.empty) {
        //     let message = processMe.dequeue();
        //     switch (message.type) {
        //         case NetworkIds.CONNECT_ACK:
        //             connectPlayerSelf(message.data);
        //             break;
        //         case NetworkIds.CONNECT_OTHER:
        //             connectPlayerOther(message.data);
        //             break;
        //         case NetworkIds.DISCONNECT_OTHER:
        //             disconnectPlayerOther(message.data);
        //             break;
        //         case NetworkIds.UPDATE_SELF:
        //             updatePlayerSelf(message.data);
        //             break;
        //         case NetworkIds.UPDATE_OTHER:
        //             updatePlayerOther(message.data);
        //             break;
        //     }
        // }
    }



    //------------------------------------------------------------------
    //
    // Update the game simulation
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        playerSelf.model.update(elapsedTime);
        for (let id in playerOthers) {
            playerOthers[id].model.update(elapsedTime);
        }

    }


	function render() {

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
		screens[id].run();
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
		
		//
		// Make the main-menu screen the active one
		showScreen('main-menu');
		requestAnimationFrame(gameLoop);
	}


































	
	
	return {
		initialize : initialize,
        showScreen : showScreen,
        getValidUsers: getValidUsers,
        requestValidUsers: requestValidUsers,
	};
}(BattleRoyal.screens, BattleRoyal.components));
