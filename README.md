Team Fortday:
Justin Bradshaw
McKade Hermansen
Brigham Michaelis
Landon Henrie


For ease in grading
=====================================

Particle System Location: Game/scripts/client/particles.js

Client Prediction/Entity Interpolation: Game/scripts/client/game.js 
	in function Update
	Line: 520 
	note: shield update prediction is also occuring for optimization purposes.
	Entity: Game/scripts/client/components/player-remote.js 
		Line: 83
	

Server Reconciliation: Game/scripts/client/game.js
	in functions: UpdatePlayerSelf, UpdatePlayerOther
	Line: 224 (update player self) Line: 300 (update player other)
	
	
Personalized Updates to clients:  Game/scripts/server/game.js
	using isInRange function
	Line: 578
	note: only sends updates if a client (enemy player) is within a given range.
	
	
	
	


