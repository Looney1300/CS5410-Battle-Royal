BattleRoyal.screens['options'] = (function(game) {
    'use strict';
  
    function initialize() {
        document.getElementById('id-options-back').addEventListener(
            'click',
            function() { game.showScreen('main-menu'); 
        });
    }
  
    function run() {
        console.log('credits running');
    }
  
    return {
        initialize : initialize,
        run : run
    };
  
  }(BattleRoyal.game));