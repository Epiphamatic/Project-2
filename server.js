const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./models");
const app = express();
const exphbs = require("express-handlebars");
var PORT = process.env.PORT || 10010;

// Middleware
app
  .use(express.static(__dirname + "/public"))
  .use(express.urlencoded({ extended: false }))
  .use(cors())
  .use(express.json())
  .use(cookieParser());

// Kamakshi
// app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
// app.set('view engine', 'handlebars');

// Handlebars
// app.engine(
//   "handlebars",
//   exphbs({
//     defaultLayout: "main"
//   })
// );
// app.set("view engine", "handlebars");

// Routes
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

// <<<<<<< kamakshi1
// app.listen(PORT, function () {
//   //console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
//   console.log("==> 🌎  Listening on port 10010. Visit http://localhost:10010/ in your browser.", PORT, PORT);

var syncOptions = { force: false };

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
db.sequelize.sync(syncOptions).then(function() {
  app.listen(PORT, function() {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
});

module.exports = app;
