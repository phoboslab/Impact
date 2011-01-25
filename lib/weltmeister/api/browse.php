<?php 
require_once( 'config.php' );

$dir = WM_Config::$fileRoot . str_replace( '..', '', $_GET['dir'] );
if( $dir{strlen($dir)-1} != '/' ) {
	$dir .= '/';
}

$find = '*.*';
switch( $_GET['type'] ) {
	case 'images': 
		$find = '*.{png,gif,jpg,jpeg}';
		break;
	case 'scripts':
		$find = '*.js';
		break;
}

$dirs = (array)glob( $dir.'*', GLOB_ONLYDIR );
$files = (array)glob( $dir.$find, GLOB_BRACE );

$fileRootLength = strlen( WM_Config::$fileRoot );
foreach( $files as $i => $f ) {
	$files[$i] = substr( $f, $fileRootLength );
}
foreach( $dirs as $i => $d ) {
	$dirs[$i] = substr( $d, $fileRootLength );
}

$parent = substr($_GET['dir'], 0, strrpos($_GET['dir'], '/'));
echo json_encode( array( 
	'parent' => (empty($_GET['dir']) ? false : $parent),
	'dirs' => $dirs,
	'files' => $files
));

?>