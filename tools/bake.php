<?php
if( count($argv) < 3 ) {
	echo "Usage: bake.php <in...> <out>\n";
	echo "e.g. bake.php lib/impact/impact.js lib/game/game.js mygame-baked.js\n";
	die;
}

$inFiles = array_slice( $argv, 1, -1 );
$outFile = $argv[ count($argv)-1 ];

$baker = new Baker( Baker::MINIFIED );
$baker->bake( $inFiles, $outFile );


class Baker {
	const PLAIN = 0;
	const MINIFIED = 1;
	const GZIPPED = 2;
	
	protected $base = 'lib/';
	protected $format = 0;
	protected $loaded = array();
	protected $currentInput = 'Command Line';
	protected $fileCount = 0, $bytesIn = 0, $bytesOut = 0;
	
	public function __construct( $format = 0 ) {
		$this->format = $format;
		if( $this->format & self::MINIFIED ) {
			require_once( 'jsmin.php' );
		}
	}
	
	
	public function bake( $inFiles, $outFile ) {
		$this->fileCount = 0;
		$this->bytesIn = 0;
		$out = "/*! Built with IMPACT - impactjs.com */\n\n";
		
		foreach( $inFiles as $f ) {
			$out .=	$this->load( $f );
		}
		
		$bytesOut = strlen($out);
		$bytesOutZipped = 0;
		
		echo "writing $outFile\n";
		@file_put_contents( $outFile, $out ) or
			die("ERROR: Couldn't write to $outFile\n");
		
		if( $this->format & self::GZIPPED ) {
			$gzFile = "$outFile.gz";
			echo "writing $gzFile\n";
			$fh = gzopen( $gzFile, 'w9' ) or
				die("ERROR: Couldn't write to $gzFile\n");
				
			gzwrite( $fh, $out );
			gzclose( $fh );
			$bytesOutZipped = filesize( $gzFile );
		}
		
		
		echo
			"\nbaked {$this->fileCount} files: ".
			round($this->bytesIn/1024,1)."kb -> ".round($bytesOut/1024,1)."kb" .
			( $this->format & self::GZIPPED
				? " (".round($bytesOutZipped/1024,1)."kb gzipped)\n"
				: "\n"
			);
	}
	
	
	protected function load( $path ) {
		if( isset($this->loaded[$path]) ) {
			return '';
		}
		
		if( !file_exists($path) ) {
			die("ERROR: Couldn't load $path required from {$this->currentInput}\n");
		}
		
		echo "loading $path \n";
		$this->loaded[$path] = true;
		$this->currentInput = $path;
		
		$code = file_get_contents( $path );
		$this->bytesIn += strlen($code);
		$this->fileCount++;
		if( $this->format & self::MINIFIED ) {
			$code = trim(JSMin::minify($code));
		}
		
		
		// Naively probe the file for 'ig.module().requires().defines()' code;
		// the 'requries()' part will be handled by the regexp callback
		$this->definesModule = false;
		$code = preg_replace_callback(
			'/ig\s*
				\.\s*module\s*\((.*?)\)\s*
				(\.\s*requires\s*\((.*?)\)\s*)?
				\.\s*defines\s*\(
			/smx',
			array($this,'loadCallback'),
			$code
		);
		
		// All files should define a module; maybe we just missed it? Print a
		// friendly reminder :)
		if( !$this->definesModule ) {
			echo "WARNING: file $path seems to define no module!\n";
		}
		
		return $code;
	}
	
	
	protected function loadCallback( $matches ) {
		$currentInput = $this->currentInput;
		$this->definesModule  = true;
		
		$moduleName = $matches[1];
		$requiredFiles = isset($matches[3]) ? $matches[3] : '';
		$requiredCode = '';
		
		if( $requiredFiles ) {			
			// Explode the module names and map them to file names. Ignore the
			// dom.ready module if present
			$moduleFiles = array_diff(
				explode(
					',',
					preg_replace(
						'/[\s\'"]|\/\/.*|\/\*.*\*\//', // strip quotes and spaces
						'',
						str_replace('.', '/', $requiredFiles ) // . to /
					)
				),
				array('dom/ready')
			);
			
			foreach( $moduleFiles as $f ) {
				$requiredCode .= $this->load( $this->base . $f.'.js' );
			}
		}
		
		return
			$requiredCode .
			"\n\n// $currentInput\n" .
			'ig.baked=true;' .
			'ig.module('.$moduleName.')' .
			( $requiredFiles
				? '.requires('.$requiredFiles.')'
				: ''
			) .
			'.defines(';
	}
}

?>