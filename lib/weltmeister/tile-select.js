ig.module(
	'weltmeister.tile-select'
)
.defines(function(){

wm.TileSelect = ig.Class.extend({
	
	pos: {x:0, y:0},
	layer: null,
	
	init: function( layer ) {
		this.layer = layer;
	},
	
	
	setPosition: function( x, y ) {
		var tile = this.layer.currentTile - 1;
		this.pos.x = 
			( x / this.layer.tilesize ).floor() * this.layer.tilesize 
			- ( tile * this.layer.tilesize ).floor() % this.layer.tiles.width;
			
		this.pos.y = 
			( y / this.layer.tilesize ).floor() * this.layer.tilesize 
			- ( tile * this.layer.tilesize / this.layer.tiles.width ).floor() * this.layer.tilesize
			- (tile == -1 ? this.layer.tilesize : 0);
			
		this.pos.x = this.pos.x.limit( 0, ig.system.width - this.layer.tiles.width - (ig.system.width % this.layer.tilesize) );
		this.pos.y = this.pos.y.limit( 0, ig.system.height - this.layer.tiles.height - (ig.system.height % this.layer.tilesize)  );
	},
	
	
	selectTile: function( x, y ) {
		var cx = ( (x - this.pos.x) / this.layer.tilesize ).floor();
		var cy = ( (y - this.pos.y) / this.layer.tilesize ).floor();
		
		var tw = ( this.layer.tiles.width / this.layer.tilesize ).floor();
		var th = ( this.layer.tiles.height / this.layer.tilesize ).floor();
		
		if( cx < 0 || cy < 0 || cx >= tw || cy >= th) {
			return 0;
		}
		var tile = cy * ( this.layer.tiles.width / this.layer.tilesize ).floor() + cx + 1;
		return tile;
	},
	

	draw: function() {
		ig.system.clear( "rgba(0,0,0,0.8)" ); 
		if( !this.layer.tiles.loaded ) {
			return;
		}
		
		// Tileset
		ig.system.context.lineWidth = 1;
		ig.system.context.strokeStyle = wm.config.colors.secondary;
		ig.system.context.fillStyle = wm.config.colors.clear;
		ig.system.context.fillRect( 
			this.pos.x * ig.system.scale, 
			this.pos.y * ig.system.scale, 
			this.layer.tiles.width * ig.system.scale, 
			this.layer.tiles.height * ig.system.scale
		);
		ig.system.context.strokeRect( 
			this.pos.x * ig.system.scale - 0.5, 
			this.pos.y * ig.system.scale - 0.5, 
			this.layer.tiles.width * ig.system.scale + 1, 
			this.layer.tiles.height * ig.system.scale + 1
		);
		
		this.layer.tiles.draw( this.pos.x, this.pos.y );
		
		// Selected Tile
		var tile = this.layer.currentTile - 1;
		var tx = ( tile * this.layer.tilesize ).floor() % this.layer.tiles.width + this.pos.x;
		var ty = 
			( tile * this.layer.tilesize / this.layer.tiles.width ).floor()
			* this.layer.tilesize + this.pos.y 
			+ (tile == -1 ? this.layer.tilesize : 0);
		
		ig.system.context.lineWidth = 1;
		ig.system.context.strokeStyle = wm.config.colors.highlight;
		ig.system.context.strokeRect( 
			tx * ig.system.scale - 0.5, 
			ty * ig.system.scale - 0.5, 
			this.layer.tilesize * ig.system.scale + 1, 
			this.layer.tilesize * ig.system.scale + 1
		);
	},
	
	
	drawCursor: function( x, y ) {  
		var cx = ( x / this.layer.tilesize ).floor() * this.layer.tilesize;
		var cy = ( y / this.layer.tilesize ).floor() * this.layer.tilesize;
		ig.system.context.lineWidth = 1;
		ig.system.context.strokeStyle = wm.config.colors.primary;
		ig.system.context.strokeRect( 
			cx * ig.system.scale - 0.5, 
			cy * ig.system.scale - 0.5, 
			this.layer.tilesize * ig.system.scale + 1, 
			this.layer.tilesize * ig.system.scale + 1
		);
	}
});

});