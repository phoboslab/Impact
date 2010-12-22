ig.module(
	'weltmeister.edit-map'
)
.requires(
	'impact.background-map',
	'weltmeister.tile-select'
)
.defines(function(){

wm.EditMap = ig.BackgroundMap.extend({
	name: '',
	visible: true,
	active: true,
	linkWithCollision: false,
	
	div: null,
	currentTile: 0,
	hotkey: -1,
	ignoreLastClick: false,
	tileSelect: null,
	
	init: function( name, tilesize, tileset ) {
		this.parent( tilesize, [[0]], tileset || '' );
		
		this.div = $( '<div/>', {
			'class': 'layer layerActive', 
			'id': ('layer_' + name),
			'mouseup': this.click.bind(this)
		});
		this.setName( name );
		$('#layers').prepend( this.div );
		
		this.tileSelect = new wm.TileSelect( this );
	},
	
	
	getSaveData: function() {
		return {
			name: this.name,
			width: this.width,
			height: this.height,
			linkWithCollision: this.linkWithCollision,
			visible: this.visible,
			tilesetName: this.tilesetName,
			repeat: this.repeat,
			distance: this.distance,
			tilesize: this.tilesize,
			data: this.data
		};
	},
	
	
	resize: function( newWidth, newHeight ) {
		var newData = new Array( newHeight );
		for( var y = 0; y < newHeight; y++ ) {
			newData[y] = new Array( newWidth );
			for( var x = 0; x < newWidth; x++ ) {
				newData[y][x] = (x < this.width && y < this.height) ? this.data[y][x] : 0;
			}
		}
		this.data = newData;
		this.width = newWidth;
		this.height = newHeight;
		
		this.resetDiv();
	},
	
	
	
	// -------------------------------------------------------------------------
	// UI
	
	setHotkey: function( hotkey ) {
		this.hotkey = hotkey;
		this.setName( this.name );
	},
	
	
	setName: function( name ) {
		this.name = name.replace(/[^0-9a-zA-Z]/g, '_');
		this.resetDiv();
	},
	
	
	resetDiv: function() {
		this.div.html(
			'<span class="visible" title="Toggle Visibility (Shift+'+this.hotkey+')">' 
				+ (this.visible ? '&#x25a3;' : '&#x25fb' ) 
			+ ' </span>' 
			+ '<span class="hotkey">' + (this.hotkey) + ': </span>' 
			+ '<span class="name">' + this.name + '</span>' 
			+ '<span class="size"> (' +  this.width + 'x' + this.height + ')</span>'  
		);
		this.div.children('.visible').bind('mousedown', this.toggleVisibilityClick.bind(this) );
	},
	
	
	setActive: function( active ) {
		this.active = active;
		if( active ) {
			this.div.addClass( 'layerActive' );
		} else {
			this.div.removeClass( 'layerActive' );
		}
	},
	
	
	toggleVisibility: function() {
		this.visible ^= 1;
		this.resetDiv();
		ig.game.draw();
	},
	
	
	toggleVisibilityClick: function( event ) {
		if( !this.active ) {
			this.ignoreLastClick = true;
		}
		this.toggleVisibility()
	},
	
	
	click: function() {
		if( this.ignoreLastClick ) {
			this.ignoreLastClick = false;
			return;
		}
		ig.editor.setActiveLayer( this.name );
	},
	
	
	destroy: function() {
		this.div.remove();
	},
	
	
	

	// -------------------------------------------------------------------------
	// Drawing
	
	draw: function() {
		if( this.active ) {
			ig.system.context.lineWidth = 1;
			ig.system.context.strokeStyle = wm.config.colors.primary;
			ig.system.context.strokeRect( 
				-ig.system.getDrawPos(this.scroll.x) - 0.5, 
				-ig.system.getDrawPos(this.scroll.y) - 0.5, 
				this.width * this.tilesize * ig.system.scale + 1, 
				this.height * this.tilesize * ig.system.scale + 1
			);
		}
			
		if( this.visible ) {
			this.parent();
		}
	},
	
	
	drawCursor: function( x, y ) {
		var cx = 
			((x+((this.scroll.x).toInt() % this.tilesize)) / this.tilesize ).toInt()
			* this.tilesize - (this.scroll.x % this.tilesize);
		var cy = 
			((y+((this.scroll.y).toInt() % this.tilesize)) / this.tilesize ).toInt()
			* this.tilesize - (this.scroll.y % this.tilesize);
			
		ig.system.context.lineWidth = 1;
		ig.system.context.strokeStyle = wm.config.colors.primary;
		ig.system.context.strokeRect( 
			ig.system.getDrawPos(cx)-0.5, 
			ig.system.getDrawPos(cy)-0.5, 
			this.tilesize * ig.system.scale + 1, 
			this.tilesize * ig.system.scale + 1
		);
		
		if( this.currentTile >= 1 ) {
			ig.system.context.globalAlpha = 0.5;
			this.tiles.drawTile( cx, cy, this.currentTile-1, this.tilesize );
			ig.system.context.globalAlpha = 1;
		}
	}
});

});