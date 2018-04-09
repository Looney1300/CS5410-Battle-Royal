//Colors for the Game to be defined here and used exclusively throughout the game code.
//  To add transparency to a color: 
//      Color.addAlpha(Color.blue, .7);
let Color = {
    addAlpha: function(clr, alpha){
        if (clr.indexOf('a') === -1){
            return 'rgba' + clr.substr(3, clr.length - 4) + ', ' + alpha + ')'
        }
    },

    primary: 'rgb(50, 155, 50)',
    secondary: 'rgb(110, 50, 5)',
    accent: 'rgb(255, 0, 0)',

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
    brown: 'rgba(110, 50, 5)',

}