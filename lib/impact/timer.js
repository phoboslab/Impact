ig.module(
	'impact.timer'
)
.defines(function(){ "use strict";

ig.Timer = ig.Class.extend({
	target: 0,
	base: 0,
	last: 0,
	pausedAt: 0,
	
	init: function( seconds ) {
		this.base = ig.Timer.time;
		this.last = ig.Timer.time;
		
		this.target = seconds || 0;
	},
	
	
	set: function( seconds ) {
		this.target = seconds || 0;
		this.base = ig.Timer.time;
		this.pausedAt = 0;
	},
	
	
	reset: function() {
		this.base = ig.Timer.time;
		this.pausedAt = 0;
	},
	
	
	tick: function() {
		var delta = ig.Timer.time - this.last;
		this.last = ig.Timer.time;
		return (this.pausedAt ? 0 : delta);
	},
	
	
	delta: function() {
		return (this.pausedAt || ig.Timer.time) - this.base - this.target;
	},


	pause: function() {
		if( !this.pausedAt ) {
			this.pausedAt = ig.Timer.time;
		}
	},


	unpause: function() {
		if( this.pausedAt ) {
			this.base += ig.Timer.time - this.pausedAt;
			this.pausedAt = 0;
		}
	}
});

ig.Timer._last = 0;
ig.Timer.time = 0;
ig.Timer.timeScale = 1;
ig.Timer.maxStep = 0.05;

ig.Timer.step = function() {
	var current = Date.now();
	var delta = (current - ig.Timer._last) / 1000;
	ig.Timer.time += Math.min(delta, ig.Timer.maxStep) * ig.Timer.timeScale;
	ig.Timer._last = current;
};

});