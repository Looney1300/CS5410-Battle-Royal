// ------------------------------------------------------------------
//
// Provides some utility functions to generate different kinds of random numbers.
//
// ------------------------------------------------------------------
'use strict';
//
// This is used to give a small performance optimization in generating gaussian random numbers.
let usePrevious = false,
    y2 = 0;

// ------------------------------------------------------------------
//
// Generate a uniformly selected random number
//
// ------------------------------------------------------------------ 
function nextDouble() {
    return Math.random();
}

// ------------------------------------------------------------------
//
// Get a valid x and y cordinate on the map
//
// ------------------------------------------------------------------ 
function getRandomMapCords(map, rowLimit, colLimit){
    let cords = {
        x: Math.floor(Math.random() * colLimit),
        y: Math.floor(Math.random() * rowLimit)
    }
    let tileRow, tileCol;
    while(true){
        tileCol = Math.floor(cords.x / map.tileWidth);
        tileRow = Math.floor(cords.y / map.tileHeight);
        if (map.map[tileRow][tileCol] == 1){
            return cords;
        }
        cords = {
            x: Math.floor(Math.random() * colLimit),
            y: Math.floor(Math.random() * rowLimit)
        }
    }
    return Math.floor(Math.random() * limit);
}

// ------------------------------------------------------------------
//
// Generate a uniformly selected random 'integer' within the range [min, max].
//
// ------------------------------------------------------------------
function nextRange(min, max) {
    let range = max - min + 1;

    return Math.floor((Math.random() * range) + min);
}

// ------------------------------------------------------------------
//
// Generate a uniformly selected random floats within the range [min, max].
//
// ------------------------------------------------------------------
function nextRangeFloat(min, max) {
    let range = max - min;

    return (Math.random() * range) + min;
}

// ------------------------------------------------------------------
//
// Generate a uniformly selected vector (x,y) around the circumference of a
// unit circle.
//
// ------------------------------------------------------------------
function nextCircleVector(scale) {
    let angle = Math.random() * 2 * Math.PI;

    return {
        x: Math.cos(angle) * scale,
        y: Math.sin(angle) * scale
    };
}

// ------------------------------------------------------------------
//
// Generate a normally distributed random number.
//
// NOTE: This code is adapted from a wiki reference I found a long time ago.  I originally
// wrote the code in C# and am now converting it over to JavaScript.
//
// ------------------------------------------------------------------
function nextGaussian(mean, stdDev) {
    let x1 = 0,
        x2 = 0,
        y1 = 0,
        z = 0;

    //
    // This is our early out optimization.  Every other time this function is called
    // the number is quickly selected.
    if (usePrevious) {
        usePrevious = false;

        return mean + y2 * stdDev;
    }

    usePrevious = true;

    do {
        x1 = 2 * Math.random() - 1;
        x2 = 2 * Math.random() - 1;
        z = (x1 * x1) + (x2 * x2);
    } while (z >= 1);

    z = Math.sqrt((-2 * Math.log(z)) / z);
    y1 = x1 * z;
    y2 = x2 * z;

    return mean + y1 * stdDev;
}


// ------------------------------------------------------------------
//
// Generate a normally distributed vector (x,y) around the angle 
// in a unit circle: angle in radians, deviation in standard deviations.
//
// ------------------------------------------------------------------
function nextCircleVectorAround(scale, angle, deviation) {
    let angle1 = nextGaussian(angle, deviation);
    return {
        x: Math.cos(angle1) * scale,
        y: Math.sin(angle1) * scale
    };
}

module.exports.nextDouble = nextDouble;
module.exports.nextRange = nextRange;
module.exports.nextRangeFloat = nextRangeFloat;
module.exports.nextCircleVector = nextCircleVector;
module.exports.nextGaussian = nextGaussian;
module.exports.nextCircleVectorAround = nextCircleVectorAround;
module.exports.getRandomMapCords = getRandomMapCords;
