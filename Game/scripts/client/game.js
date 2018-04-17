//------------------------------------------------------------------
//
// This function provides the "game" code.
//
//------------------------------------------------------------------
MyGame.main = (function(graphics, renderer, input, components, particles) {
    'use strict';

    let lastTimeStamp = performance.now(),
        myKeyboard = input.Keyboard(),
        myMouse = input.Mouse(),
        map = Map.create(),
        // smallMap = SmallMap.create();
        mediumMap = MediumMap.create();
        map.setMap(mediumMap.data);

    let shield = {
        center: {x: 0, y: 0},
        radius: 0,
        worldCordinates: {x: 0, y: 0},
        nextRadius: 0,
        nextWorldCordinates: {x: 0, y: 0},
        position: {}
    };
    let DISTANCE_TO_DETECT_PARTICLES = 400;

    let powerUptextures = {
        weapon: MyGame.assets['weapon'],
        fire_rate: MyGame.assets['fire-rate'],
        fire_range: MyGame.assets['fire-range'],
        health: MyGame.assets['health'],
        ammo: MyGame.assets['ammo'],      
    };

    let sounds = {
        gunshot: MyGame.assets['gunshot'],
        hit:  MyGame.assets['hit'],
        die: MyGame.assets['die'],
        emptyfire: MyGame.assets['emptyfire'],
        rapidFire: MyGame.assets['rapidFire'] 
    }
    sounds.hit.volume = 0.5;
    let killer_and_killed = {
        killer: '',
        killed: '',
    };
    let killStatsArray = [];
    let killStat = {};
    let killWasUpdated = false;
    let killDisplayTime = 0;
    //killer_and_killed[0] = 'banina';
    //killer_and_killed[1] = 'fofina';
    let myModel = components.Player(map);
    let playerSelf = {
            model: myModel,
            texture: components.AnimatedSprite({
                spriteSheet: MyGame.assets['clientIdleNoGun'],
                spriteSize: { width: 0.07, height: 0.07 },
                spriteCenter: {
                    x: 0.5,
                    y: 0.5,
                },
                spriteCount: 20,
                spriteTime: [60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60]
            })
        },
        miniMap = {
            model: components.MiniMap(),
            mapTexture: MyGame.assets['miniMapMedium'],
            playerTexture: MyGame.assets['playerIcon']
        },
        mapIconTexture = MyGame.assets['mapIcons'],
        fov = components.FOV(),
        playerOthers = {},
        missiles = {},
        powerUps = [],
        printPowerUps = [],
        explosions = {},
        messageHistory = Queue.create(),
        messageId = 1,
        nextExplosionId = 1,
        viewPort = graphics.viewPort,
        socket = io(),
        networkQueue = Queue.create();

    let rapidUpdate = 0;
    let rapidSound = false;
        
    socket.on(NetworkIds.POWER_UP_LOC, data => {
        networkQueue.enqueue({
            type: NetworkIds.POWER_UP_LOC,
            data: data
        });
    });

        
    socket.on(NetworkIds.SHIELD_MOVE, data => {
        networkQueue.enqueue({
            type: NetworkIds.SHIELD_MOVE,
            data: data
        });
    });

    
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
        model.is_alive = true;

        model.size.x = data.size.x;
        model.size.y = data.size.y;

        playerOthers[data.clientId] = {
            model: model,
            texture: components.AnimatedSprite({
                spriteSheet: MyGame.assets['enemyIdleNoGun'],
                spriteSize: { width: 0.07, height: 0.07},
                spriteCenter: {
                    x: model.state.worldCordinates.x,
                    y: model.state.worldCordinates.y
                },
                spriteCount: 20,
                spriteTime: [ 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60]
            })
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
        playerSelf.model.isSprinting = data.isSprinting;
        playerSelf.model.sprintEnergy = data.sprintEnergy;
        playerSelf.model.SPRINT_FACTOR = data.SPRINT_FACTOR;
        playerSelf.model.SPRINT_DECREASE_RATE = data.SPRINT_DECREASE_RATE;
        playerSelf.model.SPRINT_RECOVERY_RATE = data.SPRINT_RECOVERY_RATE;
        playerSelf.hasBullets = data.hasBullets;

        playerSelf.model.kills = data.kills;
        playerSelf.model.killer = data.killer;





        playerSelf.model.userName = data.userName;
        playerSelf.hasRapidFire = data.hasRapidFire;

        if (!playerSelf.hasWeapon && data.hasWeapon){
            playerSelf.texture.spriteSheet = MyGame.assets['clientIdleGun']
        }

        playerSelf.model.hasWeapon = data.hasWeapon;
        playerSelf.model.score = data.score;
        playerSelf.model.life_remaining = data.life_remaining;
        if (playerSelf.is_alive && !data.is_alive){
            sounds.die.play();
        }
        playerSelf.is_alive = data.is_alive;
        playerSelf.texture.worldCordinates.x = data.worldCordinates.x;
        playerSelf.texture.worldCordinates.y = data.worldCordinates.y;

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
            // console.log('-----> ',message.type,' <-----');
            switch (message.type) {
                case 'move-up':
                    playerSelf.model.moveUp(message.elapsedTime);
                    break;
                case 'move-left':
                    playerSelf.model.moveLeft(message.elapsedTime);
                    break;
                case 'move-right':
                    playerSelf.model.moveRight(message.elapsedTime);
                    break;
                case 'move-down':
                    playerSelf.model.moveDown(message.elapsedTime);
                    break;
                    
            }
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

            //If the status of is_alive changed, they died.
            if (model.is_alive !== data.is_alive){
                console.log(model.is_alive, data.is_alive);
                particles.playerDied(data.worldCordinates, data.direction, viewPort.center, DISTANCE_TO_DETECT_PARTICLES);
            }
            model.kills = data.kills;
            model.killer = data.killer;

            model.goal.worldCordinates.x = data.worldCordinates.x;
            model.goal.worldCordinates.y = data.worldCordinates.y;
            model.goal.direction = data.direction;
            if (!model.hasWeapon && data.hasWeapon){
                //change the image
                playerOthers[data.clientId].texture.spriteSheet = MyGame.assets['enemyIdleGun'];
            }
            model.hasWeapon = data.hasWeapon;

            if (playerOthers[data.clientId].is_alive && !data.is_alive){
                sounds.die.play();
            }
            playerOthers[data.clientId].is_alive = data.is_alive;
            model.is_alive = data.is_alive;
            model.userName = data.userName;
            //console.log(data.is_alive);

            if(!model.is_alive && model.wasNewlyKilled){
                model.wasNewlyKilled = false;

                let tempKillStat = Object.create(killer_and_killed);
                tempKillStat.killer = model.userName;
                //console.log(model.userName);
                tempKillStat.killed = model.killer;
                killStatsArray.push(tempKillStat);
                
            }
        }


        //console.log(data.is_alive);
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

        particles.shotSmoke(data.worldCordinates, data.direction, viewPort.center, DISTANCE_TO_DETECT_PARTICLES);        
        //only play this sound if it is within a certain distance of me. So gunshots from other players can be heard, if they are less than 1000 units away from me.
        //This allows the user to hear gunshots that are slightly outside of his viewing window.
        if (inRange(data.worldCordinates,playerSelf.model.worldCordinates) && rapidSound){
            //I think I only want to restart the sound every x miliseconds
            sounds.gunshot.pause();
            sounds.gunshot.currentTime = 0;
            sounds.gunshot.play();
        }
        else if (inRange(data.worldCordinates,playerSelf.model.worldCordinates)){
            sounds.gunshot.play();
        }
    }

    //------------------------------------------------------------------
    //
    // Handler for receiving notice that a missile has hit a player.
    //
    //------------------------------------------------------------------
    function missileHit(data) {
        // data is the hits array
        //Only animate the blood if they are still alive.
        if (playerSelf.is_alive){
            explosions[nextExplosionId] = components.AnimatedSprite({
                id: nextExplosionId++,
                spriteSheet: MyGame.assets['bloodsplosion'],
                spriteSize: { width: 0.035, height: 0.035 },
                spriteCenter: data.hit_location,
                spriteCount: 6,
                spriteTime: [ 80, 55, 30, 30, 30, 2000]
            });
            particles.enemyHit(data.hit_location, viewPort.center, DISTANCE_TO_DETECT_PARTICLES);
        }else{
            particles.playerSelfDied(data.hit_location, playerSelf.model.direction, viewPort.center, DISTANCE_TO_DETECT_PARTICLES);
        }
        //
        // explosions[nextExplosionId] = components.AnimatedSprite({
        //     id: nextExplosionId++,
        //     spriteSheet: MyGame.assets['explosion'],
        //     spriteSize: { width: 0.07, height: 0.07 },
        //     spriteCenter: data.hit_location,
        //     spriteCount: 16,
        //     spriteTime: [ 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
        // });
        if (inRange(data.hit_location,playerSelf.model.worldCordinates)){
            sounds.hit.pause();
            sounds.hit.currentTime = 0;
            sounds.hit.play();
        }


        // When we receive a hit notification, go ahead and remove the
        // associated missle from the client model.
        delete missiles[data.missileId];
    }

    function powerUpdate(data){
        // If I created an array of all the datas that were coming into here,
        // and rendered them, and then deleted them, that could work.
        //console.log(data.type);
        let tempPowerUp = components.PowerUp({
            worldCordinates: data.worldCordinates,
            type: data.type,
            radius: data.radius
        });
        powerUps[data.indexId] = tempPowerUp;

    };

    function shieldUpdate(data){
        let r = data.radius/(viewPort.width*2);
        shield.nextRadius = data.nextRadius;
        shield.nextWorldCordinates = data.nextWorldCordinates;
        shield.timeTilNextShield = data.timeTilNextShield;
        shield.center.x = .5 - (viewPort.center.x - data.worldCordinates.x)/viewPort.width;
        shield.center.y = .5 - (viewPort.center.y - data.worldCordinates.y)/viewPort.height;
        if (data.radius < 3*map.mapWidth){
            particles.shieldSparks(data.worldCordinates, data.radius, 100, viewPort.center, DISTANCE_TO_DETECT_PARTICLES);
        }
        shield.radius = r;
    };

    //------------------------------------------------------------------
    //
    // Process the registered input handlers here.
    //
    //------------------------------------------------------------------
    function processInput(elapsedTime) {
        //powerUps.length = 0;
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
                    //console.log('I am: ',playerSelf.model.userName,' My Score is: ', 
                    //playerSelf.model.score, ' My Life is at: ', playerSelf.model.life_remaining);
                    missileNew(message.data);
                    break;
                case NetworkIds.MISSILE_HIT:
                    missileHit(message.data);
                    break;
                case NetworkIds.POWER_UP_LOC:
                    powerUpdate(message.data);
                    break;
                case NetworkIds.SHIELD_MOVE:
                    shieldUpdate(message.data);
                    break;
            }
        }
    }

    //deal with sounds for firing weapon
    function weaponSound(){
        if (playerSelf != null && playerSelf.model.hasWeapon && playerSelf.hasBullets){
            sounds.gunshot.pause();
            sounds.gunshot.currentTime = 0;
            sounds.gunshot.play();
        } 
        else if (playerSelf != null && playerSelf.model.hasWeapon && !playerSelf.hasBullets) {
            sounds.emptyfire.pause();
            sounds.emptyfire.currentTime = 0;
            sounds.emptyfire.play();
        }
    }

    //determine if a shot is within range 1000 in canvas coordinates?
    function inRange(fireLocation,characterLocation){
        var dist = Math.sqrt(Math.pow((fireLocation.x-characterLocation.x),2) + Math.pow((fireLocation.y-characterLocation.y),2))
        return dist <= 1000;
    }

    //------------------------------------------------------------------
    //
    // Update the game simulation
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        particles.update(elapsedTime);
        
        viewPort.update(graphics, playerSelf.model.worldCordinates);
        playerSelf.model.update(elapsedTime, viewPort);
        playerSelf.texture.worldCordinates.x = playerSelf.model.worldCordinates.x;
        playerSelf.texture.worldCordinates.y = playerSelf.model.worldCordinates.y;
        playerSelf.texture.update(elapsedTime,viewPort);
        fov.update(playerSelf.model);
        miniMap.model.update(playerSelf.model, null, viewPort);
        for (let id in playerOthers) {
            playerOthers[id].model.update(elapsedTime, viewPort);
            playerOthers[id].texture.worldCordinates.x = playerOthers[id].model.state.worldCordinates.x;
            playerOthers[id].texture.worldCordinates.y = playerOthers[id].model.state.worldCordinates.y;
            playerOthers[id].texture.update(elapsedTime,viewPort);
        }

        rapidUpdate += elapsedTime;
        if (rapidUpdate > 30){
            rapidSound = true;
            rapidUpdate -= 30;
        }
        else {
            rapidSound = false;
        }

        let removeMissiles = [];
        for (let missile in missiles) {
            if (!map.isValid(missiles[missile].worldCordinates.y, missiles[missile].worldCordinates.x)){
                removeMissiles.push(missiles[missile]);
                particles.hitBuilding(missiles[missile].worldCordinates, viewPort.center, DISTANCE_TO_DETECT_PARTICLES);                
            }
            else if (!missiles[missile].update(elapsedTime, viewPort)) {
                removeMissiles.push(missiles[missile]);
            }
        }

        for(let power = 0; power<powerUps.length; power++){
            powerUps[power].update(elapsedTime, viewPort);
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
    function render(elapsedTime) {
        if(killDisplayTime <= 0){
            if(killStatsArray.length != 0){
                // someone died!
                killStat = killStatsArray.pop();
                killDisplayTime = 3;
            }
        }
        //console.log(killStat);
        killDisplayTime = killDisplayTime - (elapsedTime/1000);

        graphics.clear();
        renderer.ViewPortal.render();
        renderer.FOV.render(fov);
        renderer.Player.render(playerSelf.model,playerSelf.texture, killStat, killDisplayTime);
        for (let id in playerOthers) {
            let player = playerOthers[id];
            //console.log(player.model.is_alive);
            if(player.model.is_alive){
                renderer.PlayerRemote.render(player.model, player.texture);
                continue;
            }
        }
        
        for(let power = 0; power<powerUps.length; power++){
            //console.log(powerUps[power].type);
            renderer.PowerUp.render(powerUps[power],MyGame.assets[powerUps[power].type]);
        }
        //powerUps.length = 0;
        
        for (let missile in missiles) {
            renderer.Missile.render(missiles[missile],playerSelf.texture);
        }
        
        for (let id in explosions) {
            renderer.AnimatedSprite.render(explosions[id]);
        }
        graphics.drawShield(shield.center, shield.radius, 'rgba(0,0,50,.5)');
        particles.render(viewPort);
        renderer.MiniMap.render(miniMap.model, miniMap.mapTexture, miniMap.playerTexture, mapIconTexture);
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
        render(elapsedTime);

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
                    type: NetworkIds.INPUT_RAPIDFIRE
                };
                socket.emit(NetworkIds.INPUT, message);
                if (playerSelf.hasRapidFire && !playerSelf.hasBullets){
                    weaponSound();
                }
            },
            input.KeyEvent.rapidFire, true, 80);

        myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: NetworkIds.INPUT_FIRE
                };
                socket.emit(NetworkIds.INPUT, message);
                weaponSound();
            },
            input.KeyEvent.fire, false);

        myKeyboard.registerHandler(elapsedTime => {
                let message = {
                    id: messageId++,
                    elapsedTime: elapsedTime,
                    type: NetworkIds.INPUT_SPRINT
                };
                socket.emit(NetworkIds.INPUT, message);
            },
            input.KeyEvent.sprint, true);

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
                weaponSound();
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
 
}(MyGame.graphics, MyGame.renderer, MyGame.input, MyGame.components, MyGame.particleSystem));
