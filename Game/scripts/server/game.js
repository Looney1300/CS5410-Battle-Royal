// ------------------------------------------------------------------
//
// Nodejs module that provides the server-side game model.
//
// ------------------------------------------------------------------

'use strict';
//TODO: change the game to start based on a host button, or something besides a hardcoded number.
let MAX_NUM_PLAYERS_PER_GAME = 2;
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

const SIMULATION_UPDATE_RATE_MS = 33;
const STATE_UPDATE_RATE_MS = 100;
let POWERUPS_PER_PLAYER = 5;
let PLAYER_SIZE = {width: 80, height: 80};
let SALT = 'xnBZngGg*+FhQz??V6FMjfd9G4m5w^z8P*6';

let inputQueue = Queue.create();
let map = mapLogic.create();
map.setMap(mapFile);
//Shield by passing the map, the percent of map width the first 
// shield diameter will be, and how many minutes between shield moves.
let FIRST_SHIELD_DIAMETER = 1.2; //This is approximately just outside the playable corners of the map.
let TIME_TO_MOVE_SHIELD = 1; // This must be the same in the client.
let SHIELD_MOVES = 5; // This must be the same in the client.
let SHRINK_DOWN_TO = 0 - ( .5 * PLAYER_SIZE.width)/map.mapWidth; //Need to adjust for collision radius of players.
let shield = Shield.create(map, FIRST_SHIELD_DIAMETER, TIME_TO_MOVE_SHIELD, SHRINK_DOWN_TO, SHIELD_MOVES);

let gameHasBegun = false;
let updateShieldInt = 0;
let updateClientInt = 0;

let weaponPowerUps = [];
let fire_ratePowerUps = [];
let fire_rangePowerUps = [];
let healthPowerUps = [];
let ammoPowerUps = [];
let powerUpsThatMoved = [];

let lastUpdate = 0;
let quit = false;

// loggedInPlayers is the first place clients are registered, right after logging in.
// inMapScreenClients is the second place clients are registered, right after the game is started (location choice map).
// activeClients are the clients that are in actual gameplay, dead or alive (after being placed on the map as a player). 
let loggedInPlayers = {};
let inMapScreenClients = {};
let activeClients = {};

let MISSILE_SPEED = 3; // In units of player move speed (2 is twice as fast as a player moves normally).
let newMissiles = [];
let activeMissiles = [];
let hits = [];
let nextMissileId = 1;

let users = [];
let hostPressedStart = false;
let numPlayersInChatterBox = 0;
// This is used to begin checking for the win condition of only one player alive, this would get triggered 
//  as soon as the first player entered the game, but this prevents that.
let playersInGamePlay = 0;

// This is to know who is hosting the game and who can start it.
let hostId = 0;

// Just copied variables above to below and commented out the ones that don't need to get reset.
function resetGame(){
    inputQueue = Queue.create();
    map = mapLogic.create();
    map.setMap(mapFile);
    
    shield = Shield.create(map, FIRST_SHIELD_DIAMETER, TIME_TO_MOVE_SHIELD, SHRINK_DOWN_TO, SHIELD_MOVES);
    
    gameHasBegun = false;
    updateShieldInt = 0;
    updateClientInt = 0;
    
    weaponPowerUps.length = 0;
    fire_ratePowerUps.length = 0;
    fire_rangePowerUps.length = 0;
    healthPowerUps.length = 0;
    ammoPowerUps.length = 0;
    powerUpsThatMoved.length = 0;
    
    lastUpdate = 0;
    quit = false;
    
    inMapScreenClients = {};
    activeClients = {};
      
    newMissiles.length = 0;
    activeMissiles.length = 0;
    hits.length = 0;
    nextMissileId = 1;

    users.length = 0;
    hostPressedStart = false;
    numPlayersInChatterBox = 0;

    playersInGamePlay = 0;
    hostId = 0;
}

function createWeaponPowerUp(){
    let newLength = weaponPowerUps.push(PowerUp.create(map, 'weapon'));
    powerUpsThatMoved.push({type: 'weapon', id: newLength-1});
}

function createFireRatePowerUp(){
    let newLength = fire_ratePowerUps.push(PowerUp.create(map, 'fire_rate'));
    powerUpsThatMoved.push({type: 'fire_rate', id: newLength-1});
}

function createFireRangePowerUp(){
    let newLength = fire_rangePowerUps.push(PowerUp.create(map, 'fire_range'));
    powerUpsThatMoved.push({type: 'fire_range', id: newLength-1});
}

function createHealthPowerUp(){
    let newLength = healthPowerUps.push(PowerUp.create(map, 'health'));
    powerUpsThatMoved.push({type: 'health', id: newLength-1});
}

function createAmmoPowerUp(){
    let newLength = ammoPowerUps.push(PowerUp.create(map, 'ammo'));
    powerUpsThatMoved.push({type: 'ammo', id: newLength-1});
}

function updatePowerUps(){
    let numPowerUps = MAX_NUM_PLAYERS_PER_GAME * POWERUPS_PER_PLAYER;
    while(weaponPowerUps.length < numPowerUps){
        createWeaponPowerUp();
    };
    while(fire_ratePowerUps.length < numPowerUps){
        createFireRatePowerUp();
    };
    while(fire_rangePowerUps.length < numPowerUps){
        createFireRangePowerUp();
    };
    while(healthPowerUps.length < numPowerUps/2){
        createHealthPowerUp()
    };
    while(ammoPowerUps.length < numPowerUps){
        createAmmoPowerUp();
    };
}

function createMissile(clientId, playerModel) {
    if(!playerModel.is_alive){
        return;
    }
    if(playerModel.has_gun){
        if(playerModel.firedAShot()){
            let offset = calcXYBulletOffset(playerModel.direction,PLAYER_SIZE);
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
                speed: playerModel.speed * MISSILE_SPEED
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

function update(elapsedTime, currentTime) {
    shield.update(elapsedTime);
    updatePowerUps();

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
                    powerUpsThatMoved.push({type: 'weapon', id: weapon});
                }
            }
        }

        if(!activeClients[clientId].player.has_rapid_fire){
            for(let fire_rate = fire_ratePowerUps.length - 1; fire_rate >= 0; fire_rate-- ){
                if(collided(activeClients[clientId].player,fire_ratePowerUps[fire_rate])){
                    activeClients[clientId].player.has_rapid_fire = true;
                    fire_ratePowerUps[fire_rate].movePowerUp();
                    powerUpsThatMoved.push({type: 'fire_rate', id: fire_rate});
                }
            }
        }
       
        if(!activeClients[clientId].player.has_long_range){
            for(let fire_range = fire_rangePowerUps.length - 1; fire_range >= 0; fire_range-- ){
                if(collided(activeClients[clientId].player,fire_rangePowerUps[fire_range])){
                    activeClients[clientId].player.has_long_range = true;
                    fire_rangePowerUps[fire_range].movePowerUp();
                    powerUpsThatMoved.push({type: 'fire_range', id: fire_range});
                }
            }
        }
      
        if(activeClients[clientId].player.life_remaining < 100){
            for(let health = healthPowerUps.length - 1; health >= 0; health-- ){
                if(collided(activeClients[clientId].player,healthPowerUps[health])){
                    activeClients[clientId].player.foundMedPack();
                    healthPowerUps[health].movePowerUp();
                    powerUpsThatMoved.push({type: 'health', id: health});
                }
            }
        }   

        if(activeClients[clientId].player.ammo_remaining < 100){
            for(let ammo = ammoPowerUps.length - 1; ammo >= 0; ammo-- ){
                if(collided(activeClients[clientId].player,ammoPowerUps[ammo])){
                    activeClients[clientId].player.foundAmmoPack();
                    ammoPowerUps[ammo].movePowerUp();
                    powerUpsThatMoved.push({type: 'ammo', id: ammo});
                }
            }
        }
        activeClients[clientId].player.update(elapsedTime);
    }

    for (let missile = 0; missile < newMissiles.length; ++missile) {
        newMissiles[missile].update(elapsedTime);
    }

    // Preliminary check based on how long the missile should live.
    for (let missile = activeMissiles.length-1; missile >= 0; --missile) {
        if (!activeMissiles[missile].update(elapsedTime)) {
            activeMissiles.splice(missile, 1);
        }
    }
    // Of all the missiles that are still active (ie: their time hasn't expired), keep ones on a valid location.
    for (let missile = activeMissiles.length-1; missile >= 0; --missile) {
        let hit = false;
        if (!map.isValid(activeMissiles[missile].worldCordinates.y, activeMissiles[missile].worldCordinates.x)){
            hit = true;
            //continue;
        }
        for (let clientId in activeClients) {
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
                        worldCordinates: activeClients[clientId].player.worldCordinates
                    });
                }
            }
        }
        if (hit) {
            activeMissiles.splice(missile, 1);
        }
    }
}

function updateClients(elapsedTime) {
    let liveCount = 0;
    let playerCount = 0;

    // For demonstration purposes, network updates run at a slower rate than the game simulation.
    lastUpdate += elapsedTime;
    // // bookmark dont need
    if (lastUpdate < STATE_UPDATE_RATE_MS) {
        return;
    }

    if (updateClientInt%5 === 1){
        if(gameHasBegun){
            for (let clientId in activeClients) {
                let client = activeClients[clientId];       
                playerCount++;
                if(client.player.is_alive){
                    liveCount++;
                }
            }
            //This is to check to see if everyone but one person left after being presented the map, but 
            // before choosing a valid location.
            if (Object.keys(inMapScreenClients).length < 2){
                for (let clientId in activeClients) {
                    let client = activeClients[clientId];
                    client.socket.emit(NetworkIds.GAME_OVER, '');
                }
                updateHighScores();
                quit = true;
            }
            if (playersInGamePlay > 1){
                if(liveCount <= 1 && playerCount > 0){
                    for (let clientId in activeClients) {
                        let client = activeClients[clientId];
                        client.socket.emit(NetworkIds.GAME_OVER, '');
                    }
                    updateHighScores();
                    quit = true;
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

    if (powerUpsThatMoved.length > 0){
        for (let socketId in inMapScreenClients) {
            for (let i = 0; i < powerUpsThatMoved.length; ++i){
                let pUpid = powerUpsThatMoved[i].id;
                let pUp = {id: pUpid};
                if (powerUpsThatMoved[i].type === 'weapon'){
                    pUp.type = 'weapon';
                    pUp.worldCordinates = weaponPowerUps[pUpid].worldCordinates;
                }
                else if (powerUpsThatMoved[i].type === 'fire_rate'){
                    pUp.type = 'fire_rate';
                    pUp.worldCordinates = fire_ratePowerUps[pUpid].worldCordinates
                }
                else if (powerUpsThatMoved[i].type === 'fire_range'){
                    pUp.type = 'fire_range';
                    pUp.worldCordinates = fire_rangePowerUps[pUpid].worldCordinates
                }
                else if (powerUpsThatMoved[i].type === 'health'){
                    pUp.type = 'health';
                    pUp.worldCordinates = healthPowerUps[pUpid].worldCordinates;
                }
                else if (powerUpsThatMoved[i].type === 'ammo'){
                    pUp.type = 'ammo';
                    pUp.worldCordinates = ammoPowerUps[pUpid].worldCordinates;
                }
                inMapScreenClients[socketId].emit(NetworkIds.POWER_UP_LOC, pUp);
            }
        }
        powerUpsThatMoved.length = 0;    
    }

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
                if (isInRange(client.player, activeClients[otherId].player)){
                    activeClients[otherId].socket.emit(NetworkIds.UPDATE_OTHER, update);
                }
                // This is so all the clients are placed somewhere on the map in relation to eachother.
                if (updateClientInt%5 === 0){
                    activeClients[otherId].socket.emit(NetworkIds.UPDATE_OTHER, update);
                }
            }
        }
        
        for (let missile = 0; missile < missileMessages.length; missile++) {
            if (isInRange(client.player, missileMessages[missile])){
                client.socket.emit(NetworkIds.MISSILE_NEW, missileMessages[missile]);
            }
        }
        for (let hit = 0; hit < hits.length; hit++) {
            if (isInRange(client.player, hits[hit])){
                client.socket.emit(NetworkIds.MISSILE_HIT, hits[hit]);
            }
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
    if (quit){
        console.log('Game end condition detected.');
        // Send game stats to each client.
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
            gameStatsOver.sort(function(a, b){return b.score - a.score;});
        }
        for (let clientId in activeClients){
            let socket = activeClients[clientId].socket;
            socket.emit(NetworkIds.SCORE_RES, gameStatsOver);
        }
        console.log('Resetting server game model.');
        resetGame();
    }
    setTimeout(() => {
        let now = present();
        gameLoop(now, now - currentTime);
    }, SIMULATION_UPDATE_RATE_MS);
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
    
    io.on('connection', function(socket) {
        console.log('Connection established: ', socket.id);

        let newPlayerName = '';

        socket.on('host', function(usrn){
            if (hostId === 0){
                hostId = socket.id;
                socket.emit('youAreHost', );
            }
            socket.broadcast.emit('enteredChat', usrn);
        });

        socket.on('hostStartGame', function(){
            if (socket.id === hostId){
                hostPressedStart = true;
            }
        });

        socket.on(NetworkIds.INPUT, data => {
            inputQueue.enqueue({
                clientId: socket.id,
                message: data
            });
        });

        socket.on('inMapScreen',function(){
            inMapScreenClients[socket.id] = socket;
            let seconds_left = 15;
            let interval = setInterval(function() {
                --seconds_left;
                if (seconds_left <= 0){
                    //Time is up for choosing start location, all players left forced 
                    // to join game at random location (the one that was picked for them before).
                    socket.emit('forceGameScreen');
                    clearInterval(interval);
                }
            }, 1000);
        });

        socket.on('isValidStart',function(data){
            let result = map.isValid(data.y,data.x);
            if(result){
                io.sockets.emit('isValidRes', {x: data.x, y: data.y});
                socket.emit('isValidForYou', {result: result, x: data.x, y: data.y});
            }
        });

        socket.on('readyplayerone', function(input){
            playersInGamePlay += 1;
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

        socket.on('disconnect', function() {
            console.log('connection lost: ', socket.id);
            delete inMapScreenClients[socket.id];
            delete activeClients[socket.id];
            delete loggedInPlayers[socket.id];
            notifyDisconnect(socket.id);
            if (socket.id === hostId){
                hostId = 0;
            }
        });

        socket.on('exitedchat', function(data) {
            --numPlayersInChatterBox;
            let index = users.indexOf(data);
            if (index > -1) {
                users.splice(index, 1);
            }
            if (socket.id === hostId){
                hostId = 0;
            }
        });

        socket.on('setUsername', function(data) {
            ++numPlayersInChatterBox;
            users.push(data);
            socket.emit('userSet', {username: data});

            if (hostPressedStart){
                //if (numPlayersInChatterBox >= MAX_NUM_PLAYERS_PER_GAME){
                    console.log('Countdown triggered.');
                    hostPressedStart = true;
                    io.sockets.emit('BeginCountDown');
                    let seconds_left = 15;
                    let intrval = setInterval(function() {
                        --seconds_left;
                        if (seconds_left === 10){
                            gameHasBegun = true;
                        }
                        if (seconds_left <= 0){
                            console.log('Beginning game.');
                            clearInterval(intrval);
                        }
                    }, 1000);
                // }
            }
        });

        socket.on('msg', function(data) {
            //Send message to everyone
            io.sockets.emit('newmsg', data);
            
        });

        socket.on(NetworkIds.HIGH_SCORES, data => {
            let fs = require('fs');
            let obj;
            fs.readFile('../Game/data/highscores.json', 'utf8', function (err, fileData) {
                if (err){
                    console.log(err);
                    throw err;
                }
                socket.emit(NetworkIds.HIGH_SCORES, JSON.parse(fileData));
            });
        });

        socket.on(NetworkIds.VALID_USER, data => {
            if (validUser(data.name, data.password)){
                newPlayerName = data.name;
                loggedInPlayers[socket.id] = data.name;
                socket.emit(NetworkIds.VALID_USER, null);
            } else {
                socket.emit(NetworkIds.INVALID_USER, null);
            }
        });

        socket.on(NetworkIds.VALID_CREATE_USER, data => {
            if (validCreateUser(data.name,data.password)){
                newPlayerName = data.name;
                loggedInPlayers[socket.id] = data.name;
                socket.emit(NetworkIds.VALID_CREATE_USER,null);
            } else {
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
    //Then call the gameloop to start running.
    gameLoop(present(), 0);
}

function validUser(uName,uPassword){
    var obj = JSON.parse(fs.readFileSync('../Game/data/users.json', 'utf8'));
    var valid = false;
    for (var i = 0; i < obj.length; ++i){
        if (obj[i].name === uName && CryptoJS.AES.decrypt(obj[i].password, SALT).toString(CryptoJS.enc.Utf8) === uPassword){
            valid = true;
        }
    }
    let ids = Object.keys(loggedInPlayers);
    for (var i = 0; i < ids.length; ++i){
        if (uName === loggedInPlayers[ids[i]]){
            return false;
        }
    }
    return valid;
}

function validCreateUser(uName,uPassword){ 
    var obj = JSON.parse(fs.readFileSync('../Game/data/users.json', 'utf8'));
    for (var i = 0; i < obj.length; ++i){
        if (obj[i].name === uName){
            return false;
        }
    }

    obj.push({
        name: uName,
        password: CryptoJS.AES.encrypt(uPassword,SALT).toString()
    });
    fs.writeFileSync('../Game/data/users.json',JSON.stringify(obj));

    return true;
}

module.exports.initialize = initialize;
