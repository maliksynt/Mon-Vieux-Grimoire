const express = require("express");
const router = express.Router();
const globalController = require("../controllers/globalController");
const auth = require("../middlewares/auth");
const multer = require("../middlewares/multerConfig");

// Définition des routes
router.get("/", globalController.getAllBooks); // Route pour obtenir tous les livres
router.get("/bestrating", globalController.getBestBooks); // Route pour obtenir les 3 meilleurs livres
router.get("/:id", globalController.getOneBook); // Route pour obtenir un livre spécifique
// Route pour créer un livre
router.post(
  "/",
  auth,
  multer.upload,
  multer.optimizeImage,
  globalController.createBook
);
// Route pour modifier un livre
router.put(
  "/:id",
  auth,
  multer.upload,
  multer.optimizeImage,
  globalController.modifyBook
);
router.delete("/:id", auth, globalController.deleteBook); // Route pour supprimer un livre
router.post("/:id/rating", auth, globalController.rateBook); // Route pour noter un livre

module.exports = router;
