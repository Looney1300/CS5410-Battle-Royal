BattleRoyal.input = (function() {

	function Mouse() {
		
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
	
	window.addEventListener('mousedown', mouseDown);
	window.addEventListener('mouseup', mouseUp);
	window.addEventListener('mousemove', mouseMove);
	
	return that;

	}

	function Keyboard() {
		let that = {
			keys: {},
			handlers: {}
		};

		that.registerCommand = function(key, handler) {
			that.handlers[key] = handler;
		};

		function keyPress(e) {
			that.keys[e.keyCode] = e.timeStamp;
		}

		function keyRelease(e) {
			delete that.keys[e.keyCode];
		}

		that.processInput = function(elapsedTime) {
			for (let key in that.keys) {
				if (that.keys.hasOwnProperty(key)) {
					if (that.handlers[key]) {
						that.handlers[key](elapsedTime);
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

		document.addEventListener('keydown', keyPress);
		document.addEventListener('keyup', keyRelease);

		return that;
	}

	return {
		Keyboard: Keyboard,
		Mouse : Mouse
	};
})();


//------------------------------------------------------------------
//
// Source: http://stackoverflow.com/questions/1465374/javascript-event-keycode-constants
//
//------------------------------------------------------------------
if (typeof KeyEvent === 'undefined') {
	var KeyEvent = {
		DOM_VK_CANCEL: 3,
		DOM_VK_HELP: 6,
		DOM_VK_BACK_SPACE: 8,
		DOM_VK_TAB: 9,
		DOM_VK_CLEAR: 12,
		DOM_VK_RETURN: 13,
		DOM_VK_ENTER: 14,
		DOM_VK_SHIFT: 16,
		DOM_VK_CONTROL: 17,
		DOM_VK_ALT: 18,
		DOM_VK_PAUSE: 19,
		DOM_VK_CAPS_LOCK: 20,
		DOM_VK_ESCAPE: 27,
		DOM_VK_SPACE: 32,
		DOM_VK_PAGE_UP: 33,
		DOM_VK_PAGE_DOWN: 34,
		DOM_VK_END: 35,
		DOM_VK_HOME: 36,
		DOM_VK_LEFT: 37,
		DOM_VK_UP: 38,
		DOM_VK_RIGHT: 39,
		DOM_VK_DOWN: 40,
		DOM_VK_PRINTSCREEN: 44,
		DOM_VK_INSERT: 45,
		DOM_VK_DELETE: 46,
		DOM_VK_0: 48,
		DOM_VK_1: 49,
		DOM_VK_2: 50,
		DOM_VK_3: 51,
		DOM_VK_4: 52,
		DOM_VK_5: 53,
		DOM_VK_6: 54,
		DOM_VK_7: 55,
		DOM_VK_8: 56,
		DOM_VK_9: 57,
		DOM_VK_SEMICOLON: 59,
		DOM_VK_EQUALS: 61,
		DOM_VK_A: 65,
		DOM_VK_B: 66,
		DOM_VK_C: 67,
		DOM_VK_D: 68,
		DOM_VK_E: 69,
		DOM_VK_F: 70,
		DOM_VK_G: 71,
		DOM_VK_H: 72,
		DOM_VK_I: 73,
		DOM_VK_J: 74,
		DOM_VK_K: 75,
		DOM_VK_L: 76,
		DOM_VK_M: 77,
		DOM_VK_N: 78,
		DOM_VK_O: 79,
		DOM_VK_P: 80,
		DOM_VK_Q: 81,
		DOM_VK_R: 82,
		DOM_VK_S: 83,
		DOM_VK_T: 84,
		DOM_VK_U: 85,
		DOM_VK_V: 86,
		DOM_VK_W: 87,
		DOM_VK_X: 88,
		DOM_VK_Y: 89,
		DOM_VK_Z: 90,
		DOM_VK_CONTEXT_MENU: 93,
		DOM_VK_NUMPAD0: 96,
		DOM_VK_NUMPAD1: 97,
		DOM_VK_NUMPAD2: 98,
		DOM_VK_NUMPAD3: 99,
		DOM_VK_NUMPAD4: 100,
		DOM_VK_NUMPAD5: 101,
		DOM_VK_NUMPAD6: 102,
		DOM_VK_NUMPAD7: 103,
		DOM_VK_NUMPAD8: 104,
		DOM_VK_NUMPAD9: 105,
		DOM_VK_MULTIPLY: 106,
		DOM_VK_ADD: 107,
		DOM_VK_SEPARATOR: 108,
		DOM_VK_SUBTRACT: 109,
		DOM_VK_DECIMAL: 110,
		DOM_VK_DIVIDE: 111,
		DOM_VK_F1: 112,
		DOM_VK_F2: 113,
		DOM_VK_F3: 114,
		DOM_VK_F4: 115,
		DOM_VK_F5: 116,
		DOM_VK_F6: 117,
		DOM_VK_F7: 118,
		DOM_VK_F8: 119,
		DOM_VK_F9: 120,
		DOM_VK_F10: 121,
		DOM_VK_F11: 122,
		DOM_VK_F12: 123,
		DOM_VK_F13: 124,
		DOM_VK_F14: 125,
		DOM_VK_F15: 126,
		DOM_VK_F16: 127,
		DOM_VK_F17: 128,
		DOM_VK_F18: 129,
		DOM_VK_F19: 130,
		DOM_VK_F20: 131,
		DOM_VK_F21: 132,
		DOM_VK_F22: 133,
		DOM_VK_F23: 134,
		DOM_VK_F24: 135,
		DOM_VK_NUM_LOCK: 144,
		DOM_VK_SCROLL_LOCK: 145,
		DOM_VK_COMMA: 188,
		DOM_VK_PERIOD: 190,
		DOM_VK_SLASH: 191,
		DOM_VK_BACK_QUOTE: 192,
		DOM_VK_OPEN_BRACKET: 219,
		DOM_VK_BACK_SLASH: 220,
		DOM_VK_CLOSE_BRACKET: 221,
		DOM_VK_QUOTE: 222,
		DOM_VK_META: 224
	};
}
if (typeof KeyName === 'undefined') {
	var KeyName = {
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
}