var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
var PORT = 3000;
var app = express();

// middleware

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/squirrelyBird", { useNewUrlParser: true });
app.get("/scrape", function (req, res) {
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

app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

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

app.post("/markunsaved/:id", function (req, res) {
  console.log("this is the unsave area")
  console.log(req.params)
  db.Article.updateOne({ _id: req.params.id },
    {
      $set: {
        saved: false
      }
    }).then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.listen(3000, function () {
  console.log("App running on port 3000!");
});