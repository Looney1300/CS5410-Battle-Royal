// ------------------------------------------------------------------
// 
// This is the game object.  Everything about the game is located in 
// this object.
//
// ------------------------------------------------------------------

var MyGame = {};
// ------------------------------------------------------------------
// 
// This is the graphics rendering code for the game preview in the
//  options menu.
//
// ------------------------------------------------------------------
BattleRoyal.graphics = (function() {
	'use strict';
	let canvas = document.getElementById('canvas-keybindings');
	let context = canvas.getContext('2d');
	
	//------------------------------------------------------------------
	//
	// Public method that allows the client code to clear the canvas.
	//
	//------------------------------------------------------------------
	function clear() {
		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.restore();
	}
	
	//------------------------------------------------------------------
	//
	// This is used to create a texture object that can be used by client
	// code for rendering.
	//
	//------------------------------------------------------------------

	function BackGround(spec){
		let that = {};
		let ready = false;
		let image = new Image();
		let center = {x : 300, y : 300}
		let bgx = 0;
		let bgy = 0;

		image.onload = function() {
			ready = true;
		};

		image.src = spec.image;

		that.draw = function() {
			if (ready){
				context.save();
				bgx = center.x - 300;
				bgy = center.y - 300;
				if (bgx < 0) {bgx = 0;}
				if (bgy < 0) {bgy = 0;}
				context.drawImage(
					image,
					bgx,
					bgy,
					600,
					600,
					0,
					0,
					600,
					600);
			}
		};

		that.update = function(player){
			center.x = player.x;
			center.y = player.y;
		}

		return that;
	}

	function Model(spec) {
		let that = {};
		let ready = false;
		let ready2 = false;
		let image = new Image();
		let imagex = 300 - spec.width/2;
		let imagey = 300 - spec.height/2;
		//
		// Load the image, set the ready flag once it is loaded so that
		// rendering can begin.
		image.onload = function() { 
			ready = true;
		};

		image.src = spec.image;

		that.draw = function() {
			if (ready) {
				context.save();
				
				//context.draw
				context.translate(spec.center.x, spec.center.y);
				context.rotate(spec.rotation);
				context.translate(-spec.center.x, -spec.center.y);

				context.drawImage(
					image, 
					imagex,
					imagey,
					spec.width, spec.height);
				
				context.restore();
			}
		};

		that.moveUp = function(elapsedTime) {
			spec.center.y -= (spec.moveRate / 1000) * elapsedTime;
			if (spec.center.y - spec.height/2 < 0) { spec.center.y = spec.height/2; }
			if (spec.center.y < 300 ) { imagey = spec.center.y - spec.height/2; }
		};

		that.moveDown = function(elapsedTime) {
			spec.center.y += (spec.moveRate / 1000) * elapsedTime;
			if (spec.center.y < 300 ) { imagey = spec.center.y - spec.height/2; }
		};

		that.moveLeft = function(elapsedTime) {
			spec.center.x -= (spec.moveRate / 1000) * elapsedTime;
			if (spec.center.x - spec.width/2 < 0) {spec.center.x = spec.width/2;}
			if (spec.center.x < 300 ) { imagex = spec.center.x - spec.width/2; }
		};

		that.moveRight = function(elapsedTime) {
			spec.center.x += (spec.moveRate / 1000) * elapsedTime;
			if (spec.center.x < 300 ) { imagex = spec.center.x - spec.width/2; }
		};

		that.rotateRight = function(elapsedTime) {
			spec.rotation += (spec.rotateRate / 1000) * elapsedTime;
		};

		that.rotateLeft = function(elapsedTime) {
			spec.rotation -= (spec.rotateRate / 1000) * elapsedTime;
		};

		that.getImageCenter = function() {
			return {x : imagex + spec.width/2, y : imagey + spec.height/2};
		}

		that.getMapCenter = function() {
			return {x : spec.center.x, y : spec.center.y};
		}
		
		return that;
	}

	function FOV() {
		let that = {};
		let firstPoint = {x : 250, y : 400};
		let secondPoint = {x : 350, y : 400};
		let center = {x : 300, y : 300};
		let angle = 3 * Math.PI / 2;
		let length = 200;
		let width = .5;

		that.draw = function(player) {
			context.beginPath();
			context.moveTo(center.x, center.y);
			// context.lineTo(firstPoint.x, firstPoint.y);
			// context.lineTo(secondPoint.x, secondPoint.y);
			context.lineTo(center.x + length * Math.cos(angle - width), center.y + length * Math.sin(angle - width));
			context.lineTo(center.x + length * Math.cos(angle + width), center.y + length * Math.sin(angle + width));
			context.closePath();
			context.lineWidth = 5;
			context.strokeStyle = '#666666';
			context.stroke();
		}

		that.move = function(x, y) {
			angle = Math.atan2(y - center.y, x - center.x);
		}

		that.widen = function () {
			if (length > 140){
				length -= 10;
				width += .1;
			}
		}

		that.thin = function() {
			if (length < 230){
				length += 10;
				width -= .1;
			}
		}

		that.update = function(player) {
			center.x = player.x;
			center.y = player.y;
		}

		return that;
	}
	
	return {
		clear : clear,
		BackGround : BackGround,
		Model : Model,
		FOV : FOV
	};
}());