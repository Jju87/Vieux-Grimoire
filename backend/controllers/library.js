const Book = require("../models/book");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

// Créer un livre
exports.createBook = async (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    const userId = req.auth.userId;
  
    try {
      // Upload the image to Cloudinary and get the image URL
      const result = await cloudinary.uploader.upload_stream({ resource_type: 'image', unique_filename: false }, (error, result) => {
        if (error) throw new Error(error);
        const imageUrl = result.secure_url;
        const imagePublicId = result.public_id;
        console.log("image uploaded with public ID: ", imagePublicId)

        const book = new Book({
          ...bookObject,
          userId, // add the userId here
          imageUrl, // add the image URL here
          imagePublicId, // add the image public ID here

        });
  
        book.save()
          .then(() => res.status(201).json({ message: "Saved!" }))
          .catch(error => res.status(400).json({ error }));
      }).end(req.file.buffer);
    } catch (error) {
      console.error("error:", error);
      res.status(400).json({ error });
    }
  };
  
// Récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
    // La méthode find() de mongoose permet de renvoyer tous les documents de la collection
    Book.find()
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((error) => res.status(400).json({ error }));
};

// Récupérer les 3 meilleurs livres
exports.bestRating = (req, res, next) => {
    // Récupérer tous les livres avec la méthode find()
    Book.find()
        .then((books) => {
            // Trier les livres par note moyenne avec la méthode sort()
            // Ici, a et b représentent deux notes moyennes de livres car on récupère averageRating qui a été créee dans
            // exports.createRating
            // Si b est supérieur à a, alors b est affiché avant a
            books.sort((a, b) => b.averageRating - a.averageRating);
            // Une fois triés, on récupère les 3 premiers livres avec la méthode slice(0, 3)
            const bestRatedBooks = books.slice(0, 3);
            res.status(200).json(bestRatedBooks);
        })
        .catch((error) => res.status(400).json({ error }));
};

// Récupérer un livre
exports.getOneBook = (req, res, next) => {
    // La méthode findOne() de mongoose permet de renvoyer un seul document de la collection
    // en utilisant l'id que l'on récupère dans les paramètres
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            res.status(200).json(book);
        })
        .catch((error) => res.status(404).json({ error }));
};

exports.modifyBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
      .then((book) => {
        // Seul l'utilisateur qui a créé le livre peut le modifier
        if (book.userId != req.auth.userId) {
          res.status(403).json({ message: "unauthorized request" });
        } else {
          if (req.file) {
            // On supprime l'ancienne image si une nouvelle est envoyée
            const publicId = book.imagePublicId; // Use the publicId from the database
            cloudinary.uploader.destroy(publicId, function(error, result) {
              if (error) {
                console.log(error);
              }
            });
  
            // Upload the new image to Cloudinary and get the image URL
            cloudinary.uploader.upload_stream({ resource_type: 'image', use_filename: false }, (error, result) => {
              if (error) throw new Error(error);
              const imageUrl = result.secure_url;
              const imagePublicId = result.public_id;
              console.log("image uploaded with public ID: ", imagePublicId)
  
              // Create the book object with the new image URL
              const bookObject = {
                ...JSON.parse(req.body.book),
                imageUrl, // add the new image URL here
                imagePublicId, // add the new image public ID here
              };
              delete bookObject._userId;
  
              // Update the book
              Book.updateOne(
                { _id: req.params.id },
                { ...bookObject, _id: req.params.id }
              )
                .then(() => {
                  res.status(200).json({
                    message: " Book has been updated",
                  });
                })
                .catch((error) => res.status(401).json({ error }));
            }).end(req.file.buffer);
          } else {
            // If no file is sent, update the book with the request body as is
            const bookObject = { ...req.body };
            delete bookObject._userId;
  
            Book.updateOne(
              { _id: req.params.id },
              { ...bookObject, _id: req.params.id }
            )
              .then(() => {
                res.status(200).json({
                  message: " Book has been updated",
                });
              })
              .catch((error) => res.status(401).json({ error }));
          }
        }
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  };
// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  // On utilise la méthode findOne() de mongoose pour trouver le livre à supprimer en utilisant l'id
  Book.findOne({ _id: req.params.id })
      .then((book) => {
          // Seul l'utilisateur qui a créé le livre peut le supprimer
          if (book.userId != req.auth.userId) {
              res.status(403).json({ message: "unauthorized request" });
          } else {
              // On supprime l'image du livre de Cloudinary
              const publicId = book.imagePublicId; // Use the publicId from the database
              cloudinary.uploader.destroy(publicId, { resource_type: 'image' }, function(error, result) { // Use the correct resource type
                  if (error) {
                      console.error("Error deleting file: ", error);
                      console.log("publicId: ", publicId)
                  } else {
                      console.log("Delete result: ", result);
                      console.log("publicId: ", publicId)
                  }
                  // On supprime aussi le livre de la base de données avec la méthode deleteOne()
                  Book.deleteOne({ _id: req.params.id })
                      .then(() => {
                          res.status(200).json({ message: "Deleted!" });
                      })
                      .catch((error) => {
                          res.status(500).json({ error });
                      });
              });
          }
      })
};

// Ajouter une note à un livre
exports.createRating = (req, res, next) => {
    // Création d'un objet ratingObject avec: 1/l'id de l'utilisateur 2/le nombre d'étoiles
    const userId = req.auth.userId;
    const userStars = req.body.rating;
    const ratingObject = {
        userId: userId,
        grade: userStars,
    };
    // On utilise la méthode findOne() de mongoose pour trouver le livre à noter en utilisant l'id
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            // On vérifie si l'utilisateur a déjà noté le livre
            const userRating = book.ratings.find(
                (element) => element.userId === userId
            );
            if (userRating) {
                return res
                    .status(400)
                    .json({ message: "You already added ratings" });
            }
            // On ajoute ratingObject à la fin du tableau ratings de l'objet book grace à la méthode push()
            book.ratings.push(ratingObject);
            // On calcule la note moyenne du livre en additionnant toutes les notes et en divisant par le nombre de notes
            let total = 0;
            for (let i = 0; i < book.ratings.length; i++) {
                total = total + book.ratings[i].grade;
            }
            // On arrondit la note moyenne à 1 chiffre après la virgule
            const averageRating = (total / book.ratings.length).toFixed(1);
            //averageRating est rajouté à l'objet book avec la méthode save() et on arrondit la note moyenne à l'entier le plus proche
            book.averageRating = Math.round(Number(averageRating));
            return book.save();
        })
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(500).json({ erreur: error }));
};
