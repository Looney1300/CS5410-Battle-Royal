// ------------------------------------------------------------------
//
// Nodejs module that provides the server-side game model.
//
// ------------------------------------------------------------------

'use strict';
let present = require('present');
let Player = require('./player');
//let Missile = require('./missile');
let NetworkIds = require('../shared/network-ids');
let Queue = require('../shared/queue.js');








const SIMULATION_UPDATE_RATE_MS = 50;
const STATE_UPDATE_RATE_MS = 50;
let lastUpdate = 0;
let quit = false;
let activeClients = {};

// Here we are creating a queue from the queue class
let inputQueue = Queue.create();




//------------------------------------------------------------------
//
// Process the network inputs we have received since the last time
// the game loop was processed.
//
//------------------------------------------------------------------
function processInput(elapsedTime) {
    // We don't have any input happening yet!
}

//------------------------------------------------------------------
//
// Utility function to perform a hit test between two objects.  The
// objects must have a position: { x: , y: } property and radius property.
//
//------------------------------------------------------------------
function collided(obj1, obj2) {
    let distance = Math.sqrt(Math.pow(obj1.position.x - obj2.position.x, 2) + Math.pow(obj1.position.y - obj2.position.y, 2));
    let radii = obj1.radius + obj2.radius;
    return distance <= radii;
}

//------------------------------------------------------------------
//
// Update the simulation of the game.
//
//------------------------------------------------------------------
function update(elapsedTime, currentTime) {
    // No need to update anything yet.
}

//------------------------------------------------------------------
//
// Send state of the game to any connected clients.
//
//------------------------------------------------------------------
function updateClients(elapsedTime) {
    // No purpose to updating the clients yet.
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
                    position: newPlayer.position
                });

                //
                // Tell the new player about the already connected player
                socket.emit(NetworkIds.CONNECT_OTHER, {
                    clientId: client.player.clientId,
                    position: client.player.position
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
    
    io.on('connection', function(socket) {
        console.log('Connection established: ', socket.id);
        //
        // Create an entry in our list of connected clients
        let newPlayer = Player.create()
        newPlayer.clientId = socket.id;

        // Now push this player into the active clients array
        activeClients[socket.id] = {
            socket: socket,
            player: newPlayer
        };

        // Tell everything where this player is
        socket.emit(NetworkIds.CONNECT_ACK, {
            //direction: newPlayer.direction,
            position: newPlayer.position,
            //size: newPlayer.size,
            //rotateRate: newPlayer.rotateRate,
            //speed: newPlayer.speed
        });

        socket.on(NetworkIds.INPUT, data => {
            inputQueue.enqueue({
                clientId: socket.id,
                message: data
            });
        });

        socket.on('disconnect', function() {
            console.log('Player: ' + socket.id + ' has left the building!');
            delete activeClients[socket.id];
            notifyDisconnect(socket.id);
        });

        notifyConnect(socket, newPlayer);
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

//------------------------------------------------------------------
//
// Public function that allows the game simulation and processing to
// be terminated.
//
//------------------------------------------------------------------
function terminate() {
    this.quit = true;
}

// I think this starts the stuff
module.exports.initialize = initialize;
