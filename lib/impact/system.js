ig.module(
	'impact.system'
)
.requires(
	'impact.timer',
	'impact.image'
)
.defines(function(){ "use strict";

ig.System = ig.Class.extend({
	fps: 30,
	width: 320,
	height: 240,
	realWidth: 320,
	realHeight: 240,
	scale: 1,
	
	tick: 0,
	animationId: 0,
	newGameClass: null,
	running: false,
	
	delegate: null,
	clock: null,
	canvas: null,
	context: null,
	
	init: function( canvasId, fps, width, height, scale ) {
		this.fps = fps;
		
		this.clock = new ig.Timer();
		this.canvas = ig.$(canvasId);
		this.resize( width, height, scale );
		this.context = this.canvas.getContext('2d');
		
		this.getDrawPos = ig.System.drawMode;

		// Automatically switch to crisp scaling when using a scale
		// other than 1
		if( this.scale != 1 ) {
			ig.System.scaleMode = ig.System.SCALE.CRISP;
		}
		ig.System.scaleMode( this.canvas, this.context );
	},
	
	
	resize: function( width, height, scale ) {
		this.width = width;
		this.height = height;
		this.scale = scale || this.scale;
		
		this.realWidth = this.width * this.scale;
		this.realHeight = this.height * this.scale;
		this.canvas.width = this.realWidth;
		this.canvas.height = this.realHeight;
	},
	
	
	setGame: function( gameClass ) {
		if( this.running ) {
			this.newGameClass = gameClass;
		}
		else {
			this.setGameNow( gameClass );
		}
	},
	
	
	setGameNow: function( gameClass ) {
		ig.game = new (gameClass)();	
		ig.system.setDelegate( ig.game );
	},
	
	
	setDelegate: function( object ) {
		if( typeof(object.run) == 'function' ) {
			this.delegate = object;
			this.startRunLoop();
		} else {
			throw( 'System.setDelegate: No run() function in object' );
		}
	},
	
	
	stopRunLoop: function() {
		ig.clearAnimation( this.animationId );
		this.running = false;
	},
	
	
	startRunLoop: function() {
		this.stopRunLoop();
		this.animationId = ig.setAnimation( this.run.bind(this) );
		this.running = true;
	},
	
	
	clear: function( color ) {
		this.context.fillStyle = color;
		this.context.fillRect( 0, 0, this.realWidth, this.realHeight );
	},
	
	
	run: function() {
		ig.Timer.step();
		this.tick = this.clock.tick();
		
		this.delegate.run();
		ig.input.clearPressed();
		
		if( this.newGameClass ) {
			this.setGameNow( this.newGameClass );
			this.newGameClass = null;
		}
	},
	
	
	getDrawPos: null // Set through constructor
});

ig.System.DRAW = {
	AUTHENTIC: function( p ) { return Math.round(p) * this.scale; },
	SMOOTH: function( p ) { return Math.round(p * this.scale); },
	SUBPIXEL: function( p ) { return p * this.scale; }
};
ig.System.drawMode = ig.System.DRAW.SMOOTH;

ig.System.SCALE = {
	CRISP: function( canvas, context ) {
		ig.setVendorAttribute( context, 'imageSmoothingEnabled', false );
		canvas.style.imageRendering = '-moz-crisp-edges';
		canvas.style.imageRendering = '-o-crisp-edges';
		canvas.style.imageRendering = '-webkit-optimize-contrast';
		canvas.style.imageRendering = 'crisp-edges';
		canvas.style.msInterpolationMode = 'nearest-neighbor'; // No effect on Canvas :/
	},
	SMOOTH: function( canvas, context ) {
		ig.setVendorAttribute( context, 'imageSmoothingEnabled', true );
		canvas.style.imageRendering = '';
		canvas.style.msInterpolationMode = '';
	}
};
ig.System.scaleMode = ig.System.SCALE.SMOOTH;

});
