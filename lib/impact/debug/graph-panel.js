ig.module(
	'impact.debug.graph-panel'
)
.requires(
	'impact.debug.menu',
	'impact.system',
	'impact.game',
	'impact.image'
)
.defines(function(){ "use strict";


ig.Game.inject({	
	draw: function() {
		ig.graph.beginClock('draw');
		this.parent();
		ig.graph.endClock('draw');
	},
	
	
	update: function() {
		ig.graph.beginClock('update');
		this.parent();
		ig.graph.endClock('update');
	},
	
	
	checkEntities: function() {
		ig.graph.beginClock('checks');
		this.parent();
		ig.graph.endClock('checks');
	}
});



ig.DebugGraphPanel = ig.DebugPanel.extend({
	clocks: {},
	marks: [],
	textY: 0,
	height: 128,
	ms: 64,
	timeBeforeRun: 0,
	
	
	init: function( name, label ) {
		this.parent( name, label );
		
		this.mark16ms = (this.height - (this.height/this.ms) * 16).round();
		this.mark33ms = (this.height - (this.height/this.ms) * 33).round();
		this.msHeight = this.height/this.ms;
		
		this.graph = ig.$new('canvas');
		this.graph.width = window.innerWidth;
		this.graph.height = this.height;
		this.container.appendChild( this.graph );
		this.ctx = this.graph.getContext('2d');
		
		this.ctx.fillStyle = '#444';
		this.ctx.fillRect( 0, this.mark16ms, this.graph.width, 1 );
		this.ctx.fillRect( 0, this.mark33ms, this.graph.width, 1 );
		
		this.addGraphMark( '16ms', this.mark16ms );
		this.addGraphMark( '33ms', this.mark33ms );
		
		this.addClock( 'draw', 'Draw', '#13baff' );
		this.addClock( 'update', 'Entity Update', '#bb0fff' );
		this.addClock( 'checks', 'Entity Checks & Collisions', '#a2e908' );
		this.addClock( 'lag', 'System Lag', '#f26900' );
		
		ig.mark = this.mark.bind(this);
		ig.graph = this;
	},
	
	
	addGraphMark: function( name, height ) {
		var span = ig.$new('span');
		span.className = 'ig_debug_graph_mark';
		span.textContent = name;
		span.style.top = height.round() + 'px';
		this.container.appendChild( span );
	},
	
	
	addClock: function( name, description, color ) {		
		var mark = ig.$new('span');
		mark.className = 'ig_debug_legend_color';
		mark.style.backgroundColor = color;
		
		var number = ig.$new('span');
		number.className = 'ig_debug_legend_number';
		number.appendChild( document.createTextNode('0') );
		
		var legend = ig.$new('span');
		legend.className = 'ig_debug_legend';
		legend.appendChild( mark );
		legend.appendChild( document.createTextNode(description +' (') );
		legend.appendChild( number );
		legend.appendChild( document.createTextNode('ms)') );
		
		this.container.appendChild( legend );
		
		this.clocks[name] = {
			description: description,
			color: color,
			current: 0,
			start: Date.now(),
			avg: 0,
			html: number
		};
	},
	
	
	beginClock: function( name, offset ) {
		this.clocks[name].start = Date.now() + (offset || 0);
	},
	
	
	endClock: function( name ) {
		var c = this.clocks[name];
		c.current = Math.round(Date.now() - c.start);
		c.avg = c.avg * 0.8 + c.current * 0.2;
	},
	
	
	mark: function( msg, color ) {
		if( this.active ) {
			this.marks.push( {msg:msg, color:(color||'#fff')} );
		}
	},
	
	
	beforeRun: function() {
		this.endClock('lag');
		this.timeBeforeRun = Date.now();
	},
	
	
	afterRun: function() {
		var frameTime = Date.now() - this.timeBeforeRun;
		var nextFrameDue = (1000/ig.system.fps) - frameTime;
		this.beginClock('lag', Math.max(nextFrameDue, 0));
		
		
		var x = this.graph.width-1;
		var y = this.height;
		
		this.ctx.drawImage( this.graph, -1, 0 );
		
		this.ctx.fillStyle = '#000';
		this.ctx.fillRect( x, 0, 1, this.height );
		
		this.ctx.fillStyle = '#444';
		this.ctx.fillRect( x, this.mark16ms, 1, 1 );
		
		this.ctx.fillStyle = '#444';
		this.ctx.fillRect( x, this.mark33ms, 1, 1 );
		
		for( var ci in this.clocks ) {
			var c = this.clocks[ci];
			c.html.textContent = c.avg.toFixed(2);
			
			if( c.color && c.current > 0 ) {
				this.ctx.fillStyle = c.color;
				var h = c.current * this.msHeight;
				y -= h;
				this.ctx.fillRect(	x, y, 1, h );
				c.current = 0;
			}
		}
		
		this.ctx.textAlign = 'right';
		this.ctx.textBaseline = 'top';
		this.ctx.globalAlpha = 0.5;
		
		for( var i = 0; i < this.marks.length; i++ ) {
			var m = this.marks[i];
			this.ctx.fillStyle = m.color;
			this.ctx.fillRect(	x, 0, 1, this.height );
			if( m.msg ) {
				this.ctx.fillText( m.msg, x-1, this.textY );
				this.textY = (this.textY+8)%32;
			}
		}
		this.ctx.globalAlpha = 1;
		this.marks = [];
	}
});


ig.debug.addPanel({
	type: ig.DebugGraphPanel,
	name: 'graph',
	label: 'Performance'
});


});