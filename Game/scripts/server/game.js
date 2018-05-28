// ------------------------------------------------------------------
//
// Nodejs module that provides the server-side game model.
//
// ------------------------------------------------------------------

'use strict';
//TODO: change the game to start based on a host button, or something besides a hardcoded number.
let numberOfPlayersPlaying = 2;
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
let Shield = require('./shield');
let gameHasBegun = false;

let updateShieldInt = 0;
let updateClientInt = 0;

let weaponPowerUps = [];
let fire_ratePowerUps = [];
let fire_rangePowerUps = [];
let healthPowerUps = [];
let ammoPowerUps = [];
let pPerPlayer = 5;
let powerRun = true;
let powerUpsChanged = true;

const SIMULATION_UPDATE_RATE_MS = 33;
const STATE_UPDATE_RATE_MS = 100;
let lastUpdate = 0;
let quit = false;
let activeClients = {};
let atLeastTwoPlayersOnMap = false;

let newMissiles = [];
let activeMissiles = [];
let hits = [];
let inputQueue = Queue.create();
let nextMissileId = 1;
let map = mapLogic.create();
map.setMap(mapFile);
//this is being hard coded for now until I figure out a better solution
let playerSize = {width: 80, height: 80};
//Shield by passing the map, the percent of map width the first 
// shield diameter will be, and how many minutes between shield moves.
let FIRST_SHIELD_DIAMETER = 1.2; //This is approximately just outside the playable corners of the map.
let TIME_TO_MOVE_SHIELD = 1; // This must be the same in the client.
let SHIELD_MOVES = 5; // This must be the same in the client.
let SHRINK_DOWN_TO = 0 - ( .5 * playerSize.width)/map.mapWidth; //Need to adjust for collision radius of players.
let shield = Shield.create(map, FIRST_SHIELD_DIAMETER, TIME_TO_MOVE_SHIELD, SHRINK_DOWN_TO, SHIELD_MOVES);
let salt = 'xnBZngGg*+FhQz??V6FMjfd9G4m5w^z8P*6';

//TODO: what is the difference between loggedInPlayers and activeClients?
let loggedInPlayers = [];



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
    while(weaponPowerUps.length < (4*pPerPlayer)){
        createWeaponPowerUp();
    };
    while(fire_ratePowerUps.length < pPerPlayer){
        createFireRatePowerUp();
    };
    while(fire_rangePowerUps.length < pPerPlayer){
        createFireRangePowerUp();
    };
    while(healthPowerUps.length < 2*pPerPlayer){
        createHealthPowerUp()
    };
    while(ammoPowerUps.length < 4*pPerPlayer){
        createAmmoPowerUp();
    };
};

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

function sprint(playerModel){
    playerModel.isSprinting = true;
}

function updateHighScores(){
    var fs = require('fs');
    //read in all the high scores from the file
    var obj = JSON.parse(fs.readFileSync('../Game/data/highscores.json', 'utf8'));
    //then figure out the proper ordering and rewrite the top 20.
    for (let clientId in activeClients) {
        let client = activeClients[clientId];
        let pushed = {
            name: client.player.userName,
            score: client.player.score,
            kills: client.player.kills,
            killer: client.player.killer
        };
        obj.push({
            name: client.player.userName,
            score: client.player.score
        });

    }
    //sort the scores
    obj.sort((a, b) => parseInt(b.score) - parseFloat(a.score));
    //write the top 20 back to the file
    var newList = [];
    for (var i = 0; i < 20 && i < obj.length; ++i){
        newList.push(obj[i]);
    }    

    fs.writeFileSync('../Game/data/highscores.json',JSON.stringify(newList));
}

function collided(obj1, obj2) {
    let distance = Math.sqrt(Math.pow(obj1.worldCordinates.x - obj2.worldCordinates.x, 2) 
    + Math.pow(obj1.worldCordinates.y - obj2.worldCordinates.y, 2));
    let radii = obj1.collision_radius + obj2.collision_radius;
    //console.log('carnage is being detected -->',distance, ' sum:' ,radii);

    return distance <= radii;
}

function isInRange(obj1, obj2){
    let distance = Math.sqrt(Math.pow(obj1.worldCordinates.x - obj2.worldCordinates.x, 2) 
    + Math.pow(obj1.worldCordinates.y - obj2.worldCordinates.y, 2));
    return distance <= 700;
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
                sprint(client.player);
                break;
            case NetworkIds.MOUSE_MOVE:
                client.player.changeDirection(input.message.x, input.message.y, input.message.viewPort);
                break;
        }
    }
}

function resetGame(){
    //TODO: reset game includes reestablishing all active clients player in the game
    for (let clientId in activeClients){
        activeClients[clientId].player.reset();
    } 
    //Reset shield
    shield = Shield.create(map, FIRST_SHIELD_DIAMETER, TIME_TO_MOVE_SHIELD, SHRINK_DOWN_TO, SHIELD_MOVES);
    //Reset powerups
    ammoPowerUps.length = 0;
    healthPowerUps.length = 0;
    weaponPowerUps.length = 0;
    fire_rangePowerUps.length = 0;
    fire_ratePowerUps.length = 0;
    updatePowerUps();
    //Reset missiles
    activeMissiles.length = 0;
}

function update(elapsedTime, currentTime) {
    shield.update(elapsedTime);

    if(powerRun){
        updatePowerUps();
        powerRun = false;
        //console.log('powerruncheck');
    }   


    for (let clientId in activeClients) {
        if(!activeClients[clientId].player.is_alive){
            continue;
        }

        if(!collided(activeClients[clientId].player, shield)){
            activeClients[clientId].player.wasInShield(); // bookmark
        }

        if(!activeClients[clientId].player.is_alive){
            continue;
        }

        if(!activeClients[clientId].player.has_gun){
            for(let weapon = weaponPowerUps.length - 1; weapon >= 0; weapon-- ){
                if(collided(activeClients[clientId].player,weaponPowerUps[weapon])){
                    activeClients[clientId].player.has_gun = true;
                    weaponPowerUps[weapon].movePowerUp();
                    powerUpsChanged = true;
                }
            }
        }

        if(!activeClients[clientId].player.has_rapid_fire){
            for(let fire_rate = fire_ratePowerUps.length - 1; fire_rate >= 0; fire_rate-- ){
                if(collided(activeClients[clientId].player,fire_ratePowerUps[fire_rate])){
                    activeClients[clientId].player.has_rapid_fire = true;
                    fire_ratePowerUps[fire_rate].movePowerUp();
                    powerUpsChanged = true;
                }
            }
        }
       
        if(!activeClients[clientId].player.has_long_range){
            for(let fire_range = fire_rangePowerUps.length - 1; fire_range >= 0; fire_range-- ){
                if(collided(activeClients[clientId].player,fire_rangePowerUps[fire_range])){
                    activeClients[clientId].player.has_long_range = true;
                    fire_rangePowerUps[fire_range].movePowerUp();
                    powerUpsChanged = true;
                }
            }
        }
      
        if(activeClients[clientId].player.life_remaining < 100){
            for(let health = healthPowerUps.length - 1; health >= 0; health-- ){
                if(collided(activeClients[clientId].player,healthPowerUps[health])){
                    activeClients[clientId].player.foundMedPack();
                    healthPowerUps[health].movePowerUp();
                    powerUpsChanged = true;
                }
            }
        }
        

        if(activeClients[clientId].player.ammo_remaining < 100){
            for(let ammo = ammoPowerUps.length - 1; ammo >= 0; ammo-- ){
                if(collided(activeClients[clientId].player,ammoPowerUps[ammo])){
                    activeClients[clientId].player.foundAmmoPack();
                    ammoPowerUps[ammo].movePowerUp();
                    powerUpsChanged = true;
                }
            }
        }
        activeClients[clientId].player.update(elapsedTime);
    }







    for (let missile = 0; missile < newMissiles.length; missile++) {
        newMissiles[missile].update(elapsedTime);
    }

    let keepMissiles = [];
    for (let missile = 0; missile < activeMissiles.length; missile++) {
        if (activeMissiles[missile].update(elapsedTime)) {
            keepMissiles.push(activeMissiles[missile]);
        }
    }
    activeMissiles = keepMissiles;
    keepMissiles = [];


    for (let missile = 0; missile < activeMissiles.length; missile++) {
        let hit = false;
        if (!map.isValid(activeMissiles[missile].worldCordinates.y, activeMissiles[missile].worldCordinates.x)){
            hit = true;
            //continue;
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

function updateClients(elapsedTime) {

    let liveCount = 0;
    let playerCount = 0;
    //
    // For demonstration purposes, network updates run at a slower rate than
    // the game simulation.
    lastUpdate += elapsedTime;
    // bookmark dont need
    if (lastUpdate < STATE_UPDATE_RATE_MS) {
        return;
    }

    if(updateClientInt%5 === 1){
        if(gameHasBegun){
            for (let clientId in activeClients) {
                let client = activeClients[clientId];        
                playerCount++;
                if(client.player.is_alive){
                    liveCount++;
                }
            }

            if (atLeastTwoPlayersOnMap){
                if((liveCount <= 1) && (playerCount > 0)){
                    console.log(liveCount, playerCount);
                    for (let clientId in activeClients) {
                        let client = activeClients[clientId];
                        client.socket.emit(NetworkIds.GAME_OVER, '');
                    }
                    updateHighScores();
                    //We don't want to quit the game simulation, we want to reset it fresh.
                    quit = true;
                    //resetGame();
                }
            }
        }

        for (let clientId in activeClients) {
            let shieldUpdate = {
                radius: shield.radius + 2*activeClients[clientId].player.collision_radius,
                nextRadius: shield.nextRadius + 2*activeClients[clientId].player.collision_radius,
                worldCordinates: shield.worldCordinates,
                nextWorldCordinates: shield.nextWorldCordinates,
                timeTilNextShield: shield.timeTilNextShield
            };
            activeClients[clientId].socket.emit(NetworkIds.SHIELD_MOVE, shieldUpdate);
        }
    }
    updateClientInt++;



    if(powerUpsChanged){
        for (let clientId in activeClients) {
            let client = activeClients[clientId];

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
        }
        powerUpsChanged = false;
        if(!gameHasBegun){
            powerUpsChanged = true;
        }
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
        let client = activeClients[clientId];
        let update = {
            clientId: clientId,
            lastMessageId: client.lastMessageId,
            direction: client.player.direction,
            worldCordinates: client.player.worldCordinates,
            speed: client.player.speed,
            life_remaining: client.player.life_remaining,
            is_alive: client.player.is_alive,
            isSprinting: client.player.isSprinting,
            sprintEnergy: client.player.sprintEnergy,
            SPRINT_FACTOR: client.player.SPRINT_FACTOR,
            SPRINT_DECREASE_RATE: client.player.SPRINT_DECREASE_RATE,
            SPRINT_RECOVERY_RATE: client.player.SPRINT_RECOVERY_RATE,
            killer: client.player.killer,
            updateWindow: lastUpdate,
            userName: client.player.userName,
            hasWeapon: client.player.has_gun,
            hasBullets: client.player.ammo_remaining > 0,
            hasRapidFire: client.player.has_rapid_fire,
        };
        client.socket.emit(NetworkIds.UPDATE_SELF, update);
        // Notify all other connected clients about every
        // other connected client status.
        for (let otherId in activeClients) {
            if (otherId !== clientId) {
                if(isInRange(client.player, activeClients[otherId].player)){
                    activeClients[otherId].socket.emit(NetworkIds.UPDATE_OTHER, update);
                    continue;
                }
                if(updateClientInt%5==0){
                    activeClients[otherId].socket.emit(NetworkIds.UPDATE_OTHER, update);
                    continue;
                }
            }
        }
        for (let missile = 0; missile < missileMessages.length; missile++) {
            client.socket.emit(NetworkIds.MISSILE_NEW, missileMessages[missile]);
        }
        for (let hit = 0; hit < hits.length; hit++) {
            client.socket.emit(NetworkIds.MISSILE_HIT, hits[hit]);
        }
    }

    hits.length = 0;
    lastUpdate = 0;
}

function gameLoop(currentTime, elapsedTime) {
    if (gameHasBegun){
        processInput(elapsedTime);
        update(elapsedTime, currentTime);
        updateClients(elapsedTime);
    }

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
    let playersOnMap = 0;

    io.on('connection', function(socket) {
        console.log('Connection established: ', socket.id);

        let newPlayerName = '';

        socket.on(NetworkIds.INPUT, data => {
            inputQueue.enqueue({
                clientId: socket.id,
                message: data
            });
        });

        socket.on('inMapScreen',function(){
            let seconds_left = 15;
            let interval = setInterval(function() {
                --seconds_left;
                if (seconds_left <= 0)
                {
                    //Time is up for choosing start location, all players left forced 
                    // to join game at random location (the one that was picked for them before).
                    socket.emit('forceGameScreen');
                    clearInterval(interval);
                }
            }, 1000);
        })

        socket.on('isValidStart',function(data){
            let result = map.isValid(data.y,data.x);
            if(result){
                io.sockets.emit('isValidRes', {x: data.x, y: data.y});
                socket.emit('isValidForYou', {result: result, x: data.x, y: data.y});
            }
            
        });

        socket.on('readyplayerone', function(input){
            playersOnMap += 1;
            atLeastTwoPlayersOnMap = (playersOnMap === 2 || atLeastTwoPlayersOnMap);
            shield.gameStarted = true;
            
            let newPlayer = Player.create(map);
            newPlayer.clientId = socket.id;
            newPlayer.userName = newPlayerName;

            if(input){
                if(input.result){
                    newPlayer.worldCordinates.x = input.x;
                    newPlayer.worldCordinates.y = input.y;
                }
            }
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

        socket.on(NetworkIds.SCORE_REQ,function(){
            //console.log('I am here in the server');
            let gameStatsOver = [];
            for (let clientId in activeClients) {
                let client = activeClients[clientId];
                let pushed = {
                    name: client.player.userName,
                    score: client.player.score,
                    kills: client.player.kills,
                    killer: client.player.killer
                };
                gameStatsOver.push(pushed);
            }
            socket.emit(NetworkIds.SCORE_RES,gameStatsOver)
        });

        socket.on('disconnect', function() {
            console.log('connection lost: ', socket.id);
            delete activeClients[socket.id];
            for (var i = 0; i < loggedInPlayers.length; ++i){
                if (loggedInPlayers[i].id == socket.id){
                    loggedInPlayers.splice(i,1);
                    break;
                }
            }
            notifyDisconnect(socket.id);
        });

        socket.on('exitedchat', function(data) {
            chatterBoxSize--;
            let index = users.indexOf(data);
            console.log(index);
            if (index > -1) {
                users.splice(index, 1);
            }
         });

        socket.on('setUsername', function(data) {
            
            chatterBoxSize += 1;
            users.push(data);
            socket.emit('userSet', {username: data});

            if(!minChatterSizeHasBeenReached){
                if(chatterBoxSize >= numberOfPlayersPlaying){
                    console.log('The countdown has begun.');
                    minChatterSizeHasBeenReached = true;
                    io.sockets.emit('BeginCountDown');
                    let seconds_left = 15;
                    let interval = setInterval(function() {
                        --seconds_left;
                        if (seconds_left === 10){
                            gameHasBegun = true;
                        }
                        if (seconds_left <= 0)
                        {
                            console.log('the server has begun the game!!!');
                            clearInterval(interval);
                        }
                    }, 1000);
                }
            }
            
         });


         socket.on('msg', function(data) {
            //Send message to everyone
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
                loggedInPlayers.push({
                    name: data.name,
                    id: socket.id
                });
                socket.emit(NetworkIds.VALID_USER, null);
             }
             else{
                 socket.emit(NetworkIds.INVALID_USER,null);
             }
         });

         socket.on(NetworkIds.VALID_CREATE_USER, data => {
             if(validCreateUser(data.name,data.password)){
                 newPlayerName = data.name;
                 loggedInPlayers.push({
                     name: data.name,
                     id: socket.id
                 });
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
    //Let's initialize everything about the game that won't change until players are on the map.
    updatePowerUps();

    //Then call the gameloop to start running.
    gameLoop(present(), 0);
}

function validUser(uName,uPassword){
    var obj = JSON.parse(fs.readFileSync('../Game/data/users.json', 'utf8'));
    var valid = false;
    for (var i = 0; i < obj.length; ++i){
        if (obj[i].name == uName && CryptoJS.AES.decrypt(obj[i].password, salt).toString(CryptoJS.enc.Utf8) == uPassword){
            valid = true;
        }
    }
    for (var i = 0; i < loggedInPlayers.length; ++i){
        if (uName == loggedInPlayers[i].name){
            return false;
        }
    }
    return valid;
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
