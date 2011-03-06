<?php 
require_once( 'config.php' );

$globs = is_array($_GET['glob']) ? $_GET['glob'] : array($_GET['glob']);
$files = array();
foreach( $globs as $glob ) {
    $pattern = WM_Config::$fileRoot . str_replace( '..', '', $glob );
    $files = array_merge( $files, (array)glob( $pattern ) );
}

$fileRootLength = strlen( WM_Config::$fileRoot );
foreach( $files as $i => $f ) {
	$files[$i] = substr( $f, $fileRootLength );
}

echo json_encode( $files );

?>