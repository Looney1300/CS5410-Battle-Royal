// ------------------------------------------------------------------
//
// Keyboard input handling support
//
// ------------------------------------------------------------------
MyGame.input.Keyboard = function() {
	'use strict';
	let keys = {},
		keyRepeat = {},
		handlers = {},
		nextHandlerId = 0,
		that = {};

	// ------------------------------------------------------------------
	//
	// Allows the client code to register a keyboard handler.
	//
	// ------------------------------------------------------------------
	that.registerHandler = function(handler, key, repeat, rate) {
		//
		// If no repeat rate was passed in, use a value of 0 so that no delay between
		// repeated keydown events occurs.
		if (rate === undefined) {
			rate = 0;
		}

		//
		// Each entry is an array of handlers to allow multiple handlers per keyboard input
		if (!handlers.hasOwnProperty(key)) {
			handlers[key] = [];
		}
		handlers[key].push({
			id: nextHandlerId,
			key: key,
			repeat: repeat,
			rate: rate,
			elapsedTime: rate,	// Initialize an initial elapsed time so the very first keypress will be valid
			handler: handler
		});

		nextHandlerId += 1;

		//
		// We return an handler id that client code must track if it is desired
		// to unregister the handler in the future.
		return handlers[key][handlers[key].length - 1].id;
	};

	// ------------------------------------------------------------------
	//
	// Allows the client code to unregister a keyboard handler.
	//
	// ------------------------------------------------------------------
	that.unregisterHandler = function(key, id) {
		if (handlers.hasOwnProperty(key)) {
			for (let entry = 0; entry < handlers[key].length; entry += 1) {
				if (handlers[key][entry].id === id) {
					handlers[key].splice(entry, 1);
					break;
				}
			}
		}
	};

	// ------------------------------------------------------------------
	//
	// Called when the 'keydown' event is fired from the browser.  During
	// this handler we record which key caused the event.
	//
	// ------------------------------------------------------------------
	function keyDown(event) {
		keys[event.keyCode] = event.timeStamp;
		//
		// Because we can continuously receive the keyDown event, check to
		// see if we already have this property.  If we do, we don't want to
		// overwrite the value that already exists.
		if (keyRepeat.hasOwnProperty(event.keyCode) === false) {
			keyRepeat[event.keyCode] = false;
		}
	}

	// ------------------------------------------------------------------
	//
	// Called when the 'keyrelease' event is fired from the browser.  When
	// a key is released, we want to remove it from the set of keys currently
	// indicated as down.
	//
	// ------------------------------------------------------------------
	function keyRelease(event) {
		delete keys[event.keyCode];
		delete keyRepeat[event.keyCode];
	}

	// ------------------------------------------------------------------
	//
	// Allows the client to invoke all the handlers for the registered key/handlers.
	//
	// ------------------------------------------------------------------
	that.update = function(elapsedTime) {
		for (let key in keys) {
			if (handlers.hasOwnProperty(key)) {
				for (let entry = 0; entry < handlers[key].length; entry += 1) {
					let event = handlers[key][entry];
					event.elapsedTime += elapsedTime;
					if (event.repeat === true) {
						//
						// Check the rate vs elapsed time for this key before invoking the handler
						if (event.elapsedTime >= event.rate) {
							event.handler(elapsedTime);
							keyRepeat[key] = true;
							//
							// Reset the elapsed time, adding in any extra time beyond the repeat
							// rate that may have accumulated.
							event.elapsedTime = (event.elapsedTime - event.rate);
						}
					} else if (event.repeat === false && keyRepeat[key] === false) {
						event.handler(elapsedTime);
						keyRepeat[key] = true;
					}
				}
			}
		}
	};

	//The button elements text is text of what key pressed,
	// the button.name is the numeric keycode equivalent of the button pressed.
	that.registerNextKeyPress = function(oldKeyElement, handler){
		document.removeEventListener('keydown', keyPress);
		function kd(e){
			delete that.handlers[Number(oldKeyElement.name)];
			oldKeyElement.name = e.keyCode;
			oldKeyElement.innerText = KeyName[e.keyCode];
			that.registerCommand(e.keyCode, handler);
			document.removeEventListener('keydown', kd);
			document.addEventListener('keydown', keyPress);
		};
		document.addEventListener('keydown', kd);

		document.removeEventListener('keyup', keyRelease);
		function ku(e){
			document.removeEventListener('keyup', ku);
			document.addEventListener('keyup', keyRelease);		
		};
		document.addEventListener('keyup', keyRelease);
	}

	//
	// This is how we receive notification of keyboard events.
	document.addEventListener('keydown', keyDown);
	document.addEventListener('keyup', keyRelease);

	return that;
};



// ------------------------------------------------------------------
//
// Allows the client code to register a Mouse s.
//
// ------------------------------------------------------------------
MyGame.input.Mouse = function() {
	let that = {
		mouseDown : [],
		mouseUp : [],
		mouseMove : [],
		handlersDown : [],
		handlersUp : [],
		handlersMove : []
	};

	function mouseDown(e) {
		that.mouseDown.push(e);
	}
	
	function mouseUp(e) {
		that.mouseUp.push(e);
	}
	
	function mouseMove(e) {
		that.mouseMove.push(e);
	}
	
	that.update = function(elapsedTime) {
		let event;
		let handler;

		//
		// Process the mouse events for each of the different kinds of handlers
		for (event = 0; event < that.mouseDown.length; event++) {
			for (handler = 0; handler < that.handlersDown.length; handler++) {
				that.handlersDown[handler](that.mouseDown[event], elapsedTime);
			}
		}
		
		for (event = 0; event < that.mouseUp.length; event++) {
			for (handler = 0; handler < that.handlersUp.length; handler++) {
				that.handlersUp[handler](that.mouseUp[event], elapsedTime);
			}
		}
		
		for (event = 0; event < that.mouseMove.length; event++) {
			for (handler = 0; handler < that.handlersMove.length; handler++) {
				that.handlersMove[handler](that.mouseMove[event], elapsedTime);
			}
		}
		
		//
		// Now that we have processed all the inputs, reset everything back to the empty state
		that.mouseDown.length = 0;
		that.mouseUp.length = 0;
		that.mouseMove.length = 0;
	};
	
	that.registerCommand = function(type, handler) {
		if (type === 'mousedown') {
			that.handlersDown.push(handler);
		}
		else if (type === 'mouseup') {
			that.handlersUp.push(handler);
		}
		else if (type === 'mousemove') {
			that.handlersMove.push(handler);
		}
	};
	
	document.addEventListener('mousedown', mouseDown);
	document.addEventListener('mouseup', mouseUp);
	document.addEventListener('mousemove', mouseMove);
	
	return that;

}

//------------------------------------------------------------------
//
// Source: http://stackoverflow.com/questions/1465374/javascript-event-keycode-constants
//
//------------------------------------------------------------------
MyGame.input.KeyEvent = (function() {
	'use strict';
	let that = {
		get DOM_VK_CANCEL() { return 3; },
		get DOM_VK_HELP() { return 6; },
		get DOM_VK_BACK_SPACE() { return 8; },
		get DOM_VK_TAB() { return 9; },
		get DOM_VK_CLEAR() { return 12; },
		get DOM_VK_RETURN() { return 13; },
		get DOM_VK_ENTER() { return 14; },
		get DOM_VK_SHIFT() { return 16; },
		get DOM_VK_CONTROL() { return 17; },
		get DOM_VK_ALT() { return 18; },
		get DOM_VK_PAUSE() { return 19; },
		get DOM_VK_CAPS_LOCK() { return 20; },
		get DOM_VK_ESCAPE() { return 27; },
		get DOM_VK_SPACE() { return 32; },
		get DOM_VK_PAGE_UP() { return 33; },
		get DOM_VK_PAGE_DOWN() { return 34; },
		get DOM_VK_END() { return 35; },
		get DOM_VK_HOME() { return 36; },
		get DOM_VK_LEFT() { return 37; },
		get DOM_VK_UP() { return 38; },
		get DOM_VK_RIGHT() { return 39; },
		get DOM_VK_DOWN() { return 40; },
		get DOM_VK_PRINTSCREEN() { return 44; },
		get DOM_VK_INSERT() { return 45; },
		get DOM_VK_DELETE() { return 46; },
		get DOM_VK_0() { return 48; },
		get DOM_VK_1() { return 49; },
		get DOM_VK_2() { return 50; },
		get DOM_VK_3() { return 51; },
		get DOM_VK_4() { return 52; },
		get DOM_VK_5() { return 53; },
		get DOM_VK_6() { return 54; },
		get DOM_VK_7() { return 55; },
		get DOM_VK_8() { return 56; },
		get DOM_VK_9() { return 57; },
		get DOM_VK_SEMICOLON() { return 59; },
		get DOM_VK_EQUALS() { return 61; },
		get DOM_VK_A() { return 65; },
		get DOM_VK_B() { return 66; },
		get DOM_VK_C() { return 67; },
		get DOM_VK_D() { return 68; },
		get DOM_VK_E() { return 69; },
		get DOM_VK_F() { return 70; },
		get DOM_VK_G() { return 71; },
		get DOM_VK_H() { return 72; },
		get DOM_VK_I() { return 73; },
		get DOM_VK_J() { return 74; },
		get DOM_VK_K() { return 75; },
		get DOM_VK_L() { return 76; },
		get DOM_VK_M() { return 77; },
		get DOM_VK_N() { return 78; },
		get DOM_VK_O() { return 79; },
		get DOM_VK_P() { return 80; },
		get DOM_VK_Q() { return 81; },
		get DOM_VK_R() { return 82; },
		get DOM_VK_S() { return 83; },
		get DOM_VK_T() { return 84; },
		get DOM_VK_U() { return 85; },
		get DOM_VK_V() { return 86; },
		get DOM_VK_W() { return 87; },
		get DOM_VK_X() { return 88; },
		get DOM_VK_Y() { return 89; },
		get DOM_VK_Z() { return 90; },
		get DOM_VK_CONTEXT_MENU() { return 93; },
		get DOM_VK_NUMPAD0() { return 96; },
		get DOM_VK_NUMPAD1() { return 97; },
		get DOM_VK_NUMPAD2() { return 98; },
		get DOM_VK_NUMPAD3() { return 99; },
		get DOM_VK_NUMPAD4() { return 100; },
		get DOM_VK_NUMPAD5() { return 101; },
		get DOM_VK_NUMPAD6() { return 102; },
		get DOM_VK_NUMPAD7() { return 103; },
		get DOM_VK_NUMPAD8() { return 104; },
		get DOM_VK_NUMPAD9() { return 105; },
		get DOM_VK_MULTIPLY() { return 106; },
		get DOM_VK_ADD() { return 107; },
		get DOM_VK_SEPARATOR() { return 108; },
		get DOM_VK_SUBTRACT() { return 109; },
		get DOM_VK_DECIMAL() { return 110; },
		get DOM_VK_DIVIDE() { return 111; },
		get DOM_VK_F1() { return 112; },
		get DOM_VK_F2() { return 113; },
		get DOM_VK_F3() { return 114; },
		get DOM_VK_F4() { return 115; },
		get DOM_VK_F5() { return 116; },
		get DOM_VK_F6() { return 117; },
		get DOM_VK_F7() { return 118; },
		get DOM_VK_F8() { return 119; },
		get DOM_VK_F9() { return 120; },
		get DOM_VK_F10() { return 121; },
		get DOM_VK_F11() { return 122; },
		get DOM_VK_F12() { return 123; },
		get DOM_VK_F13() { return 124; },
		get DOM_VK_F14() { return 125; },
		get DOM_VK_F15() { return 126; },
		get DOM_VK_F16() { return 127; },
		get DOM_VK_F17() { return 128; },
		get DOM_VK_F18() { return 129; },
		get DOM_VK_F19() { return 130; },
		get DOM_VK_F20() { return 131; },
		get DOM_VK_F21() { return 132; },
		get DOM_VK_F22() { return 133; },
		get DOM_VK_F23() { return 134; },
		get DOM_VK_F24() { return 135; },
		get DOM_VK_NUM_LOCK() { return 144; },
		get DOM_VK_SCROLL_LOCK() { return 145; },
		get DOM_VK_COMMA() { return 188; },
		get DOM_VK_PERIOD() { return 190; },
		get DOM_VK_SLASH() { return 191; },
		get DOM_VK_BACK_QUOTE() { return 192; },
		get DOM_VK_OPEN_BRACKET() { return 219; },
		get DOM_VK_BACK_SLASH() { return 220; },
		get DOM_VK_CLOSE_BRACKET() { return 221; },
		get DOM_VK_QUOTE() { return 222; },
		get DOM_VK_META() { return 224; }
	};

	return that;
}());

MyGame.input.KeyName = (function(){
	'use strict';
	let that = {
		CANCEL: 3,
		HELP: 6,
		BACK_SPACE: 8,
		TAB: 9,
		CLEAR: 12,
		RETURN: 13,
		ENTER: 14,
		SHIFT: 16,
		CONTROL: 17,
		ALT: 18,
		PAUSE: 19,
		CAPS_LOCK: 20,
		ESCAPE: 27,
		SPACE: 32,
		PAGE_UP: 33,
		PAGE_DOWN: 34,
		END: 35,
		HOME: 36,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		PRINTSCREEN: 44,
		INSERT: 45,
		DELETE: 46,
		0: 48,
		1: 49,
		2: 50,
		3: 51,
		4: 52,
		5: 53,
		6: 54,
		7: 55,
		8: 56,
		9: 57,
		SEMICOLON: 59,
		EQUALS: 61,
		A: 65,
		B: 66,
		C: 67,
		D: 68,
		E: 69,
		F: 70,
		G: 71,
		H: 72,
		I: 73,
		J: 74,
		K: 75,
		L: 76,
		M: 77,
		N: 78,
		O: 79,
		P: 80,
		Q: 81,
		R: 82,
		S: 83,
		T: 84,
		U: 85,
		V: 86,
		W: 87,
		X: 88,
		Y: 89,
		Z: 90,
		CONTEXT_MENU: 93,
		NUMPAD0: 96,
		NUMPAD1: 97,
		NUMPAD2: 98,
		NUMPAD3: 99,
		NUMPAD4: 100,
		NUMPAD5: 101,
		NUMPAD6: 102,
		NUMPAD7: 103,
		NUMPAD8: 104,
		NUMPAD9: 105,
		MULTIPLY: 106,
		ADD: 107,
		SEPARATOR: 108,
		SUBTRACT: 109,
		DECIMAL: 110,
		DIVIDE: 111,
		F1: 112,
		F2: 113,
		F3: 114,
		F4: 115,
		F5: 116,
		F6: 117,
		F7: 118,
		F8: 119,
		F9: 120,
		F10: 121,
		F11: 122,
		F12: 123,
		F13: 124,
		F14: 125,
		F15: 126,
		F16: 127,
		F17: 128,
		F18: 129,
		F19: 130,
		F20: 131,
		F21: 132,
		F22: 133,
		F23: 134,
		F24: 135,
		NUM_LOCK: 144,
		SCROLL_LOCK: 145,
		COMMA: 188,
		PERIOD: 190,
		SLASH: 191,
		BACK_QUOTE: 192,
		OPEN_BRACKET: 219,
		BACK_SLASH: 220,
		CLOSE_BRACKET: 221,
		QUOTE: 222,
		META: 224
	};

	return that;
}());
