const Book = require("../models/bookModel");
const fs = require("fs");

// Renvoie un tableau de tous les livres de la base de données.
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Renvoie le livre avec l’_id fourni.
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};

// Crée un livre dans la base de données
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  const book = new Book({
    ...bookObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => {
      console.log(error);
      res.status(400).json({ error });
    });
};

// Supprime le livre avec l'_id fourni ainsi que l’image associée.
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Objet non trouvé !" });
      }
      if (book.userId !== req.auth.userId) {
        return res.status(400).json({ message: "Unauthorized request" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Objet supprimé !" }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Mettre un jour un livre déjà présent dans la base de données.
exports.modifyBook = (req, res, next) => {
  if (!req.params.id) {
    return res.status(400).json({ error: "L'ID du livre est manquant." });
  }

  Book.findOne({ _id: req.params.id }).then(() => {
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };
    delete bookObject._id;
    Book.findOne({ _id: req.params.id })
      .then((book) => {
        if (!book) {
          return res.status(404).json({ message: "Objet non trouvé " });
        }
        if (book.userId !== req.auth.userId) {
          return res.status(400).json({ message: "Unauthorized request" });
        } else {
          const filename = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
            Book.updateOne(
              { _id: req.params.id },
              { ...bookObject, id: req.params.id }
            )
              .then(
                res.status(200).json({ message: "Livre modifié avec succès !" })
              )
              .catch((error) => res.status(400).json({ error }));
          });
        }
      })
      .catch((error) => res.status(400).json({ error }));
  });
};

// Attribue une note à un livre que l'on ne possède pas et calcule ma moyenne d'étoiles de ce livre.
exports.rateBook = (req, res, next) => {
  const userId = req.body.userId;
  const grade = req.body.rating;
  if (grade < 0 || grade > 5) {
    return res
      .status(400)
      .json({ message: "La note doit être comprise entre 0 et 5." });
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(400).json({ message: "Livre non trouvé! " });
      }
      if (book.userId === req.auth.userId) {
        res.status(401).json({ message: "Unauthorized" });
      }

      const hasAlreadyRated = book.ratings.some(
        (rating) => rating.userId.toString() === userId
      );
      if (hasAlreadyRated) {
        return res
          .status(400)
          .json({ message: "L'utilisateur a déjà noté ce livre" });
      }

      book.ratings.push({ userId, grade });
      const totalGrade = book.ratings.reduce(
        (accumulator, currentValue) => accumulator + currentValue.grade,
        0
      );
      book.averageRating = totalGrade / book.ratings.length;

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
    .sort({ averageRating: -1 })
    .limit(3)
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => res.status(400).json({ error }));
};
