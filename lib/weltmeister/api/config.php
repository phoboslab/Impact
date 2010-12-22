<?php 

class WM_Config {
	public static $fileRoot = '../../../';
}

// revert magic quotes
if( function_exists('get_magic_quotes_gpc') && get_magic_quotes_gpc() ) {
	$_GET = array_map( 'stripslashes', $_GET );
	$_POST = array_map( 'stripslashes', $_POST );
}

?>