const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
var PORT = process.env.PORT || 10010;

// Middleware
app
  .use(express.static(__dirname + "/public"))
  .use(express.urlencoded({ extended: false }))
  .use(cors())
  .use(express.json())
  .use(cookieParser());

var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Routes
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

app.listen(PORT, function () {
  //console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
  console.log("==> 🌎  Listening on port 10010. Visit http://localhost:10010/ in your browser.", PORT, PORT);
});

module.exports = app;
