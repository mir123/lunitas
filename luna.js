// luna.js - v. 0.2
//
// by mir - mir123 (at) gmail
// 
// Outputs a calendar with phases of the moon
//
// 2017.01.21 First release
// 2011.03.09 adapted code from pom.c (from BSD games). removed most code dealing with pretty output - currently just provides percent of full at current system time
//

/* based on the BSD Games program pom by Keith E. Brandt
 *
 * Based on routines from `Practical Astronomy with Your Calculator',
 * by Duffett-Smith.  Comments give the section from the book that
 * particular piece of code was adapted from.
 *
 * -- Keith E. Brandt  VIII 1984
 *
 * Updated to the Third Edition of Duffett-Smith's book, Paul Janzen, IX 1998
 *
 */
/*
 * Copyright (c) 1989, 1993
 *	The Regents of the University of California.  All rights reserved.
 *
 * This code is derived from software posted to USENET.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. All advertising materials mentioning features or use of this software
 *    must display the following acknowledgement:
 *	This product includes software developed by the University of
 *	California, Berkeley and its contributors.
 * 4. Neither the name of the University nor the names of its contributors
 *    may be used to endorse or promote products derived from this software
 *    without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE REGENTS AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */

// TO DO: Pretty interface to do this from front end

timeAtPhase = 20; // Time of day phase is returned, otherwise it's midnight
timeZone = -5; // Time zone relative to UTC (-5 = Panama)

start = new Date(Date.UTC(2017,0,2)); // The start date of your calendar in UTC, months 0-11. Uses Jan 2 since the night of Jan 1 in UTC-5 is already Jan 2 in UTC.
end = new Date(Date.UTC(2018,0,1));

page_title = 'Luna 2017'
page_logo = 'logo_aa_optimised_svg.svg'
page_footer = 'Fase de la luna a las 8 pm hora local de Panam&aacute; - Fundaci&oacute;n Almanaque Azul - Creative Commons CC-BY-NC-SA 4.0'

PI =  3.14159265358979323846

/*
 * The EPOCH in the third edition of the book is 1990 Jan 0.0 TDT.
 * In this program, we do not bother to correct for the differences
 * between UTC (as shown by the UNIX clock) and TDT.  (TDT = TAI + 32.184s;
 * TAI-UTC = 32s in Jan 1999.)
 */

EPOCH_MINUS_1970 = (20 * 365 + 5 - 1) /* 20 years, 5 leaps, back 1 day to Jan 0 */
EPSILONg  = 279.403303	/* solar ecliptic long at EPOCH */
RHOg	  = 282.768422	/* solar ecliptic long of perigee at EPOCH */
ECCEN	  = 0.016713	/* solar orbit eccentricity */
lzero	  = 318.351648	/* lunar mean long at EPOCH */
Pzero	  = 36.340410	/* lunar mean long of perigee at EPOCH */
Nzero	  = 318.510107	/* lunar mean long of node at EPOCH */

/* Precision used when describing the moon's phase in textual format, in phase_string().
*/

PRECISION = 0.01
NEW =   0 / 4.0
FIRST = 1 / 4.0
FULL = 2 / 4.0
LAST = 3 / 4.0
NEXTNEW = 4 / 4.0

var tmpt;
var days, today, tomorrow;

header = '<?xml version="1.0" encoding="UTF-8"?>\n\
<!DOCTYPE html>\n\
<html xmlns="http://www.w3.org/1999/xhtml" \n\
xmlns:svg="http://www.w3.org/2000/svg" \n\
xmlns:xlink="http://www.w3.org/1999/xlink"\n\
xmlns:svg="http://www.w3.org/2000/svg"\n\
xmlns="http://www.w3.org/2000/svg">\n\
<head>\n\
<title>' + page_title + '</title>\n\
<link rel="stylesheet" type="text/css" href="luna.css"/>\
<?xml-stylesheet type="text/css" href="luna.css" ?> \
</head>'

body_start = '<body>\n\
<h1>' + page_title + '</h1>\n\
<img class="logo" src="' + page_logo + '"/>\
<div class="calendar">\n'

scale_factor = 0.75 // Relative size of moon inside svg/div
move_x = 20 // shifts moon inside svg/div
move_y = 20
transform = 'transform="scale(' + scale_factor + ',' + scale_factor + ') translate(' + move_x + ',' + move_y + ')"' 
viewbox = 'viewBox = "0 0 100 120"' 

day_container = '<div class="day">'
svg_container = '<svg class="moon" version="1.1" ' + viewbox + ' >\n'

bg_rect = '<rect class="bg_rect_svg" x="0" y="0" width="100" height="120"/>'
dark_luna = '<circle cx="50" cy="50" r="50" stroke="none" fill="black"' + transform + '/>\n'

attr_luna = ' fill="white" stroke="white" stroke-width="0"'

element_text_svg = '<text class="date_svg" x="50" y="110">'
close_text_svg = '</text>'
close_svg = '</svg>'
element_text = '<div class="fecha">'
close_texto = '</div>'
close_element = '</div>'
footer = '</div>\n\
<div class="footer_txt">' + page_footer + '</div></body></html>'

document.write(header + body_start);

timeCorr = (timeAtPhase-timeZone) * 3600; // hrs x seconds

currentTime = start;

while(currentTime <= end){

	tmpt = currentTime / 1000;

	tmpt = tmpt + timeCorr;

	days = (tmpt - EPOCH_MINUS_1970 * 86400) / 86400.0;

	today = potm(days);

	phase_path = phase_shape(today);
	phase_path = phase_path + attr_luna + transform + " />"

	var month = currentTime.getMonth() + 1
	var day = currentTime.getDate()
	var year = currentTime.getFullYear()
    var wkday = currentTime.getDay()
	var fulldatemoon = day_container + svg_container + bg_rect + dark_luna + phase_path + element_text_svg 
	if (wkday == 0){fulldatemoon = fulldatemoon + "*"}
	fulldatemoon = fulldatemoon + day + "/" + month + close_text_svg + close_svg + close_element;	

	document.write(fulldatemoon);

    currentTime.setDate(currentTime.getDate() + 1);

}

document.write(footer);


/*
 * potm --
 *	return phase of the moon
 */
function potm(days)

{
	var N, Msol, Ec, LambdaSol, l, Mm, Ev, Ac, A3, Mmprime;
	var A4, lprime, V, ldprime, D, Nm;

	N = 360 * days / 365.242191;				/* sec 46 #3 */
	N = adj360(N);
	Msol = N + EPSILONg - RHOg;				/* sec 46 #4 */
	Msol = adj360(Msol);
	Ec = 360 / PI * ECCEN * Math.sin(dtor(Msol));		/* sec 46 #5 */
	LambdaSol = N + Ec + EPSILONg;				/* sec 46 #6 */
	LambdaSol = adj360(LambdaSol);
	l = 13.1763966 * days + lzero;				/* sec 65 #4 */
	l = adj360(l);
	Mm = l - (0.1114041 * days) - Pzero;			/* sec 65 #5 */
	Mm = adj360(Mm);
	Nm = Nzero - (0.0529539 * days);			/* sec 65 #6 */
	Nm = adj360(Nm);
	Ev = 1.2739 * Math.sin(dtor(2*(l - LambdaSol) - Mm));	/* sec 65 #7 */
	Ac = 0.1858 * Math.sin(dtor(Msol));				/* sec 65 #8 */
	A3 = 0.37 * Math.sin(dtor(Msol));
	Mmprime = Mm + Ev - Ac - A3;				/* sec 65 #9 */
	Ec = 6.2886 * Math.sin(dtor(Mmprime));			/* sec 65 #10 */
	A4 = 0.214 * Math.sin(dtor(2 * Mmprime));			/* sec 65 #11 */
	lprime = l + Ev + Ec - Ac + A4;				/* sec 65 #12 */
	V = 0.6583 * Math.sin(dtor(2 * (lprime - LambdaSol)));	/* sec 65 #13 */
	ldprime = lprime + V;					/* sec 65 #14 */
	D = ldprime - LambdaSol;				/* sec 67 #2 */
	//return(50.0 * (1 - Math.cos(dtor(D))));			/* sec 67 #3 */
	//return((1 - Math.cos(dtor(D)))/2.0);			/* sec 67 #3 */
	return (adj360(D) / 360.0);
}

/*
 * dtor --
 *	convert degrees to radians
 */
function dtor(deg)
{
	return(deg * PI / 180);
}

/*
 * adj360 --
 *	adjust value so 0 <= deg <= 360
 */

function adj360(deg)

{
//while (deg < 0 || deg > 360)	{
for(;;){
		if (deg < 0)  { deg += 360; }
		else if (deg > 360) { deg -= 360; }
		else break;
	}
return deg;
}


// Provides an SVG path to draw the terminator (the moon phase curve) given a phase

function phase_shape(p){
     	if (p <= NEW + PRECISION)
		{shape = "";}
        if ((p > NEW + PRECISION) && (p <= FIRST - PRECISION))
		{shape = "<path d='M50,100 a" + (50-(p*200)) + ",50 1 0,0 0,-100 a50,50 1 0,1 0,100'";}
		if ((p > FIRST - PRECISION) && (p <= FIRST + PRECISION))
		{shape = "<path d='M50,100 L 50,0 a50,50 1 0,1 0,100'";}
        if ((p > FIRST + PRECISION) && (p <= FULL - PRECISION))
		{shape = "<path d='M50,100 a" + ((p*200)-50) + ",50 1 0,1 0,-100 a50,50 1 0,1 0,100'";}
		if ((p > FULL - PRECISION) && (p <= FULL + PRECISION))
		{shape = "<circle cx='50' cy='50' r='50'";}
        if ((p > FULL + PRECISION) && (p <= LAST - PRECISION))
		{shape = "<path d='M50,100 a" + (50-((p-0.5)*200)) + ",50 1 0,0 0,-100 a50,50 1 0,0 0,100'";}
        if ((p > LAST - PRECISION) && (p <= LAST + PRECISION))
		{shape = "<path d='M50,100 L 50,0 a50,50 1 0,0 0,100'";}
        if ((p > LAST + PRECISION) && (p <= NEXTNEW - PRECISION))
		{shape = "<path d='M50,100 a" + (((p-0.5)*200)-50) + ",50 1 0,1 0,-100 a50,50 1 0,0 0,100'";}
        if ((p > NEXTNEW - PRECISION) && (p <= NEXTNEW + PRECISION))
		{shape = "";}

	return shape;
}

