// ------------------------------------------------------------------
//
// Shared module between Nodejs and the browser that defines constants
// used for network communication.
//
// The use of the IIFE is to create a module that works on both the server
// and the client.
// Reference for this idea: https://caolan.org/posts/writing_for_node_and_the_browser.html
//
// ------------------------------------------------------------------
(function(exports) {
    'use strict';

    Object.defineProperties(exports, {
        'INPUT': {
            value: 'input',
            writable: false
        },
        'INPUT_MOVE': {
            value: 'move',
            writable: false
        },
        'INPUT_MOVE_UP': {
            value: 'move-up',
            writable: false
        },
        'INPUT_MOVE_LEFT': {
            value: 'move-left',
            writable: false
        },
        'INPUT_MOVE_RIGHT': {
            value: 'move-right',
            writable: false
        },
        'INPUT_MOVE_DOWN': {
            value: 'move-down',
            writable: false
        },
        'INPUT_ROTATE_LEFT': {
            value: 'rotate-left',
            writable: false
        },
        'INPUT_ROTATE_RIGHT': {
            value: 'rotate-right',
            writable: false
        },
        'INPUT_FIRE': {
            value: 'fire',
            writable: false
        },
        'INPUT_RAPIDFIRE': {
            value: 'rapid-fire',
            writable: false
        },
        'INPUT_SPRINT': {
            value: 'sprint',
            writable: false
        },
        'MOUSE_MOVE': {
            value: 'mouse-move',
            writable: false
        },
        'CONNECT_ACK': {
            value: 'connect-ack',
            writable: false
        },
        'CONNECT_OTHER': {
            value: 'connect-other',
            writable: false
        },
        'DISCONNECT_OTHER': {
            value: 'disconnect-other',
            writable: false
        },
        'UPDATE_SELF': {
            value: 'update-self',
            writable: false
        },
        'UPDATE_OTHER': {
            value: 'update-other',
            writable: false
        },
        'MISSILE_NEW': {
            value: 'missile-new',
            writable: false
        },
        'MISSILE_HIT': {
            value: 'missile-hit',
            writable: false
        },
        'HIGH_SCORES' : {
            value: 'high-scores',
            writeable: false
        },
        'VALID_USER' : {
            value: 'valid-user',
            writable: false
        },
        'INVALID_USER' : {
            value: 'invalid-user',
            writable: false
        },
        'INVALID_CREATE_USER' : {
            value: 'invalid-create-user',
            writeable: false
        },
        'VALID_CREATE_USER' : {
            value: 'valid-create-user',
            writable: false
        },
        'POWER_UP_LOC' : {
            value: 'power-up-location',
            writable: false
        },
        
    });

})(typeof exports === 'undefined' ? this['NetworkIds'] = {} : exports);
