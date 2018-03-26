//Colors - t denotes the color with transparency (a higher alpha value).
//  To add transparency to a color: 
//      color.addAlpha(color.blue, .7);
let color = {
    addAlpha: function(clr, alpha){
        if (clr.indexOf('a') === -1){
            return 'rgba' + clr.substr(3, clr.length - 4) + ', ' + alpha + ')'
        }
    },
    red: 'rgb(255, 0, 0)',
    orange: 'rgb(255, 128, 0)',
    yellow: 'rgb(255, 255, 0)',
    green: 'rgb(0, 255, 0)',
    blue: 'rgb(0, 0, 255)',
    indigo: 'rgb(0, 128, 255)',
    violet: 'rgb(128, 0, 255)',
    white: 'rgb(255, 255, 255)',
    black: 'rgb(0, 0, 0)',
    random: 'rgb(1,5,3)',

}