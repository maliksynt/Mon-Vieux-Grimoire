const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Hachage du mot de passe de l'utilisateur, ajout de l'utilisateur à la base de données.
exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(200).json({ message: "Utilisateur enregistré" }))
        .catch((error) => {
          res.status(400).json({ error });
        });
    })
    .catch((error) => res.status(500).json({ error }));
  console.log("All good");
};

//  Vérification des informations d'identification de l'utilisateur ; renvoie l’_id de l'utilisateur depuis la base de données et un token web JSON signé (contenant également l'_id de l'utilisateur).
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user === null) {
        res
          .status(401)
          .json({ message: "Paire identifiant / Mot de passe incorrect" });
      } else {
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              res.status(401).json({
                message: "Paire identifiant / Mot de passe incorrect",
              });
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
                  expiresIn: "24h",
                }),
              });
            }
          })
          .catch((error) => {
            res.status(500).json({ error });
          });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
