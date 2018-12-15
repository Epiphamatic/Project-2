require("dotenv").config();
const keys = require("../config/keys");
const client_id = keys.id;
const client_secret = keys.secret;
const fetch = require("node-fetch");
// Requiring our Playlist model
const db = require("../models");
//axios is dedicated for refresh the Spotify Token
const axios = require("axios");

// server side access token
let at;
//rankup trigger
let upTrigger;
//rankdown trigger
const downTrigger = 3;
//Deleted Song's ID
let databaseDeletedSongId = [];
// Magic spotify, need huge improvement on this part document!!!
// I have to use a different package axios to fetch. Node-fetch just not work.
function refreshSpotifyToken() {
  axios({
    url: "https://accounts.spotify.com/api/token",
    method: "post",
    params: {
      grant_type: "client_credentials"
    },
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    auth: {
      username: `${client_id}`,
      password: `${client_secret}`
    }
  })
    .then(function (response) {
      //! console.log(response.data.access_token);
      db.Token.update(
        { accessToken: response.data.access_token },
        { where: { id: 1 } }
      );
    })
    .catch(function (error) { });
}

function deleteFromSpotify(songId) {
  let spotifyPlaylistId;
  let spotifyAccessToken;
  db.Token.findOne({ where: { id: 1 } }).then(data => {
    spotifyPlaylistId = data.playlistId;
    spotifyAccessToken = data.accessToken;
    fetch(`https://api.spotify.com/v1/playlists/${spotifyPlaylistId}/tracks`, {
      method: "DELETE",
      body: songId,
      headers: {
        Authorization: `Bearer ${spotifyAccessToken}`,
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(err => console.log(err));
  });
}
function deleteFromDatabase(db_id) {
  let uri;
  db.Playlist.findOne({ where: { id: db_id } })
    .then(data => {
      uri = JSON.stringify({ tracks: [{ uri: data.uri }] });
      if (data.downcount < downTrigger) {
        return;
      }
      db.Playlist.destroy({ where: { id: db_id } }).then(() => {
        databaseDeletedSongId.push(parseInt(data.id));
      });

      deleteFromSpotify(uri);
    })
    .catch(err => {
      console.log(err);
    });
}
module.exports = function (app) {
  // Token Kamakshi's way with useid and token deleted
  // *************kamakshi1******************
  // Create a new example
  //   app.post("/api/token", function (req, res) {
  //     var userid = req.body.userid || {deleted}
  //     var token = req.body.token || {deleted}
  //     spotify
  //       .request('https://api.spotify.com/v1/users/' + userid + '/playlists')
  //       .then(function (data) {
  //         res.json(data);
  //         console.log(data);
  //       })
  //       .catch(function (err) {
  //         console.error('Error occurred: ' + err);
  //       });
  // * Token Qi's way
  // * Store the token in database.
  // * Only the current token stored. Expired one always get updated.
  app.post("/api/token", function (req, res) {
    at = req.body.access_token;
    let user_id = req.body.spotify_user_id;
    db.Token.findOne({ where: { id: 1 } }).then(function (theOne) {
      if (theOne) {
        db.Token.update(
          {
            accessToken: req.body.access_token,
            refreshToken: req.body.refresh_token,
            hostId: req.body.spotify_user_id
          },
          { where: { id: 1 } }
        ).then(() => {
          setInterval(refreshSpotifyToken, 3500000);
        });
      } else {
        db.Token.create({
          accessToken: req.body.access_token,
          refreshToken: req.body.refresh_token,
          hostId: req.body.spotify_user_id
        });
      }
    });

    fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
      headers: { Authorization: `Bearer ${at}` }
    })
      .then(response => response.json())
      .then(data => res.json(data));
  });

  // Put-thumbUp-thumbDown
  // Action option: thumbup , thumbdown

  app.get("/api/:action/:id", function (req, res) {
    let upORdown = req.params.action;
    let db_id = req.params.id;
    console.log(db_id);
    console.log(databaseDeletedSongId);
    if (upORdown === "thumbup") {
      db.Playlist.findOne({ where: { id: parseInt(req.params.id) } }).then(
        song => {
          return song.increment("upcount");
        }
      );
    } else {
      if (databaseDeletedSongId.indexOf(parseInt(db_id)) !== -1) {
        return;
      } else {
        db.Playlist.findOne({ where: { id: parseInt(req.params.id) } })
          .then(song => {
            return song.increment("downcount");
          })
          .then(() => {
            deleteFromDatabase(db_id);
          })
          .catch(err => {
            throw new Error("ID not exist");
          });
      }
    }
  });

  //reason not use spotify-web-api-node, IT IS NOT WORK!!!
  app.post("/api/tracks", function (req, res) {
    let playlist_id = req.body.playlistid;
    db.Token.update({ playlistId: playlist_id }, { where: { id: 1 } });
    fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
      headers: { Authorization: `Bearer ${at}` }
    })
      .then(response => response.json())
      .then(function (data) {
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
        });
      });
  });

  //*****************************************OAuth bridge End*********************************************//
  // * When guest.html loaded, it will automatically to fire this API Call.
  // * The API's response is a wrapper of tracks inside the playlist table and current token inside the token table.
  // * Magic promise.Great!
  app.get("/api/guest", function (req, res) {
    let dataAndToken = {};
    db.Playlist.findAll({}).then(function (tracks) {
      db.Token.findAll({}).then(function (token) {
        dataAndToken.data = tracks;
        dataAndToken.token = token;
        res.json(dataAndToken);
      });
    });
  });
  
  //by kamakshi to add song to playlist********************
  app.post("/music/add/", function (req, res) {
    //var addSong = req.body.burger_name;
console.log(req.body);
    var spotifyPlaylistId;
    var spotifyAccessToken;
    var spotifyArtistId;
    var song = req.body.song_name;
   // console.log("Song is "+ song);
    db.Token.findOne({
      where: {
        id: 1
      }

    }).then(data => {
      //Play list id also should be sent in body
      spotifyPlaylistId = req.body.playlistid || data.playlistId;
      spotifyAccessToken = data.accessToken;
      var undef;
      fetch(`https://api.spotify.com/v1/search?q=${song}&type=track&limit=1`, {
        headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": `Bearer ${spotifyAccessToken}`, }
      })
        .then(response => response.json())
        .then(function (data) {
          if (data.tracks.items[0] !== undef ) {
            console.log("Track is" + data.tracks.items[0].uri);
            selectedTrack = data.tracks.items[0].uri;
            spotifyArtistId = data.tracks.items[0].artists[0].name;
            //  res.json(data.items);
            var url = `https://api.spotify.com/v1/playlists/${spotifyPlaylistId}/tracks?uris=${selectedTrack}`;
            // console.log("********URL IN hANUMAN  is *********** " + url);
            // console.log("Hanuman Please 2ND TIME " + spotifyPlaylistId + " " + spotifyAccessToken)
            fetch(url, {
              method: "POST",
              headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": `Bearer ${spotifyAccessToken}`, }
  
            })
              .then(response => response.json())
              .then(function (data) {
                console.log("Added the track ********* " + data);
                //  res.json(data.items);
                db.Playlist.create({
                  rank: 0,
                  song: song,
                  uri:selectedTrack,
                  artist:spotifyArtistId,
                  upcount:0,
                  downcount:0
                });
                res.redirect('/guest.html');
  
              });
          } else {
            res.redirect('/guest.html');
          } 
        

        });

    });
    
  });
};
