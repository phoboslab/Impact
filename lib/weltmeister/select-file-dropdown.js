ig.module(
	'weltmeister.select-file-dropdown'
)
.defines(function(){ "use strict";
	
wm.SelectFileDropdown = ig.Class.extend({
	input: null,
	boundShow: null,
	div: null,
	filelistPHP: '',
	filetype: '',
	
	init: function( elementId, filelistPHP, filetype ) {
		this.filetype = filetype || '';
		this.filelistPHP = filelistPHP;
		this.input = $(elementId);
		this.boundHide = this.hide.bind(this);
		this.input.bind('focus', this.show.bind(this) );
		
		this.div = $('<div/>', {'class':'selectFileDialog'});
		this.input.after( this.div );
		this.div.bind('mousedown', this.noHide.bind(this) );
		
		this.loadDir( '' );
	},
	
	
	loadDir: function( dir ) {
		var path = this.filelistPHP + '?dir=' + encodeURIComponent( dir || '' ) + '&type=' + this.filetype;
		var req = $.ajax({
			url:path, 
			dataType: 'json',
			async: false,
			success:this.showFiles.bind(this)
		});
	},
	
	
	selectDir: function( event ) {
		this.loadDir( $(event.target).attr('href') );
		return false;
	},
	
	
	selectFile: function( event ) {
		this.input.val( $(event.target).attr('href') );
		this.input.blur();
		this.hide();
		return false;
	},
	
	
	showFiles: function( data ) {
		this.div.empty();
		if( data.parent !== false ) {
			var parentDir = $('<a/>', {'class':'dir', href:data.parent, html: '&hellip;parent directory'});
			parentDir.bind( 'click', this.selectDir.bind(this) );
			this.div.append( parentDir );
		}
		for( var i = 0; i < data.dirs.length; i++ ) {
			var name = data.dirs[i].match(/[^\/]*$/)[0] + '/';
			var dir = $('<a/>', {'class':'dir', href:data.dirs[i], html: name, title: name});
			dir.bind( 'click', this.selectDir.bind(this) );
			this.div.append( dir );
		}
		for( var i = 0; i < data.files.length; i++ ) {
			var name = data.files[i].match(/[^\/]*$/)[0];
			var file = $('<a/>', {'class':'file', href:data.files[i], html: name, title: name});
			file.bind( 'click', this.selectFile.bind(this) );
			this.div.append( file );
		}
	},
	
	
	noHide: function(event) {
		event.stopPropagation();
	},
	
	
	show: function( event ) {
		var inputPos = this.input.position();//this.input.getPosition(this.input.getOffsetParent());
		var inputHeight = parseInt(this.input.innerHeight()) + parseInt(this.input.css('margin-top'));
		var inputWidth = this.input.innerWidth();
		$(document).bind( 'mousedown', this.boundHide );
		this.div.css({
			'top': inputPos.top + inputHeight + 1,
			'left': inputPos.left,
			'width': inputWidth
		}).slideDown(100);
	},
	
	
	hide: function() {
		$(document).unbind( 'mousedown', this.boundHide );
		this.div.slideUp(100);
	}
});

});