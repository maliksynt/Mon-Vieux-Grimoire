const Book = require("../models/bookModel");

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
      console.log(book);
      res
        .status(200)
        .json(book)
        .catch((error) => {
          res.status(404).json({ error });
        });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// Capture et enregistre l'image, analyse le livre transformé en chaîne de caractères, et l'enregistre dans la base de données en définissant correctement son ImageUrl.

exports.createBook = (req, res, next) => {
  // console.log(req.auth.userId);
  console.log("body", req.body);
  const book = new Book({
    title: "Symphony No. 5 in C minor, Op. 67",
    author: "Ludwid van Beethoven",
    year: 1808,
    genre: "Symphony",
    imageUrl:
      "https://cdn.pixabay.com/photo/2024/01/08/15/54/defile-8495836_1280.jpg",
    rating: {
      userId: "userId",
      rating: 4,
    },
    averageRating: 4,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "Book created" }))
    .catch((error) => {
      res.status(400).json({ error });
    });
};
// Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne.
exports.getBestBooks = (req, res, next) => {};

// Met à jour le livre avec l'_id fourni. Si une image est téléchargée, elle est capturée, et l’ImageUrl du livre est mise à jour. Si aucun fichier n'est fourni, les informations sur le livre se trouvent directement dans le corps de la requête (req.body.title, req.body.author, etc.). Si un fichier est fourni, le livre transformé en chaîne de caractères se trouve dans req.body.book. Notez que le corps de la demande initiale est vide ; lorsque Multer est ajouté, il renvoie une chaîne du corps de la demande basée sur les données soumises avec le fichier.
exports.modifyBook = (req, res, next) => {};

// Supprime le livre avec l'_id fourni ainsi que l’image associée.
exports.deleteBook = (req, res, next) => {};

// Définit la note pour le user ID fourni. La note doit être comprise entre 0 et 5. L'ID de l'utilisateur et la note doivent être ajoutés au tableau "rating" afin de ne pas laisser un utilisateur noter deux fois le même livre. Il n’est pas possible de modifier une note. La note moyenne "averageRating" doit être tenue à jour, et le livre renvoyé en réponse de la requête
exports.rateBook = (req, res, next) => {};
