# D3.js
This repo provides a interactive visualization made from repaly of task placement using the google data server logs. The data obtained from the Big data set open source of the Google repos.I tried to make a visualization with the columns of the data available in the dataset.For removing the redundancy in the data. The data with similar values are grouped together to get the clear visualization occuring in the server dataset .My D3 project begin with Setting up the html, css, and javascript files is a starting process to work on the project where the code is mapped to create a parallel coordinate plot using the pre processed dataset from the ICHEC server.


# What's in here?
index.html: this file loads the css and javascript files and has a basic html structure.
parallel_coordinates_laptops.css : all the css styling are done here .
index1.js: this is the important file. All your D3 code are placed in here .
part1.csv: data file, obtained from processing the server log data From the ICHEC server using spark.
graph.html:A simple html describing about the project name wth author and superviors name 


How to run the set of code to run it locally.

Start a local web server to see my work. To do this, navigate to this folder in your terminal and run the command python -m SimpleHTTPServer (Python 2.x) or python -m http.server (Python 3.x). Then, go to localhost:8000 in your browser.

How the first page will loook when the code is up and runnig in the local system.
![ScreenShot](/first_page.JPG)
