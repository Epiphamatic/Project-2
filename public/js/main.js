var db = require("../../models");

var songShow = function() {

    // $(".granted").empty();

    for (var i = 0; i < db.Playlist.length; i++) {

      // var playlist = $("<button>" + db.Playlist[i].name + "</button>");

      // $(".granted").append(playlist);

      console.log(db.Playlist.name[i]);

    }
};

$(document).on("click", ".chosenPlaylist", songShow);