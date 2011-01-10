ig.module(
	'impact.font'
)
.requires(
	'impact.image'
)
.defines(function(){


ig.Font = ig.Image.extend({
	widthMap: [],
	indices: [],
	firstChar: 32,
	height: 0,
	
	
	onload: function( ev ) {
		this._loadMetrics( this.data );
		this.parent( ev );
	},
	
	
	widthForString: function( s ) {
		var width = 0;
		for( var i = 0; i < s.length; i++ ) {
			width += this.widthMap[s.charCodeAt(i) - this.firstChar] + 1;
		}
		return width;
	},
	
	
	draw: function( text, x, y, align ) {
		if( typeof(text) != 'string' ) {
			text = text.toString();
		}
		
		if( align == ig.Font.ALIGN.RIGHT || align == ig.Font.ALIGN.CENTER ) {
			var width = 0;
			for( var i = 0; i < text.length; i++ ) {
				var c = text.charCodeAt(i);
				width += this.widthMap[c - this.firstChar] + 1;
			}
			x -= align == ig.Font.ALIGN.CENTER ? width/2 : width;
		}
		
		
		for( var i = 0; i < text.length; i++ ) {
			var c = text.charCodeAt(i);
			x += this._drawChar( c - this.firstChar, x, y );
		}
	},
	
	
	_drawChar: function( c, targetX, targetY ) {
		if( !this.loaded || c < 0 || c >= this.indices.length ) { return 0; }
		
		var scale = ig.system.scale;
		
		
		var charX = this.indices[c] * scale;
		var charY = 0;
		var charWidth = this.widthMap[c] * scale;
		var charHeight = (this.height-2) * scale;		
		
		ig.system.context.drawImage( 
			this.data,
			charX, charY,
			charWidth, charHeight,
			ig.system.getDrawPos(targetX), ig.system.getDrawPos(targetY),
			charWidth, charHeight
		);
		
		return this.widthMap[c] + 1;
	},
	
	
	_loadMetrics: function( image ) {
		// Draw the bottommost line of this font image into an offscreen canvas
		// and analyze it pixel by pixel.
		// A run of non-transparent pixels represents a character and its width
		
		this.height = image.height-1;
		this.widthMap = [];
		this.indices = [];
		
		var canvas = ig.$new('canvas');
		canvas.width = image.width;
		canvas.height = 1;
		var ctx = canvas.getContext('2d');
		ctx.drawImage( image, 0, image.height-1, image.width, 1, 0, 0, image.width, 1 );
		var px = ctx.getImageData(0, 0,image.width, 1);
		
		var currentChar = 0;
		var currentWidth = 0;
		for( var x = 0; x < image.width; x++ ) {
			var index = x * 4 + 3; // alpha component of this pixel
			if( px.data[index] != 0 ) {
				currentWidth++;
			}
			else if( px.data[index] == 0 && currentWidth ) {
				this.widthMap.push( currentWidth );
				this.indices.push( x-currentWidth );
				currentChar++;
				currentWidth = 0;
			}
		}
		this.widthMap.push( currentWidth );
		this.indices.push( x-currentWidth );
	}
});


ig.Font.ALIGN = {
	LEFT: 0,
	RIGHT: 1,
	CENTER: 2
};

});