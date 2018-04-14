MyGame.persistence = (function () {
    'use strict';
    
    var keyBindings = {},
        previousKeyBindings = localStorage.getItem('MyGame.keyBindings');

    if (previousKeyBindings !== null) {
        keyBindings = JSON.parse(previousKeyBindings);
    }

    function add(key, value) {
        keyBindings[key] = value;
        localStorage['MyGame.keyBindings'] = JSON.stringify(keyBindings);
    }

    function remove(key) {
        delete keyBindings[key];
        localStorage['MyGame.keyBindings'] = JSON.stringify(keyBindings);
    }

    function retrieveHighScores() {   
        let keys = {};
        for (let value in keyBindings){
            Object.defineProperty(keys, value, {
                value: Number(keyBindings[value])
            });
        }
        return keys;
    }

    return {
        add : add,
        remove : remove,
        retrieveKeyBindings : retrieveHighScores
    };
}());