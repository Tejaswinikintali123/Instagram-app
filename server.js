const express = require("express");
const mongoose = require("mongoose");
const app = express();
const db = require("./config/keys").mongoURI;
const users = require("./routes/api/users");
const post = require("./routes/api/post");
const profile = require("./routes/api/profile");
mongoose
  .connect(db)
  .then(() => console.log("MongDb Connected"))
  .catch(err => console.log(err));
//Let's write our first route
app.get("/", (req, res) => res.send("Hello"));
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/post", post);

const port = process.env.PORT || 5300;
app.listen(port, () => console.log(`server running on port ${port}`));
