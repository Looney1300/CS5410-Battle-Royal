/* global Demo */

//------------------------------------------------------------------
//
// Defines an animated model object.  The spec is defined as:
// {
//		spriteSheet: Image,
//		spriteSize: { width: , height: },	// In world coordinates
//		spriteCenter: { x:, y: },			// In world coordinates
//		spriteCount: Number of sprites in the sheet,
//		spriteTime: [array of times (milliseconds) for each frame]
// }
//
//------------------------------------------------------------------
MyGame.components.AnimatedSprite = function(spec) {
	'use strict';
	let frame = 0;
	let	that = {
			get spriteSheet() { return spec.spriteSheet; },
			get pixelWidth() { return spec.spriteSheet.width / spec.spriteCount; },
			get pixelHeight() { return spec.spriteSheet.height; },
			get width() { return spec.spriteSize.width; },
			get height() { return spec.spriteSize.height; },
			get center() { return spec.spriteCenter; },
			get sprite() { return spec.sprite; }
	};
	
	let printCenter = {
		x: 0,
		y: 0
	};

	let worldCordinates = {
		x: spec.spriteCenter.x,
		y: spec.spriteCenter.y
	};

	Object.defineProperty(that, 'printCenter', {
		get: () => printCenter,
		set: cords => {
			printCenter.x = cords.x,
			printCenter.y = cords.y
		}
	});

	Object.defineProperty(that, 'worldCordinates', {
		get: () => worldCordinates,
		set: cords => {
			worldCordinates.x = cords.x;
			worldCordinates.y = cords.y;
		},
	});


	//
	// Initialize the animation of the spritesheet
	spec.sprite = 0;		// Which sprite to start with
	spec.elapsedTime = 0;	// How much time has occured in the animation for the current sprite
	spec.lifetime = 0;
	spec.spriteTime.forEach(item => {
		spec.lifetime += item;
	});

	//------------------------------------------------------------------
	//
	// Update the animation of the sprite based upon elapsed time.
	//
	//------------------------------------------------------------------
	that.update = function(elapsedTime, viewPort) {
		spec.elapsedTime += elapsedTime;
		spec.lifetime -= elapsedTime;

        let diffX = (Math.abs(viewPort.center.x - this.worldCordinates.x))/viewPort.width;
		let diffY = (Math.abs(viewPort.center.y - this.worldCordinates.y))/viewPort.height;
        if (this.worldCordinates.x < viewPort.center.x){
            this.printCenter.x = 0.5 - diffX;
        }
        else {
            this.printCenter.x = 0.5 + diffX;
        }
        if (this.worldCordinates.y < viewPort.center.y) {
            this.printCenter.y = 0.5 - diffY;
        }
        else {
            this.printCenter.y = 0.5 + diffY;
		}
		
		//
		// Check to see if we should update the animation frame
		if (spec.elapsedTime >= spec.spriteTime[spec.sprite]) {
			//
			// When switching sprites, keep the leftover time because
			// it needs to be accounted for the next sprite animation frame.
			spec.elapsedTime -= spec.spriteTime[spec.sprite];
			spec.sprite += 1;
			//
			// This provides wrap around from the last back to the first sprite
			spec.sprite = spec.sprite % spec.spriteCount;
		}

		return spec.lifetime > 0;
	};

	return that;
};
