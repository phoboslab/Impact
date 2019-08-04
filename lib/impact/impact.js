
// -----------------------------------------------------------------------------
// Impact Game Engine 1.24
// http://impactjs.com/
// -----------------------------------------------------------------------------


(function(window){ "use strict";

// -----------------------------------------------------------------------------
// Native Object extensions

Number.prototype.map = function(istart, istop, ostart, ostop) {
	return ostart + (ostop - ostart) * ((this - istart) / (istop - istart));
};

Number.prototype.limit = function(min, max) {
	return Math.min(max, Math.max(min, this));
};

Number.prototype.round = function(precision) {
	precision = Math.pow(10, precision || 0);
	return Math.round(this * precision) / precision;
};

Number.prototype.floor = function() {
	return Math.floor(this);
};

Number.prototype.ceil = function() {
	return Math.ceil(this);
};

Number.prototype.toInt = function() {
	return (this | 0);
};

Number.prototype.toRad = function() {
	return (this / 180) * Math.PI;
};

Number.prototype.toDeg = function() {
	return (this * 180) / Math.PI;
};

Object.defineProperty(Array.prototype, 'erase', {value: function(item) {
	for( var i = this.length; i--; ) {
		if( this[i] === item ) {
			this.splice(i, 1);
		}
	}
	return this;
}});

Object.defineProperty(Array.prototype, 'random', {value: function(item) {
	return this[ Math.floor(Math.random() * this.length) ];
}});

Function.prototype.bind = Function.prototype.bind || function (oThis) {
	if( typeof this !== "function" ) {
		throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
	}

	var aArgs = Array.prototype.slice.call(arguments, 1),
		fToBind = this,
		fNOP = function () {},
		fBound = function () {
			return fToBind.apply(
				(this instanceof fNOP && oThis ? this : oThis),
				aArgs.concat(Array.prototype.slice.call(arguments))
			);
		};

	fNOP.prototype = this.prototype;
	fBound.prototype = new fNOP();

	return fBound;
};


// -----------------------------------------------------------------------------
// ig Namespace

window.ig = {
	game: null,
	debug: null,
	version: '1.24',
	global: window,
	modules: {},
	resources: [],
	ready: false,
	baked: false,
	nocache: '',
	ua: {},
	prefix: (window.ImpactPrefix || ''),
	lib: 'lib/',
	
	_current: null,
	_loadQueue: [],
	_waitForOnload: 0,
	
	
	$: function( selector ) {
		return selector.charAt(0) == '#'
			? document.getElementById( selector.substr(1) )
			: document.getElementsByTagName( selector );
	},
	
	
	$new: function( name ) {
		return document.createElement( name );
	},
	
	
	copy: function( object ) {
		if(
		   !object || typeof(object) != 'object' ||
		   object instanceof HTMLElement ||
		   object instanceof ig.Class
		) {
			return object;
		}
		else if( object instanceof Array ) {
			var c = [];
			for( var i = 0, l = object.length; i < l; i++) {
				c[i] = ig.copy(object[i]);
			}
			return c;
		}
		else {
			var c = {};
			for( var i in object ) {
				c[i] = ig.copy(object[i]);
			}
			return c;
		}
	},
	
	
	merge: function( original, extended ) {
		for( var key in extended ) {
			var ext = extended[key];
			if(
				typeof(ext) != 'object' ||
				ext instanceof HTMLElement ||
				ext instanceof ig.Class ||
				ext === null
			) {
				original[key] = ext;
			}
			else {
				if( !original[key] || typeof(original[key]) != 'object' ) {
					original[key] = (ext instanceof Array) ? [] : {};
				}
				ig.merge( original[key], ext );
			}
		}
		return original;
	},
	
	
	ksort: function( obj ) {
		if( !obj || typeof(obj) != 'object' ) {
			return [];
		}
		
		var keys = [], values = [];
		for( var i in obj ) {
			keys.push(i);
		}
		
		keys.sort();
		for( var i = 0; i < keys.length; i++ ) {
			values.push( obj[keys[i]] );
		}
		
		return values;
	},

	// Ah, yes. I love vendor prefixes. So much fun!
	setVendorAttribute: function( el, attr, val ) {
		var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
		el[attr] = el['ms'+uc] = el['moz'+uc] = el['webkit'+uc] = el['o'+uc] = val;
	},


	getVendorAttribute: function( el, attr ) {
		var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
		return el[attr] || el['ms'+uc] || el['moz'+uc] || el['webkit'+uc] || el['o'+uc];
	},


	normalizeVendorAttribute: function( el, attr ) {
		var prefixedVal = ig.getVendorAttribute( el, attr );
		if( !el[attr] && prefixedVal ) {
			el[attr] = prefixedVal;
		}
	},


	// This function normalizes getImageData to extract the real, actual
	// pixels from an image. The naive method recently failed on retina
	// devices with a backgingStoreRatio != 1
	getImagePixels: function( image, x, y, width, height ) {
		var canvas = ig.$new('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		var ctx = canvas.getContext('2d');
		
		// Try to draw pixels as accurately as possible
		ig.System.SCALE.CRISP(canvas, ctx);

		var ratio = ig.getVendorAttribute( ctx, 'backingStorePixelRatio' ) || 1;
		ig.normalizeVendorAttribute( ctx, 'getImageDataHD' );

		var realWidth = image.width / ratio,
			realHeight = image.height / ratio;

		canvas.width = Math.ceil( realWidth );
		canvas.height = Math.ceil( realHeight );

		ctx.drawImage( image, 0, 0, realWidth, realHeight );
		
		return (ratio === 1)
			? ctx.getImageData( x, y, width, height )
			: ctx.getImageDataHD( x, y, width, height );
	},

	
	module: function( name ) {
		if( ig._current ) {
			throw( "Module '"+ig._current.name+"' defines nothing" );
		}
		if( ig.modules[name] && ig.modules[name].body ) {
			throw( "Module '"+name+"' is already defined" );
		}
		
		ig._current = {name: name, requires: [], loaded: false, body: null};
		ig.modules[name] = ig._current;
		ig._loadQueue.push(ig._current);
		return ig;
	},
	
	
	requires: function() {
		ig._current.requires = Array.prototype.slice.call(arguments);
		return ig;
	},
	
	
	defines: function( body ) {
		ig._current.body = body;
		ig._current = null;
		ig._initDOMReady();
	},
	
	
	addResource: function( resource ) {
		ig.resources.push( resource );
	},
	
	
	setNocache: function( set ) {
		ig.nocache = set
			? '?' + Date.now()
			: '';
	},
	
	
	// Stubs for ig.Debug
	log: function() {},
	assert: function( condition, msg ) {},
	show: function( name, number ) {},
	mark: function( msg, color ) {},
	
	
	_loadScript: function( name, requiredFrom ) {
		ig.modules[name] = {name: name, requires:[], loaded: false, body: null};
		ig._waitForOnload++;
		
		var path = ig.prefix + ig.lib + name.replace(/\./g, '/') + '.js' + ig.nocache;
		var script = ig.$new('script');
		script.type = 'text/javascript';
		script.src = path;
		script.onload = function() {
			ig._waitForOnload--;
			ig._execModules();
		};
		script.onerror = function() {
			throw(
				'Failed to load module '+name+' at ' + path + ' ' +
				'required from ' + requiredFrom
			);
		};
		ig.$('head')[0].appendChild(script);
	},

	
	_execModules: function() {
		var modulesLoaded = false;
		for( var i = 0; i < ig._loadQueue.length; i++ ) {
			var m = ig._loadQueue[i];
			var dependenciesLoaded = true;
			
			for( var j = 0; j < m.requires.length; j++ ) {
				var name = m.requires[j];
				if( !ig.modules[name] ) {
					dependenciesLoaded = false;
					ig._loadScript( name, m.name );
				}
				else if( !ig.modules[name].loaded ) {
					dependenciesLoaded = false;
				}
			}
			
			if( dependenciesLoaded && m.body ) {
				ig._loadQueue.splice(i, 1);
				m.loaded = true;
				m.body();
				modulesLoaded = true;
				i--;
			}
		}
		
		if( modulesLoaded ) {
			ig._execModules();
		}
		
		// No modules executed, no more files to load but loadQueue not empty?
		// Must be some unresolved dependencies!
		else if( !ig.baked && ig._waitForOnload == 0 && ig._loadQueue.length != 0 ) {
			var unresolved = [];
			for( var i = 0; i < ig._loadQueue.length; i++ ) {
				
				// Which dependencies aren't loaded?
				var unloaded = [];
				var requires = ig._loadQueue[i].requires;
				for( var j = 0; j < requires.length; j++ ) {
					var m = ig.modules[ requires[j] ];
					if( !m || !m.loaded ) {
						unloaded.push( requires[j] );
					}
				}
				unresolved.push( ig._loadQueue[i].name + ' (requires: ' + unloaded.join(', ') + ')');
			}
			
			throw( 
				"Unresolved (or circular?) dependencies. " +
				"Most likely there's a name/path mismatch for one of the listed modules " +
				"or a previous syntax error prevents a module from loading:\n" +
				unresolved.join('\n')				
			);
		}
	},
	
	
	_DOMReady: function() {
		if( !ig.modules['dom.ready'].loaded ) {
			if ( !document.body ) {
				return setTimeout( ig._DOMReady, 13 );
			}
			ig.modules['dom.ready'].loaded = true;
			ig._waitForOnload--;
			ig._execModules();
		}
		return 0;
	},
	
	
	_boot: function() {
		if( document.location.href.match(/\?nocache/) ) {
			ig.setNocache( true );
		}
		
		// Probe user agent string
		ig.ua.pixelRatio = window.devicePixelRatio || 1;
		ig.ua.viewport = {
			width: window.innerWidth,
			height: window.innerHeight
		};
		ig.ua.screen = {
			width: window.screen.availWidth * ig.ua.pixelRatio,
			height: window.screen.availHeight * ig.ua.pixelRatio
		};
		
		ig.ua.iPhone = /iPhone|iPod/i.test(navigator.userAgent);
		ig.ua.iPhone4 = (ig.ua.iPhone && ig.ua.pixelRatio == 2);
		ig.ua.iPad = /iPad/i.test(navigator.userAgent);
		ig.ua.android = /android/i.test(navigator.userAgent);
		ig.ua.winPhone = /Windows Phone/i.test(navigator.userAgent);
		ig.ua.iOS = ig.ua.iPhone || ig.ua.iPad;
		ig.ua.mobile = ig.ua.iOS || ig.ua.android || ig.ua.winPhone || /mobile/i.test(navigator.userAgent);
		ig.ua.touchDevice = (('ontouchstart' in window) || (window.navigator.msMaxTouchPoints));
	},
	
	
	_initDOMReady: function() {
		if( ig.modules['dom.ready'] ) {
			ig._execModules();
			return;
		}
		
		ig._boot();
		
		
		ig.modules['dom.ready'] = { requires: [], loaded: false, body: null };
		ig._waitForOnload++;
		if ( document.readyState === 'complete' ) {
			ig._DOMReady();
		}
		else {
			document.addEventListener( 'DOMContentLoaded', ig._DOMReady, false );
			window.addEventListener( 'load', ig._DOMReady, false );
		}
	}
};


// -----------------------------------------------------------------------------
// Provide ig.setAnimation and ig.clearAnimation as a compatible way to use
// requestAnimationFrame if available or setInterval otherwise

// Use requestAnimationFrame if available
ig.normalizeVendorAttribute( window, 'requestAnimationFrame' );
if( window.requestAnimationFrame ) {
	var next = 1,
		anims = {};

	window.ig.setAnimation = function( callback ) {
		var current = next++;
		anims[current] = true;

		var animate = function() {
			if( !anims[current] ) { return; } // deleted?
			window.requestAnimationFrame( animate );
			callback();
		};
		window.requestAnimationFrame( animate );
		return current;
	};

	window.ig.clearAnimation = function( id ) {
		delete anims[id];
	};
}

// [set/clear]Interval fallback
else {
	window.ig.setAnimation = function( callback ) {
		return window.setInterval( callback, 1000/60 );
	};
	window.ig.clearAnimation = function( id ) {
		window.clearInterval( id );
	};
}


// -----------------------------------------------------------------------------
// Class object based on John Resigs code; inspired by base2 and Prototype
// http://ejohn.org/blog/simple-javascript-inheritance/

var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\bparent\b/ : /.*/;
var lastClassId = 0;

window.ig.Class = function(){};
var inject = function(prop) {	
	var proto = this.prototype;
	var parent = {};
	for( var name in prop ) {		
		if( 
			typeof(prop[name]) == "function" &&
			typeof(proto[name]) == "function" && 
			fnTest.test(prop[name])
		) {
			parent[name] = proto[name]; // save original function
			proto[name] = (function(name, fn){
				return function() {
					var tmp = this.parent;
					this.parent = parent[name];
					var ret = fn.apply(this, arguments);			 
					this.parent = tmp;
					return ret;
				};
			})( name, prop[name] );
		}
		else {
			proto[name] = prop[name];
		}
	}
};

window.ig.Class.extend = function(prop) {
	var parent = this.prototype;
 
	initializing = true;
	var prototype = new this();
	initializing = false;
 
	for( var name in prop ) {
		if( 
			typeof(prop[name]) == "function" &&
			typeof(parent[name]) == "function" && 
			fnTest.test(prop[name])
		) {
			prototype[name] = (function(name, fn){
				return function() {
					var tmp = this.parent;
					this.parent = parent[name];
					var ret = fn.apply(this, arguments);			 
					this.parent = tmp;
					return ret;
				};
			})( name, prop[name] );
		}
		else {
			prototype[name] = prop[name];
		}
	}
 
	function Class() {
		if( !initializing ) {
			
			// If this class has a staticInstantiate method, invoke it
			// and check if we got something back. If not, the normal
			// constructor (init) is called.
			if( this.staticInstantiate ) {
				var obj = this.staticInstantiate.apply(this, arguments);
				if( obj ) {
					return obj;
				}
			}
			for( var p in this ) {
				if( typeof(this[p]) == 'object' ) {
					this[p] = ig.copy(this[p]); // deep copy!
				}
			}
			if( this.init ) {
				this.init.apply(this, arguments);
			}
		}
		return this;
	}
	
	Class.prototype = prototype;
	Class.prototype.constructor = Class;
	Class.extend = window.ig.Class.extend;
	Class.inject = inject;
	Class.classId = prototype.classId = ++lastClassId;
	
	return Class;
};

// Merge the ImpactMixin - if present - into the 'ig' namespace. This gives other
// code the chance to modify 'ig' before it's doing any work.
if( window.ImpactMixin ) {
	ig.merge(ig, window.ImpactMixin);
}

})(window);



// -----------------------------------------------------------------------------
// The main() function creates the system, input, sound and game objects,
// creates a preloader and starts the run loop

ig.module(
	'impact.impact'
)
.requires(
	'dom.ready',
	'impact.loader',
	'impact.system',
	'impact.input',
	'impact.sound'
)
.defines(function(){ "use strict";

ig.main = function( canvasId, gameClass, fps, width, height, scale, loaderClass ) {
	ig.system = new ig.System( canvasId, fps, width, height, scale || 1 );
	ig.input = new ig.Input();
	ig.soundManager = new ig.SoundManager();
	ig.music = new ig.Music();
	ig.ready = true;
	
	var loader = new (loaderClass || ig.Loader)( gameClass, ig.resources );
	loader.load();
};

});
