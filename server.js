//need a "save article" function (like eat the burger) with paths that show saved and unsaved articles











var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/squirrelyBird", { useNewUrlParser: true });

app.get("/scrape", function (req, res) {
  // this scrapes, console logs in node and puts objects on /articles
  axios.get("https://www.duffelblog.com/").then(function (response) {
    var $ = cheerio.load(response.data);

    $("li.mvp-blog-story-wrap").each(function (i, element) {
      var result = {};

      result.title = $(this).find("h2").text();
      result.link = $(this).find("a").attr("href");

      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    res.send("Scrape Complete");
  });
});

//this works! 
app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

//these routes below now also work!
app.get("/articles/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })

    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

//this does not work
app.post("/marksaved/:id", function (req, res) {
  console.log("this is the marksave area")
  console.log(req.params)
    db.Article.updateOne({ _id: req.params.id },
    { 
      $set: {
        saved: true
      }
    }).then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});
    
    
  // app.get("/markunread/:id", function(req, res) {
  //   // Remember: when searching by an id, the id needs to be passed in
  //   // as (mongojs.ObjectId(IdYouWantToFind))
  //   db.Article.update({
  //     _id:mongojs.ObjectId(req.params.id)
  //   },
  //   {
  //     $set: {
  //       read: false
  //     }
  //   }, function(error, edited) {
  //     if (error) {
  //       console.log(error);
  //       res.send(error); //this documents the error in the DB
  //     } else {
  //       res.send(edited);
  //     }
  //   })
  // });

// });

app.listen(3000, function () {
  console.log("App running on port 3000!");
});