ig.module(
	'weltmeister.edit-map'
)
.requires(
	'impact.background-map',
	'weltmeister.tile-select'
)
.defines(function(){ "use strict";

wm.EditMap = ig.BackgroundMap.extend({
	name: '',
	visible: true,
	active: true,
	linkWithCollision: false,
	
	div: null,
	brush: [[0]],
	oldData: null,
	hotkey: -1,
	ignoreLastClick: false,
	tileSelect: null,
	
	isSelecting: false,
	selectionBegin: null,
	
	init: function( name, tilesize, tileset, foreground ) {
		this.name = name;
		this.parent( tilesize, [[0]], tileset || '' );
		this.foreground = foreground;
		
		this.div = $( '<div/>', {
			'class': 'layer layerActive', 
			'id': ('layer_' + name),
			'mouseup': this.click.bind(this)
		});
		this.setName( name );
		if( this.foreground ) {
			$('#layers').prepend( this.div );
		}
		else {
			$('#layerEntities').after( this.div );
		}
		
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
			preRender: this.preRender,
			distance: this.distance,
			tilesize: this.tilesize,
			foreground: this.foreground,
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
	
	beginEditing: function() {
		this.oldData = ig.copy(this.data);
	},
	
	getOldTile: function( x, y ) {
		var tx = Math.floor( x / this.tilesize );
		var ty = Math.floor( y / this.tilesize );
		if( 
			(tx >= 0 && tx < this.width) &&
			(ty >= 0 && ty < this.height)
		) {
			return this.oldData[ty][tx];
		} 
		else {
			return 0;
		}
	},
	
	setTileset: function( tileset ) {
		if( this.name == 'collision' ) {
			this.setCollisionTileset();
		}
		else {
			this.parent( tileset );
		}
	},
	
	
	setCollisionTileset: function() {
		var path = wm.config.collisionTiles.path;
		var scale = this.tilesize / wm.config.collisionTiles.tilesize;
		this.tiles = new ig.AutoResizedImage( path, scale );
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
		var visClass = this.visible ? ' checkedVis' : '';
		this.div.html(
			'<span class="visible'+visClass+'" title="Toggle Visibility (Shift+'+this.hotkey+')"></span>' +
			'<span class="name">' + this.name + '</span>' +
			'<span class="size"> (' + this.width + 'x' + this.height + ')</span>'
		);
		this.div.attr('title', 'Select Layer ('+this.hotkey+')' );
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
		if( this.visible ) {
			this.div.children('.visible').addClass('checkedVis');
		} else {
			this.div.children('.visible').removeClass('checkedVis');
		}
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
	// Selecting
	
	beginSelecting: function( x, y ) {
		this.isSelecting = true;
		this.selectionBegin = {x:x, y:y};
	},
	
		
	endSelecting: function( x, y ) {
		var r = this.getSelectionRect( x, y);
		
		var brush = [];
		for( var ty = r.y; ty < r.y+r.h; ty++ ) {
			var row = [];
			for( var tx = r.x; tx < r.x+r.w; tx++ ) {
				if( tx < 0 || ty < 0 || tx >= this.width || ty >= this.height ) {
					row.push( 0 );
				}
				else {
					row.push( this.data[ty][tx] );
				}
			}
			brush.push( row );
		}
		this.isSelecting = false;
		this.selectionBegin = null;
		return brush;
	},
	
	
	getSelectionRect: function( x, y ) {
		var sx = this.selectionBegin ? this.selectionBegin.x : x,
			sy = this.selectionBegin ? this.selectionBegin.y : y;
			
		var
			txb = Math.floor( (sx + this.scroll.x) / this.tilesize ),
			tyb = Math.floor( (sy + this.scroll.y) / this.tilesize ),
			txe = Math.floor( (x + this.scroll.x) / this.tilesize ),
			tye = Math.floor( (y + this.scroll.y) / this.tilesize );
		
		return {
			x: Math.min( txb, txe ),
			y: Math.min( tyb, tye ),
			w: Math.abs( txb - txe) + 1,
			h: Math.abs( tyb - tye) + 1
		}
	},	
	
	
	

	// -------------------------------------------------------------------------
	// Drawing
	
	draw: function() {
		// For performance reasons, repeated background maps are not drawn
		// when zoomed out
		if( this.visible && !(wm.config.view.zoom < 1 && this.repeat) ) {
			this.drawTiled();
		}
		
		// Grid
		if( this.active && wm.config.view.grid ) {
			
			var x = -ig.system.getDrawPos(this.scroll.x % this.tilesize) - 0.5;
			var y = -ig.system.getDrawPos(this.scroll.y % this.tilesize) - 0.5;
			var step = this.tilesize * ig.system.scale;
			
			ig.system.context.beginPath();
			for( x; x < ig.system.realWidth; x += step ) {
				ig.system.context.moveTo( x, 0 );
				ig.system.context.lineTo( x, ig.system.realHeight );
			}
			for( y; y < ig.system.realHeight; y += step ) {
				ig.system.context.moveTo( 0, y );
				ig.system.context.lineTo( ig.system.realWidth, y );
			}
			ig.system.context.strokeStyle = wm.config.colors.secondary;
			ig.system.context.stroke();
			ig.system.context.closePath();
			
			// Not calling beginPath() again has some weird performance issues
			// in Firefox 5. closePath has no effect. So to make it happy:
			ig.system.context.beginPath(); 
		}
		
		// Bounds
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
	},
	
	getCursorOffset: function() {
		var w = this.brush[0].length;
		var h = this.brush.length;
		
		//return {x:0, y:0};
		return {
			x: (w/2-0.5).toInt() * this.tilesize,
			y: (h/2-0.5).toInt() * this.tilesize
		}
	},
	
	drawCursor: function( x, y ) {
		if( this.isSelecting ) {
			var r = this.getSelectionRect( x, y);
		
			ig.system.context.lineWidth = 1;
			ig.system.context.strokeStyle = wm.config.colors.selection;
			ig.system.context.strokeRect( 
				(r.x * this.tilesize - this.scroll.x) * ig.system.scale - 0.5, 
				(r.y * this.tilesize - this.scroll.y) * ig.system.scale - 0.5, 
				r.w * this.tilesize * ig.system.scale + 1, 
				r.h * this.tilesize * ig.system.scale + 1
			);
		}
		else {
			var w = this.brush[0].length;
			var h = this.brush.length;
			
			var co = this.getCursorOffset();
			
			var cx = Math.floor( (x+this.scroll.x) / this.tilesize ) * this.tilesize - this.scroll.x - co.x;
			var cy = Math.floor( (y+this.scroll.y) / this.tilesize ) * this.tilesize - this.scroll.y - co.y;
			
			ig.system.context.lineWidth = 1;
			ig.system.context.strokeStyle = wm.config.colors.primary;
			ig.system.context.strokeRect( 
				ig.system.getDrawPos(cx)-0.5, 
				ig.system.getDrawPos(cy)-0.5, 
				w * this.tilesize * ig.system.scale + 1, 
				h * this.tilesize * ig.system.scale + 1
			);
			
			ig.system.context.globalAlpha = 0.5;
			for( var ty = 0; ty < h; ty++ ) {
				for( var tx = 0; tx < w; tx++ ) {
					var t = this.brush[ty][tx];
					if( t ) {
						var px = cx + tx * this.tilesize;
						var py = cy + ty * this.tilesize;
						this.tiles.drawTile( px, py, t-1, this.tilesize );
					}
				}
			}
			ig.system.context.globalAlpha = 1;
		}
	}
});


ig.AutoResizedImage = ig.Image.extend({
	internalScale: 1,
	
	staticInstantiate: function() {
		return null; // Never cache!
	},
	
	init: function( path, internalScale ) {
		this.internalScale = internalScale;
		this.parent( path );
	},
	
	onload: function( event ) {
		this.width = Math.ceil(this.data.width * this.internalScale);
		this.height = Math.ceil(this.data.height * this.internalScale);
		
		if( this.internalScale != 1 ) {
			var scaled = ig.$new('canvas');
			scaled.width = this.width;
			scaled.height = this.height;
			var scaledCtx = scaled.getContext('2d');
			
			scaledCtx.drawImage( this.data, 0, 0, this.data.width, this.data.height, 0, 0, this.width , this.height );
			this.data = scaled;
		}
		
		this.loaded = true;
		if( ig.system.scale != 1 ) {
			this.resize( ig.system.scale );
		}
		
		if( this.loadCallback ) {
			this.loadCallback( this.path, true );
		}
	}
});


});