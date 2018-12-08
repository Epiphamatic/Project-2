const SpotifyWebApi = require("spotify-web-api-node");
let spotifyApi = new SpotifyWebApi();
//server-side access token
let at = "";
//server-side refresh token
let rt = "";
let spotify_user_id = "";
// Requiring our Playlist model
const db = require("../models");
module.exports = function(app) {
  // Get all examples
  app.get("/api/examples", function(req, res) {
    db.Example.findAll({}).then(function(dbExamples) {
      res.json(dbExamples);
    });
  });

  // Token
  app.post("/api/token", function(req, res) {
    console.log(req.body);
    at = req.body.access_token;
    rt = req.body.refresh_token;
    spotify_user_id = req.body.spotify_user_id;
    spotifyApi.setAccessToken(at);
    spotifyApi.getUserPlaylists(spotify_user_id).then(
      function(data) {
        console.log("Retrieved playlists", data.body);
        res.json(data.body);
      },
      function(err) {
        console.log("Something went wrong!", err);
      }
    );
  });

  // Delete an example by id
  app.delete("/api/examples/:id", function(req, res) {
    db.Example.destroy({ where: { id: req.params.id } }).then(function(
      dbExample
    ) {
      res.json(dbExample);
    });
  });

  // Put-thumbUp-thumbDown
  // Action option: thumbup , thumbdown

  app.put("/api/:action/:id", function(req, res) {
    let upORdown = req.params.action;
    if (upORdown === "thumbup") {
      db.Playlist.increment("upcount", { where: { id: req.params.id } });
    } else {
      db.Playlist.increment("downcount", { where: { id: req.params.id } });
    }
  });
};
