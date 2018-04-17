// ------------------------------------------------------------------
//
// Nodejs module that provides the server-side game model.
//
// ------------------------------------------------------------------
'use strict';

let present = require('present');
let Player = require('./player');
let PowerUp = require('./powerup');
let Missile = require('./missile');
let NetworkIds = require('../shared/network-ids');
let Queue = require('../shared/queue.js');
let mapLogic = require('../shared/map');
let mapFile = require('../shared/maps/medium');
// let mapFile = require('../shared/maps/SmallMap');
let CryptoJS = require('crypto-js');
let fs = require('fs');
let Shield = require('../shared/shield');



let weaponPowerUps = [];
let fire_ratePowerUps = [];
let fire_rangePowerUps = [];
let healthPowerUps = [];
let ammoPowerUps = [];
let pPerPlayer = 5;



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
//Shield by passing the map, the percent of map width the first 
// shield diameter will be, and how many minutes between shield moves.
let SHIELD_RADIUS = .78;
let TIME_TO_MOVE_SHIELD = .25;
let shield = Shield.create(map, SHIELD_RADIUS, TIME_TO_MOVE_SHIELD);
let salt = 'xnBZngGg*+FhQz??V6FMjfd9G4m5w^z8P*6';
//this is being hard coded for now until I figure out a better solution
let playerSize = {width: 80, height: 80};




function createWeaponPowerUp(){
    let tempwpu = PowerUp.create(map,'weapon');
    weaponPowerUps.push(tempwpu);  
};
function createFireRatePowerUp(){
    let tempfrpu = PowerUp.create(map,'fire-rate');
    fire_ratePowerUps.push(tempfrpu);
};
function createFireRangePowerUp(){
    let tempfrapu = PowerUp.create(map,'fire-range');
    fire_rangePowerUps.push(tempfrapu);
};
function createHealthPowerUp(){
    let temphpu = PowerUp.create(map,'health');
    healthPowerUps.push(temphpu);
};
function createAmmoPowerUp(){
    let tempapu = PowerUp.create(map,'ammo');
    ammoPowerUps.push(tempapu);
};

function updatePowerUps(){
    while(weaponPowerUps.length < pPerPlayer){
        createWeaponPowerUp();
    };
    while(fire_ratePowerUps.length < pPerPlayer){
        createFireRatePowerUp();
    };
    while(fire_rangePowerUps.length < pPerPlayer){
        createFireRangePowerUp();
    };
    while(healthPowerUps.length < pPerPlayer){
        createHealthPowerUp()
    };
    while(ammoPowerUps.length < pPerPlayer){
        createAmmoPowerUp();
    };
};

//------------------------------------------------------------------
//
// Used to create a missile in response to user input.
//
//------------------------------------------------------------------
function createMissile(clientId, playerModel) {
    if(!playerModel.is_alive){
        return;
    }
    if(playerModel.has_gun){
        if(playerModel.firedAShot()){
            let offset = calcXYBulletOffset(playerModel.direction,playerSize);
            let tempmistime = playerModel.missileTime;
            if(playerModel.has_long_range){
                tempmistime = 2*tempmistime;
                //console.log('!!!!!!!!!');
            }
            let missile = Missile.create({
                id: nextMissileId++,
                clientId: clientId,
                worldCordinates: {
                    x: playerModel.worldCordinates.x + offset.x,
                    y: playerModel.worldCordinates.y - offset.y
                },
                timeRemaining: tempmistime,
                direction: playerModel.direction,
                speed: playerModel.speed*2
            });
            newMissiles.push(missile);
        }
    }
}

function createRapidMissile(clientId, playerModel){
    if(playerModel.has_rapid_fire){
        createMissile(clientId, playerModel);
    }
}


function sprint(clientId, playerModel){
    playerModel.isSprinting = true;
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
        if(client == undefined){
            break;
        }
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
            case NetworkIds.INPUT_RAPIDFIRE:
                createRapidMissile(input.clientId, client.player);
                break;
            case NetworkIds.INPUT_SPRINT:
                sprint(input.clientId, client.player);
                break;
            case NetworkIds.MOUSE_MOVE:
                client.player.changeDirection(input.message.x, input.message.y, input.message.viewPort);
                break;
        }
    }
}

//------------------------------------------------------------------
//
// Utility function to perform a hit test between two objects.  The
// objects must have a worldCordinates: { x: , y: } property and collision_radius property.
//
//------------------------------------------------------------------
function collided(obj1, obj2) {
    let distance = Math.sqrt(Math.pow(obj1.worldCordinates.x - obj2.worldCordinates.x, 2) 
    + Math.pow(obj1.worldCordinates.y - obj2.worldCordinates.y, 2));
    let radii = obj1.collision_radius + obj2.collision_radius;
    //console.log('carnage is being detected -->',distance, ' sum:' ,radii);

    return distance <= radii;
}


function calcXYBulletOffset(direction,imageSize){
    let offsetX = null;
    let offsetY = null;
    //these are hard coded for now, essentially the 20 is 1/4 the actual size of the image, and the 8 is 1/10 the actual size of the image
    if (direction < 0){
        offsetX = (imageSize.width/4)*Math.cos(-direction) + (imageSize.width/10);
    }
    else{
        offsetX = (imageSize.width/4)*Math.cos(-direction) - (imageSize.width/10);
    }
    if (Math.abs(direction) < (Math.PI/2)){
        offsetY = (imageSize.height/4)*Math.sin(-direction) - (imageSize.height/10); //this value depends on the direction
    }
    else {
        offsetY = (imageSize.height/4)*Math.sin(-direction) + (imageSize.height/10);
    }
    return {
        x: offsetX,
        y: offsetY
    }
}
//------------------------------------------------------------------
//
// Update the simulation of the game.
//
//------------------------------------------------------------------
function update(elapsedTime, currentTime) {
    shield.update(elapsedTime);

    // In update we need to ensure we have pPerPlayer of each powerup

    updatePowerUps();
    // Powerups are created, now we need to do collision detection on them.
    // need to check if any clients ran over the power ups.
    // We need to check every client against every powerup.

    for (let clientId in activeClients) {
        if(!collided(activeClients[clientId].player, shield)){
            // Um... Is this how I make the client die when they aren't in the shield?
            activeClients[clientId].player.wasHit(); 
        }

        if(!activeClients[clientId].player.is_alive){
            continue;
        }
        for(let weapon = weaponPowerUps.length - 1; weapon >= 0; weapon-- ){
            if(collided(activeClients[clientId].player,weaponPowerUps[weapon])){
                // if they collided give the reward and remove the powerup from the player.
                if(activeClients[clientId].player.has_gun){
                    continue;
                }
                console.log('the player ran over a weapon!');
                activeClients[clientId].player.foundGun();
                weaponPowerUps.splice(weapon,1);
            }
        }

        for(let fire_rate = fire_ratePowerUps.length - 1; fire_rate >= 0; fire_rate-- ){
            if(collided(activeClients[clientId].player,fire_ratePowerUps[fire_rate])){
                // if they collided give the reward and remove the powerup from the player.
                if(activeClients[clientId].player.has_rapid_fire){
                    continue;
                }
                console.log('the player ran over a fire-rate!');
                activeClients[clientId].player.foundRapidFire();
                fire_ratePowerUps.splice(fire_rate,1);
            }
        }

        for(let fire_range = fire_rangePowerUps.length - 1; fire_range >= 0; fire_range-- ){
            if(collided(activeClients[clientId].player,fire_rangePowerUps[fire_range])){
                // if they collided give the reward and remove the powerup from the player.
                if(activeClients[clientId].player.has_long_range){
                    continue;
                }
                console.log('the player ran over a fire_range!');
                activeClients[clientId].player.foundLongRange();
                fire_rangePowerUps.splice(fire_range,1);
            }
        }

        for(let health = healthPowerUps.length - 1; health >= 0; health-- ){
            if(collided(activeClients[clientId].player,healthPowerUps[health])){
                // if they collided give the reward and remove the powerup from the player.
                if(activeClients[clientId].player.life_remaining >= 100){
                    continue;
                }
                console.log('the player ran over a health!');
                activeClients[clientId].player.foundMedPack();
                healthPowerUps.splice(health,1);
            }
        }

        for(let ammo = ammoPowerUps.length - 1; ammo >= 0; ammo-- ){
            if(collided(activeClients[clientId].player,ammoPowerUps[ammo])){
                // if they collided give the reward and remove the powerup from the player.
                if(activeClients[clientId].player.ammo_remaining >= 100){
                    continue;
                }
                console.log('the player ran over a ammo!');
                activeClients[clientId].player.foundAmmoPack();
                ammoPowerUps.splice(ammo,1);
            }
        }
    }

    // Now that we have checked every powerup against every player

    for (let clientId in activeClients) {
        //Question about currentTime vs elapsedTime, what should be put right here?
        activeClients[clientId].player.update(elapsedTime);
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
        if (!map.isValid(activeMissiles[missile].worldCordinates.y, activeMissiles[missile].worldCordinates.x)){
            console.log('bullet hit something');
            hit = true;
            // hits.push({
            //     clientId: null,
            //     missileId: activeMissiles[missile].id,
            //     hit_location: activeMissiles[missile].worldCordinates
            // });
        }
        for (let clientId in activeClients) {
            //
            // Don't allow a missile to hit the player it was fired from.
            if (clientId !== activeMissiles[missile].clientId) {
                if (collided(activeMissiles[missile], activeClients[clientId].player)) {
                    // This is player who was hit.
                    if(!activeClients[clientId].player.is_alive){
                        continue;
                    }
                    activeClients[clientId].player.wasHit(activeClients[activeMissiles[missile].clientId].player);
                    activeClients[activeMissiles[missile].clientId].player.scoredAHit();
                    hit = true;
                    hits.push({
                        clientId: clientId,
                        missileId: activeMissiles[missile].id,
                        hit_location: activeClients[clientId].player.worldCordinates
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

    // Send the shield and time remaining til it shrinks.
    for (let clientId in activeClients) {
        activeClients[clientId].socket.emit(NetworkIds.SHIELD_MOVE, {
            radius: shield.radius + 2*activeClients[clientId].player.collision_radius,
            nextRadius: shield.nextRadius + 2*activeClients[clientId].player.collision_radius,
            worldCordinates: shield.worldCordinates,
            nextWorldCordinates: shield.nextWorldCordinates,
            timeTilNextShield: shield.timeTilNextShield
        });
    }


    for (let clientId in activeClients) {
        let client = activeClients[clientId];
        let update = {
            clientId: clientId,
            lastMessageId: client.lastMessageId,
            direction: client.player.direction,
            worldCordinates: client.player.worldCordinates,
            speed: client.player.speed,
            score: client.player.score,
            life_remaining: client.player.life_remaining,
            is_alive: client.player.is_alive,
            isSprinting: client.player.isSprinting,
            sprintEnergy: client.player.sprintEnergy,
            SPRINT_FACTOR: client.player.SPRINT_FACTOR,
            SPRINT_DECREASE_RATE: client.player.SPRINT_DECREASE_RATE,
            SPRINT_RECOVERY_RATE: client.player.SPRINT_RECOVERY_RATE,
            kills: client.player.kills,
            userName: client.player.userName,
            killer: client.player.killer,
            updateWindow: lastUpdate,
            userName: client.player.userName,
            hasWeapon: client.player.has_gun,
            hasBullets: client.player.ammo_remaining > 0,
            hasRapidFire: client.player.has_rapid_fire,
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

        // HERE SINCE WE ARE SCROLLING THROUGH EVERY CLIENT, LETS TELL EVERY CLIENT WHERE EVERY
        // POWER UP IS EVERY UPDATE. What do we need to send to the client? Just the type... and
        // its location.

        let powerUpArray = [];

        for(let weapon = weaponPowerUps.length - 1; weapon >= 0; weapon-- ){
            let pUp = {
                worldCordinates: weaponPowerUps[weapon].worldCordinates,
                type: weaponPowerUps[weapon].type,
                radius: weaponPowerUps[weapon].radius
            }
            powerUpArray.push(pUp);
        }

        for(let fire_rate = fire_ratePowerUps.length - 1; fire_rate >= 0; fire_rate-- ){
            let pUp = {
                worldCordinates: fire_ratePowerUps[fire_rate].worldCordinates,
                type: fire_ratePowerUps[fire_rate].type,
                radius: fire_ratePowerUps[fire_rate].radius
            }
            powerUpArray.push(pUp);
        }

        for(let fire_range = fire_rangePowerUps.length - 1; fire_range >= 0; fire_range-- ){
            let pUp = {
                worldCordinates: fire_rangePowerUps[fire_range].worldCordinates,
                type: fire_rangePowerUps[fire_range].type,
                radius: fire_rangePowerUps[fire_range].radius
            }
            powerUpArray.push(pUp);
        }

        for(let health = healthPowerUps.length - 1; health >= 0; health-- ){
            let pUp = {
                worldCordinates: healthPowerUps[health].worldCordinates,
                type: healthPowerUps[health].type,
                radius: healthPowerUps[health].radius
            }
            powerUpArray.push(pUp);
        }

        for(let ammo = ammoPowerUps.length - 1; ammo >= 0; ammo-- ){
            let pUp = {
                worldCordinates: ammoPowerUps[ammo].worldCordinates,
                type: ammoPowerUps[ammo].type,
                radius: ammoPowerUps[ammo].radius
            }
            powerUpArray.push(pUp);
        }

        // Now that we have built the powerup array we need to send it to the clients
        // one piece at a time.

        for (let powerUp = 0; powerUp < powerUpArray.length; powerUp++){
            powerUpArray[powerUp].indexId = powerUp;
            client.socket.emit(NetworkIds.POWER_UP_LOC, powerUpArray[powerUp]);
        }

        powerUpArray.length = 0;


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
                    size: newPlayer.size,
                    position: newPlayer.position,
                });

                //
                // Tell the new player about the already connected player
                socket.emit(NetworkIds.CONNECT_OTHER, {
                    clientId: client.player.clientId,
                    direction: client.player.direction,
                    worldCordinates: client.player.worldCordinates,
                    rotateRate: client.player.rotateRate,
                    speed: client.player.speed,
                    size: client.player.size,
                    position: newPlayer.position,
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
    let chatterBoxSize = 0;
    io.on('connection', function(socket) {
        console.log('Connection established: ', socket.id);
        //
        // Create an entry in our list of connected clients
        let newPlayerName = '';
        // let newPlayer = Player.create(map);
        // newPlayer.clientId = socket.id;
        // activeClients[socket.id] = {
        //     socket: socket,
        //     player: newPlayer
        // };
        // socket.emit(NetworkIds.CONNECT_ACK, {
        //     direction: newPlayer.direction,
        //     worldCordinates: newPlayer.worldCordinates,
        //     size: newPlayer.size,
        //     rotateRate: newPlayer.rotateRate,
        //     speed: newPlayer.speed
        // });

        socket.on(NetworkIds.INPUT, data => {
            inputQueue.enqueue({
                clientId: socket.id,
                message: data
            });
        });

        socket.on('readyplayerone',function(){
            let newPlayer = Player.create(map);
            //let newPowerUp = PowerUp.create(map,'ammo');
            //console.log(newPowerUp);
            newPlayer.clientId = socket.id;
            newPlayer.userName = newPlayerName;
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
            notifyConnect(socket, newPlayer);
        });

        socket.on('disconnect', function() {
            console.log('connection lost: ', socket.id);
            delete activeClients[socket.id];
            notifyDisconnect(socket.id);
        });

        socket.on('exitedchat', function(data) {
            //Send message to everyone
            //io.sockets.emit('newmsg', data);
            chatterBoxSize--;
            let index = users.indexOf(data);
            if (index > -1) {
                users.splice(index, 1);
                console.log('we spliced!');
            }
            console.log(chatterBoxSize);
         });
        
        


        socket.on('setUsername', function(data) {
            console.log('This should happen !!!!!!!!');
            chatterBoxSize += 1;
            console.log(chatterBoxSize);
            //console.log(data);
            //let chatterBoxSize = 0;
            
            if(users.indexOf(data) > -1) {
                console.log('if part: ', data);
               //socket.emit('userExists', data + ' username is taken! Try some other username.');
               socket.emit('userSet', {username: data});
            } else {
                console.log('else part: ', data);
               users.push(data);
               //activeClients[socket.id].player.menuState = 'chatting';
               //console.log(activeClients[socket.id].player.state);
               socket.emit('userSet', {username: data});
               
               
            }

            if(!minChatterSizeHasBeenReached){
                // for (let clientId in activeClients) {
                //     if(activeClients[clientId].player.menuState == 'chatting'){
                //         chatterBoxSize++;
                //         console.log('we counted a chatter.');
                //     }
                // }
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
                            // gameLoop(present(), 0);
                            
                            clearInterval(interval);
                            
                            
                            
                        }
                    }, 1000);
                }
                else {
                    //chatterBoxSize = 0;
                }
            }




         });
         
         socket.on('msg', function(data) {
            //Send message to everyone
            console.log(data);
            io.sockets.emit('newmsg', data);
         });

         socket.on(NetworkIds.HIGH_SCORES, data => {
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
             if (validUser(data.name,data.password)){
                newPlayerName = data.name;
                //newPlayer.userName = data.name;
                socket.emit(NetworkIds.VALID_USER, null);
             }
             else{
                 socket.emit(NetworkIds.INVALID_USER,null);
             }
         });

         socket.on(NetworkIds.VALID_CREATE_USER, data => {
             if(validCreateUser(data.name,data.password)){
                 newPlayerName = data.name;
                //newPlayer.userName = data.name;
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
        if (obj[i].name == uName && CryptoJS.AES.decrypt(obj[i].password, salt).toString(CryptoJS.enc.Utf8) == uPassword){
            return true;
        }
    }
    return false;
}

function validCreateUser(uName,uPassword){ 
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
