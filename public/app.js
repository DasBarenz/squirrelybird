// Grab the articles as a json
// $.getJSON("/articles", function (data) {
//   if (data.saved == false) {
//     for (var i = data.length - 1; i >= 0; i--) {
//       $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + "<span class=links>" + data[i].link + "</span>" + "</p>");
//       $("#articles").append("<button type=" + "button" + " id=" + "saveArticle " + "data-id=" + data[i]._id + " name=" + "saveButton" + ">Save Article</button>");
//     }
//   } else {
//     for (var i = data.length - 1; i >= 0; i--) {
//       $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + "<span class=links>" + data[i].link + "</span>" + "</p>");
//       // $("#articles").append("<button type=" + "button" + " id=" + "saveArticle " + "data-id=" + data[i]._id + " name=" + "saveButton" + ">Save Article</button>");
//     }
//     console.log(data)
//   }
// });

function dataRender() {
  $.getJSON("/articles", function (data) {
    for (var i = data.length - 1; i >= 0; i--) {
      if (data[i].saved == false) {
        $("#unsaved").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + "<span class=links>" + data[i].link + "</span>" + "</p>");
        $("#unsaved").append("<button type='button' class='btn btn-success' id='saveArticle' data-id=" + data[i]._id + " name='saveButton'" + ">Save Article</button>");
      } else {
        $("#saved").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + "<span class=links>" + data[i].link + "</span>" + "</p>");
        $("#saved").append("<button type='button' class='btn btn-secondary' id='unsaveArticle' data-id=" + data[i]._id + " name='unsaveButton'" + ">Unsave Article</button>");
      }
      console.log(data)
    }
  });
};

dataRender();

// $.getJSON("/articles", function (data) {
//   for (var i = data.length - 1; i >= 0; i--) {
//     $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + "<span class=links>" + data[i].link + "</span>" + "</p>");
//     $("#articles").append("<button type=" + "button" + " id=" + "saveArticle " + "data-id=" + data[i]._id + " name=" + "saveButton" + ">Save Article</button>");
//   }
//   console.log(data)
// });

//note section
$(document).on("click", "p", function () {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function (data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h4>" + data.title + "</h4>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' placeholder='Title'>");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body' placeholder='Note'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// savenote button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

$(document).on("click", "#saveArticle", function () {
  var thisId = $(this).attr("data-id");
  console.log("you clicked save")

  $.ajax({
    method: "POST",
    url: "/marksaved/" + thisId,
    data: {
      saved: true
    }
  })
    .then(function (data) {
      console.log(data);
      dataRender();
    });
});

$(document).on("click", "#unsaveArticle", function () {
  var thisId = $(this).attr("data-id");
  console.log("you clicked unsave on id# " + $(this).attr("data-id"))

  $.ajax({
    method: "POST",
    url: "/markunsaved/" + thisId,
    data: {
      saved: false
    }
  })
    .then(function (data) {
      console.log(data);
      dataRender();
    });
});
