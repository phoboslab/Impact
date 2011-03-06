<?php 

class WM_Config {
	public static $fileRoot = '../../../';
}

function stripslashes_deep($value)
{
    $value = is_array($value) ?
        array_map( 'stripslashes_deep', $value ) :
        stripslashes($value);

    return $value;
}

// revert magic quotes
if( function_exists('get_magic_quotes_gpc') && get_magic_quotes_gpc() ) {
	$_GET = array_map( 'stripslashes_deep', $_GET );
	$_POST = array_map( 'stripslashes_deep', $_POST );
}

?>