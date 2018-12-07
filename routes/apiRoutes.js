require("dotenv").config();
const keys = require("../config/keys");
const client_id = keys.id;
const client_secret = keys.secret;
const redirect_uri = keys.uri;
var music = require("../models/music.js");
var Spotify = require('node-spotify-api');
//var spotify = new Spotify(keys.spotify);
var spotify = new Spotify({
  id: client_id,
  secret: client_secret
});
console.log("Key is " + keys.spotify);

module.exports = function (app) {
  // Get all examples
  app.get("/api/examples", function (req, res) {
    db.Example.findAll({}).then(function (dbExamples) {
      res.json(dbExamples);
    });
  });

  // Create a new example
  app.post("/api/token", function (req, res) {
    var userid = req.body.userid || "dloacqj8ljktv5c86ka0az6uw";
    var token = req.body.token || "BQDgUq0modCTeB1MlVq9M6smp-32288flwmz_lZKaiXvP8RuuIz38cRX12UOfay6CQ0YTImsWZcyF8G-7OZ8mMW7Po7itzGl7s4IhBoyd85fOiYV7eoafIJCd65XBGTmpNr9AxJMhEcC9pF8eHLdhKTIYoiWlVObf7JFEMZnVliWhxl3viMd56K0Sg3WoPQA6_TFZ-8jlp7Q14yQoatagPl2";
    spotify
      .request('https://api.spotify.com/v1/users/' + userid + '/playlists')
      .then(function (data) {
        res.json(data);
        console.log(data);
      })
      .catch(function (err) {
        console.error('Error occurred: ' + err);
      });
    console.log(req.body);
  });

  //add*************************

  app.post("/music/add/", function (req, res) {
    //var addSong = req.body.burger_name;
    //console.log("Burger Name is " + addSong);
var rank = req.body.rank || 2;
var artist = req.body.artist || "Rehman";
var upcount = req.body.upcount || 4;
var downcount = req.body.downcount || 2;
    music.create({
      rank: rank,
      song: req.body.song,
      artist: artist,
      upcount: upcount,
      downcount: downcount

    });
    res.redirect('/');
    
    // burger.add(burgerName, function(data) {
    //     console.log("In update");
    //     res.redirect('/');
    //   });
  });

  //*************************************************
  // Delete an example by id
  app.delete("/api/examples/:id", function (req, res) {
    db.Example.destroy({ where: { id: req.params.id } }).then(function (
      dbExample
    ) {
      res.json(dbExample);
    });
  });

  app.get("/api/guest/songs", function (req, res) {
    music.findAll({}).then(function (songs) {
      res.json(songs);
    });
  });



};
