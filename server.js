/* Scraper: Server #1  (18.2.1)
 * ========================= */

// Dependencies:

// Snatches HTML from URLs
var request = require("request");
// Scrapes our HTML
var cheerio = require("cheerio");

var request = require("request");
var logger = require("morgan");
var cheerio = require("cheerio");
var express = require("express");
var expressHandlebars = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var Article = require("./models/article.js");
var public = require

var Promise = require("bluebird");
mongoose.Promise = Promise;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/filescraperdb")

var db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});





// First, tell the console what server.js is doing
console.log("\n***********************************\n" +
            "Grabbing every thread name and link\n" +
            "from reddit's webdev board:" +
            "\n***********************************\n");

app.get("/", function(req, res) {
  res.send(index.html);
});

app.get("/scrape", function(req, res) {
// Making a request call for reddit's "webdev" board. The page's HTML is saved as the callback's third argument
request("https://techcrunch.com/startups/", function(error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  var result = {};

  // With cheerio, find each p-tag with the "title" class
  // (i: iterator. element: the current element)
  $("h2.post-title").each(function(i, element) {

    // Save the text of the element (this) in a "title" variable
    result.title = $(this).text();

    // In the currently selected element, look at its child elements (i.e., its a-tags),
    // then save the values for any "href" attributes that the child elements may have
    result.link = $(element).children().attr("href");

    // Save these results in an object that we'll push into the result array we defined earlier
    // result.push({
    //   title: title,
    //   link: link
    // });

    var entry = new Article(result);
    console.log(entry);


    entry.save(function(err, doc) {
      if(err) {
        console.log(err);
      }
      // Or log the doc
      else {
        console.log(doc);
      }
    });

  });

  // Log the result once cheerio analyzes each of its selected elements
  console.log(result);
 });
});

app.get("/articles", function(req, res) {

Article.find({}, function(error, doc){
  // Log errors if any
  if (error) {
    console.log(error);
  }
  // Or send this doc to the browser as a json object
  else {
    res.json(doc);
  }
 });
});

app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("note")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's note
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});



app.listen(3000, function() {
  console.log("App running on port 3000!");
});