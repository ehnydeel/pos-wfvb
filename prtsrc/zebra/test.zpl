// Start Format -- Beginn des ZPL-Dokuments
^XA

// Print width
// ^PWa => a = Druckerbreite in Pixel
^PW554

// Media Darkness
//	Über die Drucktemperatur wird die Intensität der Druckfarbe geregelt
// ^MDa
// a=Drucktemperatur, Werte von -30 bis 30 sind möglich
^MD20

// Print rate
//	Regelt die Druckgeschwindigkeit, die Geschwindigkeit zwischen den Etiketten sowie Etiketteneinzug
// ^PRp,s,b
// p=print speed
// s=slew speed
// b=backfeed speed
^PR3,3,3

// Field origin
//	Koordination für das zu druckende Feld
// ^FOx,y,z
//	x,y in Pixel
//	z=Orientation (0=left, 1=right, 2=auto
^FT20,100

// Change International Font
//	Hier können international CharacterSets vorgegeben werden
// ^CIO
^CIO

// Scaleable/Bitmapped Font
//	Festlegen der Schriftart
// ^Afo,h,w
//	f=fontname (Schriftarten des Drucker A-Z oder 0-9)
//	o=field orientation (N=normal,R=rotated 90 Grad,I=inverted 180 Grad,B=bottm up 270 Grad)
//	h=Höhe in Pixel
//	w=Breite in Pixel
^A0N,45,60

// Field data
// ^FDa
//	a=Inhalt
^FDMUSTERSENDUNG
^FS

// Field Seperator
//	Beendet den Inhalt
// ^FS

// Print Quality (Druckqualität)
// ^PQq,p,r,o
// q=total quantity (Anzahl Etiketten)
// p=pause and cut value (Nach wie vielen Etiketten soll pausiert oder abgeschnitten werden
// r=replicates of each serial number (Anzahl Wiederholungen je automatisch generierter Seriennummer
// o=override pause count (Hebt die Pause nach x-Etiketten auf
^PQ1,0,1,Y

// End Format
//	Ende des ZPL Dokuments
^XZ
