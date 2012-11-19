ig.module(
	'weltmeister.evented-input'
)
.requires(
	'impact.input'
)
.defines(function(){ "use strict";

wm.EventedInput = ig.Input.extend({
	mousemoveCallback: null,
	keyupCallback: null,
	keydownCallback: null,
	
	delayedKeyup: {push:function(){},length: 0},
	
	
	keydown: function( event ) {
		var tag = event.target.tagName;
		if( tag == 'INPUT' || tag == 'TEXTAREA' ) { return; }
		
		var code = event.type == 'keydown' 
			? event.keyCode 
			: (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
		var action = this.bindings[code];
		if( action ) {
			if( !this.actions[action] ) {
				this.actions[action] = true;
				if( this.keydownCallback ) {
					this.keydownCallback( action );
				}
			}
			event.stopPropagation();
			event.preventDefault();
		}
	},
	
	
	keyup: function( event ) {
		var tag = event.target.tagName;
		if( tag == 'INPUT' || tag == 'TEXTAREA' ) { return; }
		
		var code = event.type == 'keyup' 
			? event.keyCode 
			: (event.button == 2 ? ig.KEY.MOUSE2 : ig.KEY.MOUSE1);
		var action = this.bindings[code];
		if( action ) {
			this.actions[action] = false;
			if( this.keyupCallback ) {
				this.keyupCallback( action );
			}
			event.stopPropagation();
			event.preventDefault();
		}
	},
	
	
	mousewheel: function( event ) {
		var delta = event.wheelDelta ? event.wheelDelta : (event.detail * -1);
		var code = delta > 0 ? ig.KEY.MWHEEL_UP : ig.KEY.MWHEEL_DOWN;
		var action = this.bindings[code];
		if( action ) {
			if( this.keyupCallback ) {
				this.keyupCallback( action );
			}
			event.stopPropagation();
			event.preventDefault();
		}
	},
	
	
	mousemove: function( event ) {
		this.parent( event );
		if( this.mousemoveCallback ) {
			this.mousemoveCallback();
		}
	}
});

});