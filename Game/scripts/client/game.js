//------------------------------------------------------------------
//
// This function provides the "game" code.
//
//------------------------------------------------------------------
MyGame.main = (function(graphics, renderer, input, components) {
    'use strict';

    let lastTimeStamp = performance.now(),
        myKeyboard = input.Keyboard(),
        myMouse = input.Mouse(),
        map = Map.create(),
        smallMap = SmallMap.create();
    map.setMap(smallMap.data);
    let playerSelf = {
            model: components.Player(map),
            texture: MyGame.assets['player-self']
        },
        fov = components.FOV(),
        playerOthers = {},
        missiles = {},
        explosions = {},
        messageHistory = Queue.create(),
        messageId = 1,
        nextExplosionId = 1,
        viewPort = graphics.viewPort,
        socket = io(),
        networkQueue = Queue.create();

        // viewPort.mapWidth = map.mapWidth;
        // viewPort.mapHeight = map.mapHeight;

    
    socket.on(NetworkIds.CONNECT_ACK, data => {
        networkQueue.enqueue({
            type: NetworkIds.CONNECT_ACK,
            data: data
        });
    });

    socket.on(NetworkIds.CONNECT_OTHER, data => {
        networkQueue.enqueue({
            type: NetworkIds.CONNECT_OTHER,
            data: data
        });
    });

    socket.on(NetworkIds.DISCONNECT_OTHER, data => {
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

    socket.on(NetworkIds.MISSILE_NEW, data => {
        networkQueue.enqueue({
            type: NetworkIds.MISSILE_NEW,
            data: data
        });
    });

    socket.on(NetworkIds.MISSILE_HIT, data => {
        networkQueue.enqueue({
            type: NetworkIds.MISSILE_HIT,
            data: data
        });
    });
    //------------------------------------------------------------------
    //
    // Handler for when the server ack's the socket connection.  We receive
    // the state of the newly connected player model.
    //
    //------------------------------------------------------------------
    function connectPlayerSelf(data) {

        playerSelf.model.worldCordinates = data.worldCordinates;

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
        model.state.worldCordinates.x = data.worldCordinates.x;
        model.state.worldCordinates.y = data.worldCordinates.y;
        model.state.direction = data.direction;
        model.state.lastUpdate = performance.now();

        model.goal.worldCordinates.x = data.worldCordinates.x;
        model.goal.worldCordinates.y = data.worldCordinates.y;
        model.goal.direction = data.direction;
        model.goal.updateWindow = 21;

        model.size.x = data.size.x;
        model.size.y = data.size.y;

        playerOthers[data.clientId] = {
            model: model,
            texture: MyGame.assets['player-other']
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
        
        playerSelf.model.direction = data.direction;
        playerSelf.model.worldCordinates.x = data.worldCordinates.x;
        playerSelf.model.worldCordinates.y = data.worldCordinates.y;
        playerSelf.model.speed = data.speed;

        playerSelf.model.score = data.score;
        playerSelf.model.life_remaining = data.life_remaining;
        playerSelf.is_alive = data.is_alive;

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

            model.goal.worldCordinates.x = data.worldCordinates.x;
            model.goal.worldCordinates.y = data.worldCordinates.y;
            model.goal.direction = data.direction;
        }
    }

    //------------------------------------------------------------------
    //
    // Handler for receiving notice of a new missile in the environment.
    //
    //------------------------------------------------------------------
    function missileNew(data) {
        missiles[data.id] = components.Missile({
            id: data.id,
            radius: data.radius,
            speed: data.speed,
            direction: data.direction,
            worldCordinates: {
                x: data.worldCordinates.x,
                y: data.worldCordinates.y
            },
            timeRemaining: data.timeRemaining
        });
    }

    //------------------------------------------------------------------
    //
    // Handler for receiving notice that a missile has hit a player.
    //
    //------------------------------------------------------------------
    function missileHit(data) {
        // data is the hits array
        explosions[nextExplosionId] = components.AnimatedSprite({
            id: nextExplosionId++,
            spriteSheet: MyGame.assets['explosion'],
            spriteSize: { width: 0.07, height: 0.07 },
            spriteCenter: data.hit_location,
            spriteCount: 16,
            spriteTime: [ 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
        });

        //
        // When we receive a hit notification, go ahead and remove the
        // associated missle from the client model.
        delete missiles[data.missileId];
    }

    //------------------------------------------------------------------
    //
    // Process the registered input handlers here.
    //
    //------------------------------------------------------------------
    function processInput(elapsedTime) {
        //
        // Start with the keyboard updates so those messages can get in transit
        // while the local updating of received network messages are processed.
        myKeyboard.update(elapsedTime);
        myMouse.update(elapsedTime);

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
                case NetworkIds.MISSILE_NEW:
                    console.log('My Score is: ', 
                    playerSelf.model.score, ' My Life is at: ', playerSelf.model.life_remaining);
                    missileNew(message.data);
                    break;
                case NetworkIds.MISSILE_HIT:
                    missileHit(message.data);
                    break;
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Update the game simulation
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        viewPort.update(graphics, playerSelf.model.worldCordinates);
        playerSelf.model.update(elapsedTime, viewPort);
        fov.update(playerSelf.model);
        for (let id in playerOthers) {
            playerOthers[id].model.update(elapsedTime, viewPort);
        }

        let removeMissiles = [];
        for (let missile in missiles) {
            if (!missiles[missile].update(elapsedTime, viewPort)) {
                removeMissiles.push(missiles[missile]);
            }
        }

        for (let missile = 0; missile < removeMissiles.length; missile++) {
            delete missiles[removeMissiles[missile].id];
        }

        for (let id in explosions) {
            if (!explosions[id].update(elapsedTime, viewPort)) {
                delete explosions[id];
            }
        }
        // graphics.updateCanvas();
    }

    //------------------------------------------------------------------
    //
    // Render the current state of the game simulation
    //
    //------------------------------------------------------------------
    function render() {
        graphics.clear();
        renderer.ViewPortal.render();
        renderer.FOV.render(fov);
        renderer.Player.render(playerSelf.model, playerSelf.texture);
        for (let id in playerOthers) {
            let player = playerOthers[id];
            renderer.PlayerRemote.render(player.model, player.texture);
        }

        for (let missile in missiles) {
            renderer.Missile.render(missiles[missile]);
        }

        for (let id in explosions) {
            renderer.AnimatedSprite.render(explosions[id]);
        }
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
    // Public function used to get the game initialized and then up
    // and running.
    //
    //------------------------------------------------------------------
    function initialize() {
        console.log('game initializing...');

        //
        // Create the keyboard input handler and register the keyboard commands
        //  based on the configurations specified in the options menu (or default).

        myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: NetworkIds.INPUT_MOVE_UP
                };
                socket.emit(NetworkIds.INPUT, message);
                messageHistory.enqueue(message);
                playerSelf.model.moveUp(elapsedTime);
            },
            input.KeyEvent.moveUp, true);

        myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: NetworkIds.INPUT_MOVE_RIGHT
                };
                socket.emit(NetworkIds.INPUT, message);
                messageHistory.enqueue(message);
                playerSelf.model.moveRight(elapsedTime);
            },
            input.KeyEvent.moveRight, true);

        myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: NetworkIds.INPUT_MOVE_LEFT
                };
                socket.emit(NetworkIds.INPUT, message);
                messageHistory.enqueue(message);
                playerSelf.model.moveLeft(elapsedTime);
            },
            input.KeyEvent.moveLeft, true);

        myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: NetworkIds.INPUT_MOVE_DOWN
                };
                socket.emit(NetworkIds.INPUT, message);
                messageHistory.enqueue(message);
                playerSelf.model.moveDown(elapsedTime);
            },
            input.KeyEvent.moveDown, true);

        myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: NetworkIds.INPUT_FIRE
                };
                socket.emit(NetworkIds.INPUT, message);
            },
            input.KeyEvent.rapidFire, true, 100);

        myKeyboard.registerHandler(fov.widen, input.KeyEvent.shortenFOV, true);
        myKeyboard.registerHandler(fov.thin, input.KeyEvent.extendFOV, true);
        //TODO: are we letting the user exit anytime during the game?
        myKeyboard.registerHandler(function(){console.log('exit game')}, input.KeyEvent.DOM_VK_ESCAPE, true);

        myMouse.registerHandler('mousedown', elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: NetworkIds.INPUT_FIRE
                };
                socket.emit(NetworkIds.INPUT, message);
            });

        myMouse.registerHandler('mousemove', function(e) {
            let mouseWC = playerSelf.model.worldCordinatesFromMouse(e.clientX - 20, e.clientY - 20, viewPort);
            let message = {
                id: messageId++,
                viewPort: viewPort,
                x: mouseWC.x,
                y: mouseWC.y,
                type: NetworkIds.MOUSE_MOVE
            };
            socket.emit(NetworkIds.INPUT, message);
            playerSelf.model.changeDirection(mouseWC.x, mouseWC.y, viewPort);
        });

        //
        // Get the game loop started
        graphics.updateCanvas();
        requestAnimationFrame(gameLoop);
    }

    return {
        initialize: initialize,
        map: map,
        socket: socket
    };
 
}(MyGame.graphics, MyGame.renderer, MyGame.input, MyGame.components));
