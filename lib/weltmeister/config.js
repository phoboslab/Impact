ig.module(
	'weltmeister.config'
)
.defines(function(){

wm.config = {
	project: {
		'modulePath': 'lib/',
		'entityFiles': 'lib/game/entities/*.js',
		'levelPath': 'lib/game/levels/',
		'outputFormat': 'module' // 'module' or 'json'
	},
	
	'layerDefaults': {
		'width': 30,
		'height': 20,
		'tilesize': 8
	},
	
	'entityGrid': 4,
	'undoLevels': 50,
	
	'binds': {
		'MOUSE1': 'draw',
		'MOUSE2': 'drag',
		'CTRL': 'drag',
		'SPACE': 'menu',
		'DELETE': 'delete',
		'BACKSPACE': 'delete',
		'C': 'clone',
		'Z': 'undo',
		'Y': 'redo'
	},
	
	'view': {
		'width': 800,
		'height': 600,
		'zoom': 2
	},
	
	'labels': {
		'draw': true,
		'step': 32,
		'font': '10px Arial'
	},
	
	'colors': {
		'clear': '#000000',
		'highlight': '#ceff36',
		'primary': '#ffffff',
		'secondary': '#555555'
	},
	
	'api': {
		'save': 'lib/weltmeister/api/save.php',
		'browse': 'lib/weltmeister/api/browse.php',
		'glob': 'lib/weltmeister/api/glob.php'
	}
};

});