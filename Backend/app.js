const mongoose = require("mongoose");
const express = require("express");
const userRoute = require("./router/userRoute");
const globalRoute = require("./router/globalRoute");
const path = require("path");

// Initialisation de l'application Express.
const app = express();
// Middleware pour analyser le corps des requêtes JSON.
app.use(express.json());

// Connexion à la base de données MongoDB avec gestion des succès et des erreurs.
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

// Configuration des en-têtes CORS pour permettre les requêtes cross-origin.
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

// Définition des routes pour l'authentification des utilisateurs et les opérations globales.
app.use("/api/auth", userRoute);
app.use("/api/books", globalRoute);
// Serve les fichiers statiques depuis le dossier 'images'.
app.use("/images", express.static(path.join(__dirname, "images")));

// Exporte l'application pour utilisation dans d'autres fichiers, comme le serveur.
module.exports = app;
