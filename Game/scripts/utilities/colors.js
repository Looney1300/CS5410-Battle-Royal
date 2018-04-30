//Colors for the Game to be defined here and used exclusively throughout the game code.
//  To add transparency to a color: 
//      Color.addAlpha(Color.blue, .7);
let Color = {
    addAlpha: function(clr, alpha){
        if (clr.indexOf('a') === -1){
            return 'rgba' + clr.substr(3, clr.length - 4) + ', ' + alpha + ')'
        }
    },

    primary: 'rgb(44, 103, 50)',
    secondary: 'rgb(206, 206, 246)',
    accent: 'rgb(223, 200, 42)',

    red: 'rgb(255, 0, 0)',
    orange: 'rgb(255, 128, 0)',
    yellow: 'rgb(255, 255, 0)',
    green: 'rgb(0, 255, 0)',
    blue: 'rgb(0, 0, 255)',
    indigo: 'rgb(0, 128, 255)',
    violet: 'rgb(128, 0, 255)',
    white: 'rgb(255, 255, 255)',
    black: 'rgb(0, 0, 0)',
    grey: 'rgb(200, 200, 200)',
    brown: 'rgb(53, 47, 29)',
    green_dark: 'rgb(51, 76, 57)',
    red_dark: 'rgb(119, 40, 12)',

};