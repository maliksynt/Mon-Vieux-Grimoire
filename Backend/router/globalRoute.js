const express = require("express");
const router = express.Router();
const globalController = require("../controllers/globalController");
const auth = require("../middlewares/auth");

// Définition des routes
router.get("/", globalController.getAllBooks); // Route pour obtenir tous les livres
router.get("/:id", globalController.getOneBook); // Route pour obtenir un livre spécifique
router.get("/bestrating", globalController.getBestBooks); // Route pour obtenir les 3 meilleurs livres
router.post("/", auth, globalController.createBook); // Route pour créer un livre
router.put("/:id", auth, globalController.modifyBook); // Route pour modifier un livre
router.delete("/:id", auth, globalController.deleteBook); // Route pour supprimer un livre
router.post("/:id/rating", auth, globalController.rateBook); // Route pour noter un livre

module.exports = router;
