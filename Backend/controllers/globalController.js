const Book = require("../models/bookModel");
const fs = require("fs");

// Récupère et renvoie tous les livres de la base de données.
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      // Envoie tous les livres trouvés avec un statut 200
      res.status(200).json(books);
    })
    .catch((error) => {
      // En cas d'erreur, renvoie un statut 400 avec l'erreur
      res.status(400).json({ error });
    });
};

// Récupère un livre spécifique par son ID.
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Arrondit la note moyenne du livre avant de l'envoyer
      book.averageRating = Math.floor(book.averageRating * 10) / 10;
      res.status(200).json(book);
    })
    .catch((error) => {
      // Si le livre n'est pas trouvé, renvoie un statut 404 avec l'erreur
      res.status(404).json({ error });
    });
};

// Crée un livre dans la base de données
exports.createBook = (req, res, next) => {
  // Parse le corps de la requête pour obtenir l'objet livre
  const bookObject = JSON.parse(req.body.book);
  // Vérifie si l'année du livre est supérieure à l'année actuelle
  if (bookObject.year > new Date().getFullYear()) {
    return res.status(401).json({ message: "Date incorrect" });
  }
  // Supprime l'ID généré automatiquement par MongoDB pour éviter les conflits
  delete bookObject._id;
  // Crée une nouvelle instance du modèle Book avec les données fournies
  const book = new Book({
    ...bookObject,
    // Construit l'URL de l'image basée sur le nom de fichier reçu et l'hôte
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  // Sauvegarde le livre dans la base de données
  book
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => {
      // En cas d'erreur lors de la sauvegarde, log l'erreur et renvoie une réponse d'erreur
      console.log(error);
      res.status(400).json({ error });
    });
};

// Supprime le livre avec l'_id fourni ainsi que l’image associée.
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        // Si le livre n'est pas trouvé, renvoie un statut 404.
        return res.status(404).json({ message: "Objet non trouvé !" });
      }
      // Vérifie si l'utilisateur qui fait la demande est le propriétaire du livre.
      if (book.userId !== req.auth.userId) {
        // Si non, renvoie un statut 400 pour une demande non autorisée.
        return res.status(400).json({ message: "Unauthorized request" });
      } else {
        // Extrait le nom du fichier de l'image à partir de l'URL.
        const filename = book.imageUrl.split("/images/")[1];
        // Supprime l'image du serveur.
        fs.unlink(`images/${filename}`, () => {
          // Supprime le livre de la base de données.
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Objet supprimé !" }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => {
      // Gère les erreurs de recherche ou de connexion à la base de données.
      res.status(500).json({ error });
    });
};

// Mettre à jour un livre déjà présent dans la base de données.
exports.modifyBook = (req, res, next) => {
  if (!req.params.id) {
    // Vérifie si l'ID du livre est fourni dans la requête.
    return res.status(400).json({ error: "L'ID du livre est manquant." });
  }

  // Recherche le livre par son ID pour s'assurer qu'il existe.
  Book.findOne({ _id: req.params.id })
    .then((bookFound) => {
      if (!bookFound) {
        // Si le livre n'est pas trouvé, renvoie un statut 404.
        return res.status(404).json({ message: "Objet non trouvé " });
      }
      if (bookFound.userId !== req.auth.userId) {
        // Vérifie si l'utilisateur actuel est le propriétaire du livre.
        return res.status(400).json({ message: "Unauthorized request" });
      } else {
        // Prépare l'objet livre avec les nouvelles données.
        const bookObject = req.file
          ? {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${
                req.file.filename
              }`,
            }
          : { ...req.body };
        delete bookObject._id; // Supprime l'ID pour éviter de l'écraser.

        // Supprime l'ancienne image si une nouvelle est fournie.
        if (req.file) {
          const filename = bookFound.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, (err) => {
            if (err) {
              console.log(
                "Erreur lors de la suppression de l'ancienne image:",
                err
              );
            }
            // Met à jour le livre avec les nouvelles données.
            Book.updateOne(
              { _id: req.params.id },
              { ...bookObject, _id: req.params.id }
            )
              .then(() =>
                res.status(200).json({ message: "Livre modifié avec succès !" })
              )
              .catch((error) => res.status(400).json({ error }));
          });
        } else {
          // Met à jour le livre sans changer l'image.
          Book.updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
            .then(() =>
              res.status(200).json({ message: "Livre modifié avec succès !" })
            )
            .catch((error) => res.status(400).json({ error }));
        }
      }
    })
    .catch((error) => {
      // Gère les erreurs de recherche ou de connexion à la base de données.
      res.status(400).json({ error });
    });
};

// Attribue une note à un livre que l'on ne possède pas et calcule la moyenne d'étoiles de ce livre.
exports.rateBook = (req, res, next) => {
  const userId = req.body.userId;
  const grade = req.body.rating;
  // Vérifie que la note est comprise entre 0 et 5.
  if (grade < 0 || grade > 5) {
    return res
      .status(400)
      .json({ message: "La note doit être comprise entre 0 et 5." });
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        // Si le livre n'est pas trouvé, renvoie un message d'erreur.
        return res.status(400).json({ message: "Livre non trouvé! " });
      }
      if (book.userId === req.auth.userId) {
        // Empêche l'utilisateur de noter son propre livre.
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Vérifie si l'utilisateur a déjà noté le livre.
      const hasAlreadyRated = book.ratings.some(
        (rating) => rating.userId.toString() === userId
      );
      if (hasAlreadyRated) {
        // Si oui, empêche une nouvelle notation.
        return res
          .status(400)
          .json({ message: "L'utilisateur a déjà noté ce livre" });
      }

      // Ajoute la nouvelle note au tableau des notes du livre.
      book.ratings.push({ userId, grade });
      // Calcule la nouvelle moyenne des notes.
      const totalGrade = book.ratings.reduce(
        (accumulator, currentValue) => accumulator + currentValue.grade,
        0
      );
      book.averageRating = totalGrade / book.ratings.length;

      // Sauvegarde les modifications dans la base de données.
      book
        .save()
        .then(() => res.status(200).json(book))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

// Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
exports.getBestBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Trie les livres par note moyenne décroissante.
    .limit(3) // Limite le résultat aux 3 meilleurs livres.
    .then((books) => {
      // Envoie le tableau des livres avec un statut 200.
      res.status(200).json(books);
    })
    .catch((error) => {
      // En cas d'erreur, renvoie un statut 400 avec l'erreur.
      res.status(400).json({ error });
    });
};
