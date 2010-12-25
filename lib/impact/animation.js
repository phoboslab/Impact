ig.module(
	'impact.animation'
)
.requires(
	'impact.timer',
	'impact.image' 
)
.defines(function(){

ig.AnimationSheet = ig.Class.extend({
	width: 8,
	height: 8,
	image: null,
	
	init: function( path, width, height ) {
		this.width = width;
		this.height = height;
		
		this.image = new ig.Image( path );
	}	
});



ig.Animation = ig.Class.extend({
	sheet: null,
	timer: null,
	
	sequence: [],	
	flip: {x: false, y: false},
	
	frame: 0,
	tile: 0,
	loopCount: 0,
	alpha: 1,
	angle: 0,
	
	
	init: function( sheet, frameTime, sequence, stop ) {
		this.sheet = sheet;
		this.timer = new ig.Timer();

		this.frameTime = frameTime;
		this.sequence = sequence;
		this.stop = !!stop;
	},
	
	
	rewind: function() {
		this.timer.reset();
		this.loopCount = 0;
		this.tile = this.sequence[0];
		return this;
	},
	
	
	gotoFrame: function( f ) {
		this.timer.set( this.frameTime * -f );
		this.update();
	},
	
	
	gotoRandomFrame: function() {
		this.gotoFrame( (Math.random() * this.sequence.length).floor() )
	},
	
	
	update: function() {
		var frameTotal = (this.timer.delta() / this.frameTime).floor();
		this.loopCount = (frameTotal / this.sequence.length).floor();
		if( this.stop && this.loopCount > 0 ) {
			this.frame = this.sequence.length - 1;
		}
		else {
			this.frame = frameTotal % this.sequence.length;
		}
		this.tile = this.sequence[ this.frame ];
	},
	
	
	draw: function( targetX, targetY ) {
		var bbsize = Math.max(this.sheet.width, this.sheet.height);
		
		// On screen?
		if(
		   targetX > ig.system.width || targetY > ig.system.height ||
		   targetX + bbsize < 0 || targetY + bbsize < 0
		) {
			return;
		}
		
		if( this.alpha != 1) {
			ig.system.context.globalAlpha = this.alpha;
		}
		
		if( this.angle == 0 ) {		
			this.sheet.image.drawTile(
				targetX, targetY,
				this.tile, this.sheet.width, this.sheet.height,
				this.flip.x, this.flip.y
			);
		}
		else {
			ig.system.context.save();
			ig.system.context.translate(
				ig.system.getDrawPos(targetX + this.sheet.width/2),
				ig.system.getDrawPos(targetY + this.sheet.height/2)
			);
			ig.system.context.rotate( this.angle );
			this.sheet.image.drawTile(
				-this.sheet.width/2, -this.sheet.height/2,
				this.tile, this.sheet.width, this.sheet.height,
				this.flip.x, this.flip.y
			);
			ig.system.context.restore();
		}
		
		if( this.alpha != 1) {
			ig.system.context.globalAlpha = 1;
		}
	}
});

});