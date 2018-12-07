var Sequelize = require("sequelize");
// sequelize (lowercase) references our connection to the DB.
var sequelize = require("../config/connection.js");


var Playlist = sequelize.define("Playlist", {
    rank: { type: Sequelize.INTEGER, allowNull: false },
    song: { type: Sequelize.STRING, allowNull: false },
    artist: { type: Sequelize.STRING, allowNull: false },
    upcount: { type: Sequelize.INTEGER, allowNull: false },
    downcount: { type: Sequelize.INTEGER, allowNull: false },
}, {
        timestamps: false

    });


// Syncs with DB
Playlist.sync();
// Makes the Chirp Model available for other files (will also create a table)
module.exports = Playlist;