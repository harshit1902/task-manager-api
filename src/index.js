//express
const express = require("express");
const app = express();
const port = process.env.PORT;

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

app.listen(port, () => {
  console.log(`"Server is up on ${port}"`);
});
