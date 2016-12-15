var express = require('express');
var router = express.Router();
var path = require('path');

//require request and cheerio to scrape
var request = require('request');
var cheerio = require('cheerio');

//Require models
var Comment = require('../models/article.js');
var Article = require('../models/note.js');


// Index Route
router.get('/', function (req, res) {
  res.redirect("/scrape");
});

// Articles Rendering 
// router.get('/articles', function(req, res) {
//   // MongoDB query for all article entries sorting by newest and populates comments associated with the article
//     // Article.find().sort({_id: -1})
//     // .populate('comments')
//     // Send to handlebars
//     .exec(function(err, doc){
//       if(err){
//         console.log(err);
//       }
//       else {
//         var hbsObject = {articles: doc}
//         res.render('index', hbsObject);
//       }
//     });
// });

// Mongoose Scrape route
app.get('/scrape', function(req, res) {
    // first, we grab the body of the html with request
  request("https://techcrunch.com/startups/", function(error, response, html) {
    // then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Error Handler to prevent duplicates
   var result = {};
    // now, we grab every h2 within an article tag, and do the following:
    $('h2.post-title').each(function(i, element) {
        var result = {};

         result.title = $(this).text();

         result.link = $(element).children().attr("href");

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

console.log(result);
    // Redirect to the Articles Page, done at the end of request 
    // res.redirect("/articles");
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


// Add a comment route
router.post('/add/comment/:id', function(req, res) {

  // Collect id, author, and comment content
  var articleId = req.params.id;
  var author = req.body.name;
  var comment = req.body.comment;

  // "result" object has same key-value pairs as Comment model
  var result = {
    author: author,
    content: comment
  } 
  // Using the Comment model, create a new comment entry
  var entry = new Comment (result);

  // Save the entry to the database
  entry.save(function(err, doc) {
    // log any errors
    if (err) {
      console.log(err);
    } 
    // Or, relate the comment to the article
    else {
      // Push the new Comment to the list of comments in the article
      Article.findOneAndUpdate({'_id': articleId}, {$push: {'comments':doc._id}}, {new: true})
      // execute the above query
      .exec(function(err, doc){
        // log any errors
        if (err){
          console.log(err);
        } else {
          // Send Success Header
          res.sendStatus(200);
        }
      });
    }
  });

});

// Delete Comment Route
router.post('/remove/comment/:id', function (req, res){

  // Collect comment id
  var commentId = req.params.id;
  // Find and Delete the Comment using the Id
  Comment.findByIdAndRemove(commentId, function (err, todo) {  
    if (err) {
      console.log(err);
    } 
    else {
      // Send Success Header
      res.sendStatus(200);
    }
  });

});


module.exports = router;