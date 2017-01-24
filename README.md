# luna.js
Make a lunar phase calendar with Javascript 

## 0.Intro

Generate a daily moon phase calendar in your browser using SVG.

![Lunar calendar printout example](https://github.com/mir123/luna.js/blob/master/calendar_example.png "Lunar calendar printout example")

## 1. Usage

Download all files and put in folder. Open luna.html in your browser.

You need to modify some variables in luna.js for the start and end dates, page title and footer ~~and time zone~~(till I fix it). Also play with print zoom values in luna.css to adjust your output. Change font-family in luna.css to use your favourite font.

There is no fancy formatting (yet), each day of the calendar is output as an SVG drawing. But you can adjust the page if you want a specific width (say, one week).

Making [a PDF like the example here](https://github.com/mir123/luna.js/blob/master/2017_lunar.pdf) requires some manual work. I printed to PDF from Firefox, imported into Inkscape and prepared it by hand, then saved each PDF page separately and joined them with Ghostscript.


## 2. To do

- Add formatting options to make a weekly, monthly, etc calendar
- Add a user interface to change year, local time, time zone
- Improve print output from browser or add some fancy library for PDF output

## 3. Acknowledgements

This script is based on the BSD Games program pom by Keith E. Brandt. I translated part of pom.c to Javascript and added the SVG output bit. 

