ig.module(
	'weltmeister.config'
)
.defines(function(){ "use strict";

wm.config = {
	project: {
		'modulePath': 'lib/',
		'entityFiles': 'lib/game/entities/*.js',
		'levelPath': 'lib/game/levels/',
		'outputFormat': 'module', // 'module' or 'json'
		'prettyPrint': false
	},
	
	'layerDefaults': {
		'width': 30,
		'height': 20,
		'tilesize': 8
	},
	
	'askBeforeClose': true,
	'loadLastLevel': true,
	
	'entityGrid': 4,
	'undoLevels': 50,
	
	'binds': {
		'MOUSE1': 'draw',
		'MOUSE2': 'drag',
		'SHIFT': 'select',
		'CTRL': 'drag',
		'SPACE': 'menu',
		'DELETE': 'delete',
		'BACKSPACE': 'delete',
		'G': 'grid',
		'C': 'clone',
		'Z': 'undo',
		'Y': 'redo',
		'MWHEEL_UP': 'zoomin',
		'PLUS': 'zoomin',
		'MWHEEL_DOWN': 'zoomout',
		'MINUS': 'zoomout'
	},
	
	'view': {
		'zoom': 1,
		'zoomMax': 4,
		'zoomMin': 0.125,
		'grid': false
	},
	
	'labels': {
		'draw': true,
		'step': 32,
		'font': '10px Bitstream Vera Sans Mono, Monaco, sans-serif'
	},
	
	'colors': {
		'clear': '#000000',
		'highlight': '#ceff36',
		'primary': '#ffffff',
		'secondary': '#555555',
		'selection': '#ff9933'
	},
	
	'collisionTiles': {
		'path': 'lib/weltmeister/collisiontiles-64.png',
		'tilesize': 64
	},
	
	'api': {
		'save': 'lib/weltmeister/api/save.php',
		'browse': 'lib/weltmeister/api/browse.php',
		'glob': 'lib/weltmeister/api/glob.php'
	}
};

});