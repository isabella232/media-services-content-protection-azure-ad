const express  = require("express"),
      app      = express(),
      routes   = require("./routes/routes"),
      PATH_ENV = "config/appsettings.env",
      bodyParser = require("body-parser"); 

const env = require('dotenv').config({ path: PATH_ENV});
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
//Parses the text as JSON and exposes the resulting object on req.body.
app.use(bodyParser.json());

app.set("view engine", "ejs");

//Express does not allow access to this folder by default
app.use(express.static("public"));

//register the routes
routes(app); 

app.listen(port, function(){
    console.log("npmweb listening on port: " + port);
})