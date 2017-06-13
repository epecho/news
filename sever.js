// Require our dependencies
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var expressHandlebars = require('express-handlebars');
var bodyParser = require('body-parser');

// Instantiate our Express App
var app = express();

// Designate our public folder as a static directory
app.use(express.static(__dirname + '/public'));

// connect Handlebars to our Express app
app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// use bodyParser in our app
app.use(bodyParser.urlencoded({
    extended: false
}));

// Save MongoDB directory to a db var
var db = 'mongodb://localhost/mongoHeadlines';

// Connect that directory to Mongoose, for simple, powerful querying
mongoose.connect(db, function(err){
	// log any errors connecting with mongoose
  if(err){
    console.log(err);
  }
  // or log a success message
  else {
    console.log('mongoose connection is sucessful');
  }
});




// Routes
// ======

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("https://news.ycombinator.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.send("Scrape Complete");
});





// bring in our routes file into the the server files
var routes = require('./config/routes.js');

// Incorporate these routes into our app
app.use('/', routes);
app.use('/test', routes);
app.use('/fetch', routes);
app.use('/gather', routes);
app.use('/check', routes);
app.use('/save', routes);
app.use('/delete', routes);

// set up our port to be either the host's designated port, or 3000
var port = process.env.PORT || 3000;

// set our app to listen on the port.
app.listen(port, function() {
    console.log("lisenting on port:" + port);
});
