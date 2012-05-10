ig.module(
	'impact.debug.entities-panel'
)
.requires(
	'impact.debug.menu',
	'impact.entity'
)
.defines(function(){ "use strict";


ig.Entity.inject({
	colors: {
		names: '#fff',
		velocities: '#0f0',
		boxes: '#f00'
	},
	
	draw: function() {
		this.parent();		
		
		// Collision Boxes
		if( ig.Entity._debugShowBoxes ) {
			ig.system.context.strokeStyle = this.colors.boxes;
			ig.system.context.lineWidth = 1.0;
			ig.system.context.strokeRect(	
				ig.system.getDrawPos(this.pos.x.round() - ig.game.screen.x) - 0.5,
				ig.system.getDrawPos(this.pos.y.round() - ig.game.screen.y) - 0.5,
				this.size.x * ig.system.scale,
				this.size.y * ig.system.scale
			);
		}
		
		// Velocities
		if( ig.Entity._debugShowVelocities ) {
			var x = this.pos.x + this.size.x/2;
			var y = this.pos.y + this.size.y/2;
			
			this._debugDrawLine( this.colors.velocities, x, y, x + this.vel.x, y + this.vel.y );
		}
		
		// Names & Targets
		if( ig.Entity._debugShowNames ) {
			if( this.name ) {
				ig.system.context.fillStyle = this.colors.names;
				ig.system.context.fillText(
					this.name,
					ig.system.getDrawPos(this.pos.x - ig.game.screen.x), 
					ig.system.getDrawPos(this.pos.y - ig.game.screen.y)
				);
			}
			
			if( typeof(this.target) == 'object' ) {
				for( var t in this.target ) {
					var ent = ig.game.getEntityByName( this.target[t] );
					if( ent ) {
						this._debugDrawLine( this.colors.names,
							this.pos.x + this.size.x/2, this.pos.y + this.size.y/2,
							ent.pos.x + ent.size.x/2, ent.pos.y + ent.size.y/2
						);
					}
				}
			}
		}
	},
	
	
	_debugDrawLine: function( color, sx, sy, dx, dy ) {
		ig.system.context.strokeStyle = color;
		ig.system.context.lineWidth = 1.0;

		ig.system.context.beginPath();
		ig.system.context.moveTo( 
			ig.system.getDrawPos(sx - ig.game.screen.x),
			ig.system.getDrawPos(sy - ig.game.screen.y)
		);
		ig.system.context.lineTo( 
			ig.system.getDrawPos(dx - ig.game.screen.x),
			ig.system.getDrawPos(dy - ig.game.screen.y)
		);
		ig.system.context.stroke();
		ig.system.context.closePath();
	}
});


ig.Entity._debugEnableChecks = true;
ig.Entity._debugShowBoxes = false;
ig.Entity._debugShowVelocities = false;
ig.Entity._debugShowNames = false;

ig.Entity.oldCheckPair = ig.Entity.checkPair;
ig.Entity.checkPair = function( a, b ) {
	if( !ig.Entity._debugEnableChecks ) {
		return;
	}
	ig.Entity.oldCheckPair( a, b );
};


ig.debug.addPanel({
	type: ig.DebugPanel,
	name: 'entities',
	label: 'Entities',
	options: [
		{
			name: 'Checks & Collisions',
			object: ig.Entity,
			property: '_debugEnableChecks'
		},
		{
			name: 'Show Collision Boxes',
			object: ig.Entity,
			property: '_debugShowBoxes'
		},
		{
			name: 'Show Velocities',
			object: ig.Entity,
			property: '_debugShowVelocities'
		},
		{
			name: 'Show Names & Targets',
			object: ig.Entity,
			property: '_debugShowNames'
		}
	]
});


});