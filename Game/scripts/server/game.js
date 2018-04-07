// ------------------------------------------------------------------
//
// Nodejs module that provides the server-side game model.
//
// ------------------------------------------------------------------
'use strict';

let present = require('present');
let Player = require('./player');
let Missile = require('./missile');
let NetworkIds = require('../shared/network-ids');
let Queue = require('../shared/queue.js');
let mapLogic = require('../shared/map');
let mapFile = require('../shared/maps/SmallMap');
let CryptoJS = require('crypto-js');
let fs = require('fs');

const SIMULATION_UPDATE_RATE_MS = 50;
const STATE_UPDATE_RATE_MS = 20;
let lastUpdate = 0;
let quit = false;
let activeClients = {};
let newMissiles = [];
let activeMissiles = [];
let hits = [];
let inputQueue = Queue.create();
let nextMissileId = 1;
let map = mapLogic.create();
map.setMap(mapFile);
let salt = 'xnBZngGg*+FhQz??V6FMjfd9G4m5w^z8P*6';

//------------------------------------------------------------------
//
// Used to create a missile in response to user input.
//
//------------------------------------------------------------------
function createMissile(clientId, playerModel) {
    let missile = Missile.create({
        id: nextMissileId++,
        clientId: clientId,
        worldCordinates: {
            x: playerModel.worldCordinates.x,
            y: playerModel.worldCordinates.y
        },
        direction: playerModel.direction,
        speed: playerModel.speed
    });

    newMissiles.push(missile);
}

//------------------------------------------------------------------
//
// Process the network inputs we have received since the last time
// the game loop was processed.
//
//------------------------------------------------------------------
function processInput(elapsedTime) {
    //
    // Double buffering on the queue so we don't asynchronously receive inputs
    // while processing.
    let processMe = inputQueue;
    inputQueue = Queue.create();

    while (!processMe.empty) {
        let input = processMe.dequeue();
        let client = activeClients[input.clientId];
        client.lastMessageId = input.message.id;
        switch (input.message.type) {
            case NetworkIds.INPUT_MOVE_UP:
                client.player.moveUp(input.message.elapsedTime);
                break;
            case NetworkIds.INPUT_MOVE_LEFT:
                client.player.moveLeft(input.message.elapsedTime);
                break;
            case NetworkIds.INPUT_MOVE_RIGHT:
                client.player.moveRight(input.message.elapsedTime);
                break;
            case NetworkIds.INPUT_MOVE_DOWN:
                client.player.moveDown(input.message.elapsedTime);
                break;
            case NetworkIds.INPUT_ROTATE_LEFT:
                client.player.rotateLeft(input.message.elapsedTime);
                break;
            case NetworkIds.INPUT_ROTATE_RIGHT:
                client.player.rotateRight(input.message.elapsedTime);
                break;
            case NetworkIds.INPUT_FIRE:
                createMissile(input.clientId, client.player);
                break;
        }
    }
}

//------------------------------------------------------------------
//
// Utility function to perform a hit test between two objects.  The
// objects must have a position: { x: , y: } property and radius property.
//
//------------------------------------------------------------------
function collided(obj1, obj2) {
    let distance = Math.sqrt(Math.pow(obj1.worldCordinates.x - obj2.worldCordinates.x, 2) 
    + Math.pow(obj1.worldCordinates.y - obj2.worldCordinates.y, 2));
    let radii = obj1.radius + obj2.radius;
    console.log('carnage is being detected -->',distance, ' sum:' ,radii);

    return distance <= radii;
}

//------------------------------------------------------------------
//
// Update the simulation of the game.
//
//------------------------------------------------------------------
function update(elapsedTime, currentTime) {
    for (let clientId in activeClients) {
        activeClients[clientId].player.update(currentTime);
    }

    for (let missile = 0; missile < newMissiles.length; missile++) {
        newMissiles[missile].update(elapsedTime);
    }

    let keepMissiles = [];
    for (let missile = 0; missile < activeMissiles.length; missile++) {
        //
        // If update returns false, that means the missile lifetime ended and
        // we don't keep it around any longer.
        if (activeMissiles[missile].update(elapsedTime)) {
            keepMissiles.push(activeMissiles[missile]);
        }
    }
    activeMissiles = keepMissiles;

    //
    // Check to see if any missiles collide with any players (no friendly fire)
    keepMissiles = [];
    for (let missile = 0; missile < activeMissiles.length; missile++) {
        let hit = false;
        for (let clientId in activeClients) {
            //
            // Don't allow a missile to hit the player it was fired from.
            if (clientId !== activeMissiles[missile].clientId) {
                if (collided(activeMissiles[missile], activeClients[clientId].player)) {
                   
                    hit = true;
                    hits.push({
                        clientId: clientId,
                        missileId: activeMissiles[missile].id,
                        //position: activeClients[clientId].player.position
                    });
                }
            }
        }
        if (!hit) {
            keepMissiles.push(activeMissiles[missile]);
        }
    }
    activeMissiles = keepMissiles;
}

//------------------------------------------------------------------
//
// Send state of the game to any connected clients.
//
//------------------------------------------------------------------
function updateClients(elapsedTime) {
    //
    // For demonstration purposes, network updates run at a slower rate than
    // the game simulation.
    lastUpdate += elapsedTime;
    if (lastUpdate < STATE_UPDATE_RATE_MS) {
        return;
    }

    //
    // Build the missile messages one time, then reuse inside the loop
    let missileMessages = [];
    for (let item = 0; item < newMissiles.length; item++) {
        let missile = newMissiles[item];
        missileMessages.push({
            id: missile.id,
            direction: missile.direction,
            worldCordinates: {
                x: missile.worldCordinates.x,
                y: missile.worldCordinates.y
            },
            radius: missile.radius,
            speed: missile.speed,
            timeRemaining: missile.timeRemaining
        });
    }

    //
    // Move all the new missiles over to the active missiles array
    for (let missile = 0; missile < newMissiles.length; missile++) {
        activeMissiles.push(newMissiles[missile]);
    }
    newMissiles.length = 0;

    for (let clientId in activeClients) {
        let client = activeClients[clientId];
        let update = {
            clientId: clientId,
            lastMessageId: client.lastMessageId,
            direction: client.player.direction,
            worldCordinates: client.player.worldCordinates,
            speed: client.player.speed,
            updateWindow: lastUpdate
        };
        if (client.player.reportUpdate) {
            client.socket.emit(NetworkIds.UPDATE_SELF, update);

            //
            // Notify all other connected clients about every
            // other connected client status...but only if they are updated.
            for (let otherId in activeClients) {
                if (otherId !== clientId) {
                    activeClients[otherId].socket.emit(NetworkIds.UPDATE_OTHER, update);
                }
            }
        }

        //
        // Report any new missiles to the active clients
        for (let missile = 0; missile < missileMessages.length; missile++) {
            client.socket.emit(NetworkIds.MISSILE_NEW, missileMessages[missile]);
        }

        //
        // Report any missile hits to this client
        for (let hit = 0; hit < hits.length; hit++) {
            client.socket.emit(NetworkIds.MISSILE_HIT, hits[hit]);
        }
    }

    for (let clientId in activeClients) {
        activeClients[clientId].player.reportUpdate = false;
    }

    //
    // Don't need these anymore, clean up
    hits.length = 0;
    //
    // Reset the elapsedt time since last update so we can know
    // when to put out the next update.
    lastUpdate = 0;
}

//------------------------------------------------------------------
//
// Server side game loop
//
//------------------------------------------------------------------
function gameLoop(currentTime, elapsedTime) {
    processInput(elapsedTime);
    update(elapsedTime, currentTime);
    updateClients(elapsedTime);

    if (!quit) {
        setTimeout(() => {
            let now = present();
            gameLoop(now, now - currentTime);
        }, SIMULATION_UPDATE_RATE_MS);
    }
}

//------------------------------------------------------------------
//
// Get the socket.io server up and running so it can begin
// collecting inputs from the connected clients.
//
//------------------------------------------------------------------
function initializeSocketIO(httpServer) {
    let io = require('socket.io')(httpServer);

    //------------------------------------------------------------------
    //
    // Notifies the already connected clients about the arrival of this
    // new client.  Plus, tell the newly connected client about the
    // other players already connected.
    //
    //------------------------------------------------------------------
    function notifyConnect(socket, newPlayer) {
        for (let clientId in activeClients) {
            let client = activeClients[clientId];
            if (newPlayer.clientId !== clientId) {
                //
                // Tell existing about the newly connected player
                client.socket.emit(NetworkIds.CONNECT_OTHER, {
                    clientId: newPlayer.clientId,
                    direction: newPlayer.direction,
                    worldCordinates: newPlayer.worldCordinates,
                    rotateRate: newPlayer.rotateRate,
                    speed: newPlayer.speed,
                    size: newPlayer.size
                });

                //
                // Tell the new player about the already connected player
                socket.emit(NetworkIds.CONNECT_OTHER, {
                    clientId: client.player.clientId,
                    direction: client.player.direction,
                    worldCordinates: client.player.worldCordinates,
                    rotateRate: client.player.rotateRate,
                    speed: client.player.speed,
                    size: client.player.size
                });
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Notifies the already connected clients about the disconnect of
    // another client.
    //
    //------------------------------------------------------------------
    function notifyDisconnect(playerId) {
        for (let clientId in activeClients) {
            let client = activeClients[clientId];
            if (playerId !== clientId) {
                client.socket.emit(NetworkIds.DISCONNECT_OTHER, {
                    clientId: playerId
                });
            }
        }
    }
    
    let users = [];
    let minChatterSizeHasBeenReached = false;
    io.on('connection', function(socket) {
        console.log('Connection established: ', socket.id);
        //
        // Create an entry in our list of connected clients
        let newPlayer = Player.create(map);
        newPlayer.clientId = socket.id;
        activeClients[socket.id] = {
            socket: socket,
            player: newPlayer
        };
        socket.emit(NetworkIds.CONNECT_ACK, {
            direction: newPlayer.direction,
            worldCordinates: newPlayer.worldCordinates,
            size: newPlayer.size,
            rotateRate: newPlayer.rotateRate,
            speed: newPlayer.speed
        });

        socket.on(NetworkIds.INPUT, data => {
            inputQueue.enqueue({
                clientId: socket.id,
                message: data
            });
        });

        socket.on('disconnect', function() {
            console.log('connection lost: ', socket.id);
            delete activeClients[socket.id];
            notifyDisconnect(socket.id);
        });

        notifyConnect(socket, newPlayer);


        socket.on('setUsername', function(data) {
            //console.log(data);
            let chatterBoxSize = 0;
            
            if(users.indexOf(data) > -1) {
               socket.emit('userExists', data + ' username is taken! Try some other username.');
            } else {
               users.push(data);
               activeClients[socket.id].player.menuState = 'chatting';
               //console.log(activeClients[socket.id].player.state);
               socket.emit('userSet', {username: data});
            }

            if(!minChatterSizeHasBeenReached){
                for (let clientId in activeClients) {
                    if(activeClients[clientId].player.menuState == 'chatting'){
                        chatterBoxSize++;
                        console.log('we counted a chatter.');
                    }
                }
                if(chatterBoxSize > 2){
                    console.log('The countdown has begun.');
                    minChatterSizeHasBeenReached = true;
                    io.sockets.emit('BeginCountDown');
                    var seconds_left = 1;
                    var interval = setInterval(function() {
                        --seconds_left;
                        //document.getElementById('joinroom').innerHTML += --seconds_left;
                    
                        if (seconds_left <= 0)
                        {
                            //document.getElementById('joinroom').innerHTML = 'You are ready';
                            console.log('the server has begun the game!!!');
                            //gameHasBegun = true;
                            //gameLoop(present(), 0);
                            
                            clearInterval(interval);
                            
                            
                            
                        }
                    }, 1000);
                }
                else {
                    chatterBoxSize = 0;
                }
            }




         });
         
         socket.on('msg', function(data) {
            //Send message to everyone
            io.sockets.emit('newmsg', data);
         });

         socket.on(NetworkIds.HIGH_SCORES, data => {
            //console.log("Got a high scores request from the user!");
            var fs = require('fs');
            var obj;
            fs.readFile('../Game/data/highscores.json', 'utf8', function (err, fileData) {
            if (err){
                console.log(err);
                throw err;
            }
            socket.emit(NetworkIds.HIGH_SCORES,JSON.parse(fileData));
            });
         });

         socket.on(NetworkIds.VALID_USER, data => {
             //console.log("Got a login users request");
             console.log(data.name,data.password);
             if (validUser(data.name,data.password)){
                socket.emit(NetworkIds.VALID_USER, null);
             }
             else{
                 socket.emit(NetworkIds.INVALID_USER,null);
             }
         });

         socket.on(NetworkIds.VALID_CREATE_USER, data => {
             //console.log("Got a create users request");
             if(validCreateUser(data.name,data.password)){
                 socket.emit(NetworkIds.VALID_CREATE_USER,null);
             }
             else {
                 socket.emit(NetworkIds.INVALID_CREATE_USER, null);
             }
         })
         






    });
}

//------------------------------------------------------------------
//
// Entry point to get the game started.
//
//------------------------------------------------------------------
function initialize(httpServer) {
    initializeSocketIO(httpServer);
    gameLoop(present(), 0);
}

function validUser(uName,uPassword){
    var obj = JSON.parse(fs.readFileSync('../Game/data/users.json', 'utf8'));
    for (var i = 0; i < obj.length; ++i){
        console.log(CryptoJS.AES.decrypt(obj[i].password, salt).toString(CryptoJS.enc.Utf8));
        if (obj[i].name == uName && CryptoJS.AES.decrypt(obj[i].password, salt).toString(CryptoJS.enc.Utf8) == uPassword){
            return true;
        }
    }
    return false;
}

function validCreateUser(uName,uPassword){ 
    console.log('checking for valid create user');
    var obj = JSON.parse(fs.readFileSync('../Game/data/users.json', 'utf8'));
    for (var i = 0; i < obj.length; ++i){
        if (obj[i].name == uName){
            return false;
        }
    }

    obj.push({
        name: uName,
        password: CryptoJS.AES.encrypt(uPassword,salt).toString()
    });
    fs.writeFileSync('../Game/data/users.json',JSON.stringify(obj));

    return true;
}

//------------------------------------------------------------------
//
// Public function that allows the game simulation and processing to
// be terminated.
//
//------------------------------------------------------------------
function terminate() {
    this.quit = true;
}

module.exports.initialize = initialize;
