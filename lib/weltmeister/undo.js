ig.module(
	'weltmeister.undo'
)
.requires(
	'weltmeister.config'
)
.defines(function(){ "use strict";


wm.Undo = ig.Class.extend({
	levels: 10,
	chain: [],
	rpos: 0,
	currentAction: null,
	
	init: function( levels ) {
		this.levels = levels || 10;
	},
	
	
	clear: function() {
		this.chain = [];
		this.currentAction = null;
	},
	
	
	commit: function( action ) {
		if( this.rpos ) {
			this.chain.splice( this.chain.length - this.rpos, this.rpos );
			this.rpos = 0;
		}
		action.activeLayer = ig.game.activeLayer ? ig.game.activeLayer.name : '';
		this.chain.push( action );
		if( this.chain.length > this.levels ) {
			this.chain.shift();
		}
	},
	
	
	undo: function() {
		var action = this.chain[ this.chain.length - this.rpos - 1 ];
		if( !action ) {
			return;
		}
		this.rpos++;
		
		
		ig.game.setActiveLayer( action.activeLayer );
		
		if( action.type == wm.Undo.MAP_DRAW ) {
			for( var i = 0; i < action.changes.length; i++ ) {
				var change = action.changes[i];
				change.layer.setTile( change.x, change.y, change.old );
			}
		}
		else if( action.type == wm.Undo.ENTITY_EDIT ) {
			action.entity.pos.x = action.old.x;
			action.entity.pos.y = action.old.y;
			action.entity.size.x = action.old.w;
			action.entity.size.y = action.old.h;
			ig.game.entities.selectEntity( action.entity );
			ig.game.entities.loadEntitySettings();
		}
		else if( action.type == wm.Undo.ENTITY_CREATE ) {
			ig.game.entities.removeEntity( action.entity );
			ig.game.entities.selectEntity( null );
		}
		else if( action.type == wm.Undo.ENTITY_DELETE ) {
			ig.game.entities.entities.push( action.entity );
			if( action.entity.name ) {
				this.namedEntities[action.entity.name] = action.entity;
			}
			ig.game.entities.selectEntity( action.entity );
		}
		
		ig.game.setModified();
	},
	
	
	redo: function() {
		if( !this.rpos ) {
			return;
		}
		
		var action = this.chain[ this.chain.length - this.rpos ];
		if( !action ) {
			return;
		}
		this.rpos--;
		
		
		ig.game.setActiveLayer( action.activeLayer );
		
		if( action.type == wm.Undo.MAP_DRAW ) {
			for( var i = 0; i < action.changes.length; i++ ) {
				var change = action.changes[i];
				change.layer.setTile( change.x, change.y, change.current );
			}
		}
		else if( action.type == wm.Undo.ENTITY_EDIT ) {
			action.entity.pos.x = action.current.x;
			action.entity.pos.y = action.current.y;
			action.entity.size.x = action.current.w;
			action.entity.size.y = action.current.h;
			ig.game.entities.selectEntity( action.entity );
			ig.game.entities.loadEntitySettings();
		}
		else if( action.type == wm.Undo.ENTITY_CREATE ) {
			ig.game.entities.entities.push( action.entity );
			if( action.entity.name ) {
				this.namedEntities[action.entity.name] = action.entity;
			}
			ig.game.entities.selectEntity( action.entity );
		}
		else if( action.type == wm.Undo.ENTITY_DELETE ) {
			ig.game.entities.removeEntity( action.entity );
			ig.game.entities.selectEntity( null );
		}
		
		ig.game.setModified();
	},
	
	
	// -------------------------------------------------------------------------
	// Map changes
	
	beginMapDraw: function( layer ) {
		this.currentAction = {
			type: wm.Undo.MAP_DRAW,
			time: Date.now(),
			changes: []
		};
	},
	
	pushMapDraw: function( layer, x, y, oldTile, currentTile ) {
		if( !this.currentAction ) {
			return;
		}
		
		this.currentAction.changes.push({
			layer: layer,
			x: x,
			y: y,
			old: oldTile,
			current: currentTile
		});
	},
	
	endMapDraw: function() {		
		if( !this.currentAction || !this.currentAction.changes.length ) {
			return;
		}
		
		this.commit( this.currentAction );		
		this.currentAction = null;
	},
	
	
	// -------------------------------------------------------------------------
	// Entity changes
	
	beginEntityEdit: function( entity ) {		
		this.currentAction = {
			type: wm.Undo.ENTITY_EDIT,
			time: Date.now(),
			entity: entity,
			old: {
				x: entity.pos.x,
				y: entity.pos.y,
				w: entity.size.x,
				h: entity.size.y
			},
			current: {
				x: entity.pos.x,
				y: entity.pos.y,
				w: entity.size.x,
				h: entity.size.y
			}
		};
	},

	pushEntityEdit: function( entity ) {		
		if( !this.currentAction ) {
			return;
		}
		
		this.currentAction.current = {
			x: entity.pos.x,
			y: entity.pos.y,
			w: entity.size.x,
			h: entity.size.y
		};
	},
	
	
	endEntityEdit: function() {	
		var a = this.currentAction;
		
		if( !a || (
			a.old.x == a.current.x && a.old.y == a.current.y &&
			a.old.w == a.current.w && a.old.h == a.current.h
		)) {
			return;
		}
		
		this.commit( this.currentAction );		
		this.currentAction = null;
	},
	
	
	commitEntityCreate: function( entity ) {		
		this.commit({
			type: wm.Undo.ENTITY_CREATE,
			time: Date.now(),
			entity: entity
		});
	},
	
	
	commitEntityDelete: function( entity ) {		
		this.commit({
			type: wm.Undo.ENTITY_DELETE,
			time: Date.now(),
			entity: entity
		});
	}
});

wm.Undo.MAP_DRAW = 1;
wm.Undo.ENTITY_EDIT = 2;
wm.Undo.ENTITY_CREATE = 3;
wm.Undo.ENTITY_DELETE = 4;

});