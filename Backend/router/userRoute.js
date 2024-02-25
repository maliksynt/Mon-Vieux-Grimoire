const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Définit les routes pour l'inscription et la connexion des utilisateurs.
router.post("/signup", userController.signup);
router.post("/login", userController.login);

// Exporte le routeur pour être utilisé dans l'application principale.
module.exports = router;
