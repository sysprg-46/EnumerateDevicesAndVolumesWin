/*
---------------------------------------------------------------------------------
This code runs competition between EnumDevicesAndVolumes.wsf and DISKPART.EXE.
EnumDevicesAndVolumes.wsf prepares input for DISKPART.EXE execution. That is
EnumDevicesAndVolumes.wsf WRITES some strings, slow operation and DISKPART.EXE
READS the same strings which is fast operation comparing write operation.
As competitions can continue rather long ( like a minute or even more depending
on the hardware environment ) than after each of the competition step one line
is typed on the console which shows the results of both competitors.
---------------------------------------------------------------------------------
ATTENTION: this code must be run in any write-access directory, it creates two log 
files ( one of EnumDevicesAndVolumes.wsf, ~ 1 000 lines for 9 devices with 16
Storage#Volumes and 16 Volumes ) and one for DISKPART.EXE, 225 lines in the same
environment. Besides 62-lines input file with commands which DISKPART.EXE
executes. 
P.A: EnumDevicesAndVolumes.wsf must be present in that directory, diskpart.exe -
not necessary, :). 
---------------------------------------------------------------------------------
To provide EnumDevicesAndVolumes.wsf run in competition mode it is necessary to
use "compete" option in command-line. This option excludes internal bufferization
and enables creation of an input file for DISKPART.EXE.
---------------------------------------------------------------------------------
© Oleg Kulikov, sysprg@live.ru
*/
var objShell = new ActiveXObject( "WScript.Shell" );
var fso      = new ActiveXObject( "Scripting.FileSystemObject" );
var path     = fso.GetAbsolutePathName( "." );
var comspec  = objShell.ExpandEnvironmentStrings( "%comspec%" );
var answ     = "";
var dur1     = [];// EnumDevicesAndVolumes.wsf processor time durations
var dur2     = [];// DISKPART.EXE processor time durations 
var buff1    = [];// All EnumDevicesAndVolumes.wsf StdOut messages
var buff2    = [];// All DISKPART.EXE StdOut messages
var fn1      = "EnumDevicesAndVolumes-Competition-Results.txt";
var fn2      = "DISKPART.EXE-Competition-Results.txt";
var repeations = 5;
var DPInput  = path + "\\DP_Input.txt";
var now, started, finished, duration, durmilli, durss, durmm, durhh,
cdur, nlines, clines, seconds;

function CountDuration( started )
{
   var finished, duration, durmilli, durss, durmm, durhh, cdur;
   var second   = 1000;
   var minute   = second * 60;

   finished = new Date().getTime(); 
   duration = finished - started;
   cdur = duration + " milliseconds"; 

   if ( duration > second )
   {
      durss = Math.round( duration / second );
      durmilli = ( duration + 999 ) % second;
      cdur = "Processor time used: "+durss + "." + durmilli + " seconds";
   }
   return cdur; 
}

for ( var i = 0; i < repeations; i++ )
{
   var msg, cdur1, cdur2;
   started = new Date().getTime();
   // Execute EnumDevicesAndVolumes.wsf
   objEx = objShell.Exec( comspec + " /c cscript EnumDevicesAndVolumes.wsf compete" );

   // Read EnumDevicesAndVolumes.wsf output
   while ( ! objEx.Stdout.atEndOfStream )
   {
      buff1[ buff1.length ] = objEx.StdOut.ReadLine();
   }

   cdur1 = CountDuration( started );
   dur1[ dur1.length ] = cdur1;

   started = new Date().getTime();

   // Execute DISKPART
   objEx = objShell.Exec( comspec + " /c diskpart /s " + DPInput );

   // Read DISKPART output
   while ( ! objEx.Stdout.atEndOfStream )
   {
      buff2[ buff2.length ] = objEx.StdOut.ReadLine();
   }

   cdur2 = CountDuration( started );
   dur2[ dur2.length ] = cdur2;
   
   WScript.Echo( "EnumDevicesAndVolumes " + cdur1 + ", DISKPART " + cdur2 );
   if ( i < repeations - 1 )
   {
      buff1 = [];
      buff2 = [];
   }    
} // end-of-repeations loop

var fh = fso.CreateTextFile( fn1, true, 0 );// overwrite, ascii
for ( var i = 0; i < dur1.length; i++ )
{
   fh.WriteLine( "EnumDevicesAndVolumes " + dur1[i] + ", DISKPART " + dur2[i] );
}
fh.WriteLine( "\n" );
for ( var i = 0; i < buff1.length; i++ )
{
   fh.WriteLine( buff1[i] );
}
fh.close();

fh = fso.CreateTextFile( fn2, true, 0 );// overwrite, ascii
for ( var i = 0; i < dur1.length; i++ )
{
   fh.WriteLine( "EnumDevicesAndVolumes " + dur1[i] + ", DISKPART " + dur2[i] );
}
fh.WriteLine( "\n" );
for ( var i = 0; i < buff2.length; i++ )
{
   fh.WriteLine( buff2[i] );
}
fh.close();

WScript.Quit();
