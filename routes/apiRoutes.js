const fetch = require("node-fetch");
// Requiring our Playlist model
const db = require("../models");
//server-side access token
let at = "";
//server-side refresh token
let rt = "";
//server-side user_id
let user_id = "";
//server-side playlist_id
let playlist_id = "";
//rankup trigger
let upTrigger;
//rankdown trigger
let downTrigger;

// function deleteTrack(){
//   fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
//   method: "DELETE",
//   body:
//   headers: { Authorization: `Bearer ${at}`,
//   "Content-Type": "application/json" }
//     })
// }

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
    user_id = req.body.spotify_user_id;
    fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
      headers: { Authorization: `Bearer ${at}` }
    })
      .then(response => response.json())
      .then(data => res.json(data));
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

  //reason not use spotify-web-api-node, IT IS NOT WORK!!!
  app.post("/api/tracks", function(req, res) {
    playlist_id = req.body.playlistid;
    // console.log(playlist_id);
    fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
      headers: { Authorization: `Bearer ${at}` }
    })
      .then(response => response.json())
      .then(function(data) {
        // res.json(data);
        let track = data.items;
        let trackdata = track.map((elem, index) => {
          return {
            rank: index,
            song: elem.track.name,
            uri: elem.track.uri,
            artist: elem.track.artists[0].name
          };
        });
        db.Playlist.bulkCreate(trackdata).then(() => {
          return;
          // db.Playlist.findAll({}).then(data => {
          //   console.log(data);
          // });
        });
      });
  });
};
