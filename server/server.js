//Node.js ==> Express Framework (SIMPLE SERVER)
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const path = require("path");
const bodyParser = require("body-parser");
const bootstrap = require("./src/boostrap");

//Use a Custom Templating Engine
//app.set("view engine", "pug");

//app.set("views", path.resolve("./src/views"));

//Request Parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//Create Express Router
const router = express.Router();
app.use("/api", router);

const API_PORT = process.env.PORT || 3001;

// launch our backend into a port
app.listen(API_PORT, (err) => {
  if (err) {
    return console.log(`Cannot Listen on PORT: ${API_PORT}`);
  }
  return console.log(`Server is Listening on: http://localhost:${API_PORT}/`);
});

// const rootPath = path.resolve("./dist");
// app.use(express.static(rootPath));

bootstrap(app, router);

//Main Page (Home)
router.get("/", (req, res, next) => {
  return res.send("Hello There");
});
router.get("/try", async (req, res, next) => {
  return res.json("Hello There");
});

// router.use((err, req, res, next) => {
//   if (err) {
//     //Handle file type and max size of image
//     return res.send(err.message);
//   }
// });
