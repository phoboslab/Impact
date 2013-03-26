ig.module(
	'weltmeister.entityLoader'
)
.requires(
	'weltmeister.config'
)
.defines(function(){ "use strict";

// Load the list of entity files via AJAX PHP glob
var path = wm.config.api.glob + '?',
    globs = typeof wm.config.project.entityFiles == 'string' ? 
        [wm.config.project.entityFiles] : 
        wm.config.project.entityFiles;
    
for (var i = 0; i < globs.length; i++) {
    path += 'glob[]=' + encodeURIComponent(globs[i]) + '&';
}

path += 'nocache=' + Math.random();
	
var req = $.ajax({
	url: path, 
	method: 'get',
	dataType: 'json',
	
	// MUST load synchronous, as the engine would otherwise determine that it
	// can't resolve dependencies to weltmeister.entities when there are
	// no more files to load and weltmeister.entities is still not defined
	// because the ajax request hasn't finished yet.
	// FIXME FFS!
	async: false, 
	success: function(files) {
		
		// File names to Module names
		var moduleNames = [];
		var modules = {};
		for( var i = 0; i < files.length; i++ ) {
			var name = files[i]
				.replace(new RegExp("^"+ig.lib+"|\\.js$", "g"), '')
				.replace(/\//g, '.');
			moduleNames.push( name );
			modules[name] = files[i];
		}
		
		// Define a Module that requires all entity Modules
		ig.module('weltmeister.entities')
			.requires.apply(ig, moduleNames)
			.defines(function(){ wm.entityModules = modules; });
	},
	error: function( xhr, status, error ){
		throw( 
			"Failed to load entity list via glob.php: " + error + "\n" +
			xhr.responseText
		);
	}
});

});