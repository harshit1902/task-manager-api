//express
const express = require("express");
const app = express();
const port = process.env.PORT;

//frontend hbs
const path = require("path");
const hbs = require("hbs");

// define path for Express config
const publicDirPath = path.join(__dirname, "../public");
const viewsPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

// setup handlebars engine and views location
app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

//setup static directory to serve
app.use(express.static(publicDirPath));

// home page
app.get("", (req, res) => {
  res.render("index", {
    title: "Task Manager API",
    name: "Harshit Goyal",
  });
});

//about page
app.get("/about", (req, res) => {
  res.render("about", { title: "About Page", name: "Harshit Goyal" });
});

//help page
app.get("/help", (req, res) => {
  res.render("help", {
    title: "Help Page",
    name: "Harshit Goyal",
    msg:
      "Fell free to mail us at dev.harshit19@gmail.com if you need any help.",
  });
});

//routes
const UserRoutes = require("./Routes/UserRoutes");
const TaskRoutes = require("./Routes/TaskRoutes");

//DB Connection
require("./db/mongoose");

// Parsing Body of request
app.use(express.json());

//Adding routes
app.use(UserRoutes);
app.use(TaskRoutes);

//404
app.get("*", (req, res) => {
  res.render("404", {
    title: "404",
    msg: "Page NOT Found!!",
    name: "Harshit Goyal",
  });
});

app.listen(port, () => {
  console.log(`"Server is up on ${port}"`);
});
