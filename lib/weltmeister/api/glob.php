<?php 
require_once( 'config.php' );

$pattern = WM_Config::$fileRoot . str_replace( '..', '', $_GET['glob'] );
$files = glob( $pattern );

$fileRootLength = strlen( WM_Config::$fileRoot );
foreach( $files as $i => $f ) {
	$files[$i] = substr( $f, $fileRootLength );
}

echo json_encode( $files );

?>