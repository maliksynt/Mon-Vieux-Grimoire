const mongoose = require("mongoose");
const express = require("express");
const userRoute = require("./router/userRoute");
const globalRoute = require("./router/globalRoute");

const app = express();
app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://testUser:testPassword@clustertest.duhyn32.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use("/api/auth", userRoute);
app.use("/api/books", globalRoute);

module.exports = app;
