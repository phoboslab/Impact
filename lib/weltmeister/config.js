ig.module(
	'weltmeister.config'
)
.defines(function(){ "use strict";

wm.config = {
	
	project: {
		// The prefix path of your game's source code. You only have to change
		// this if you use the 'ImpactPrefix' in your dev environment.
		'modulePath': 'lib/',
		
		// This "glob" tells Weltmeister where to load the entity files
		// from. If you want to load entities from several directories,
		// you can specify an array here. E.g.:
		// 'entityFiles': ['lib/game/powerups/*.js', 'lib/game/entities/*.js']
		'entityFiles': 'lib/game/entities/*.js',
		
		// The default path for the level file selection box
		'levelPath': 'lib/game/levels/',
		
		// Whether to save levels as plain JSON or wrapped in a module. If
		// you want to load levels asynchronously via AJAX, saving as plain
		// JSON can be helpful.
		'outputFormat': 'module', // 'module' or 'json'
		
		// Whether to pretty print the JSON data in level files. If you have
		// any issues with your levels, it's usually a good idea to turn this
		// on and look at the saved level files with a text editor.
		'prettyPrint': true
	},
	
	
	// Plugins for Weltmeister: an array of module names to load
	plugins: [],
	
	
	// Default settings when creating new layers in Weltmeister. Change these
	// as you like
	'layerDefaults': {
		'width': 30,
		'height': 20,
		'tilesize': 8
	},
	
	// Whether to ask before closing Weltmeister when there are unsaved changes
	'askBeforeClose': true,
	
	// Whether to attempt to load the last opened level on startup
	'loadLastLevel': true,
	
	// Size of the "snap" grid when moving entities
	'entityGrid': 4,
	
	// Number of undo levels. You may want to increase this if you use 'undo'
	// frequently.
	'undoLevels': 50,
	
	// Mouse and Key bindings in Weltmeister. Some function are bound to
	// several keys. See the documentation of ig.Input for a list of available
	// key names.
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

	// Whether to enable unidirectional scrolling for touchpads; this
	// automatically unbinds the MWHEEL_UP and MWHEEL_DOWN actions.
	'touchScroll': false,
	
	// View settings. You can change the default Zoom level and whether
	// to show the grid on startup here.
	'view': {
		'zoom': 1,
		'zoomMax': 4,
		'zoomMin': 0.125,
		'grid': false
	},
	
	// Font face and size for entity labels and the grid coordinates
	'labels': {
		'draw': true,
		'step': 32,
		'font': '10px Bitstream Vera Sans Mono, Monaco, sans-serif'
	},
	
	// Colors to use for the background, selection boxes, text and the grid
	'colors': {
		'clear': '#000000',		// Background Color
		'highlight': '#ceff36',	// Currently selected tile or entity
		'primary': '#ffffff', 	// Labels and layer bounds
		'secondary': '#555555', // Grid and tile selection bounds
		'selection': '#ff9933'	// Selection cursor box on tile maps
	},
	
	// Settings for the Collision tiles. You shouldn't need to change these.
	// The tilesize only specifies the size in the image - resizing to final
	// size for each layer happens in Weltmeister.
	'collisionTiles': {
		'path': 'lib/weltmeister/collisiontiles-64.png',
		'tilesize': 64
	},
	
	// API paths for saving levels and browsing directories. If you use a
	// different backend (i.e. not the official PHP backend), you may have
	// to change these.
	'api': {
		'save': 'lib/weltmeister/api/save.php',
		'browse': 'lib/weltmeister/api/browse.php',
		'glob': 'lib/weltmeister/api/glob.php'
	}
};

});