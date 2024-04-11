const Book = require("../models/book");
const fs = require("fs");

// Créer un livre
exports.createBook = async (req, res, next) => {
    // Récupération des données du livre en créeant un objet lu à partir de la requête en format JSON
    const bookObject = JSON.parse(req.body.book);
    const userId = req.auth.userId;

    console.log("bookObject:", bookObject);
    console.log("userId:", userId);

    try {
        const book = new Book({
            //On utilise l'opérateur spread pour copier les propriétés de l'objet bookObject
            //et on ajoute l'image à l'objet
            ...bookObject,

            //On génère l'url de l'image : on utilise le protocole de la requête (http ou https) et le nom de l'hôte
            // puis on ajoute le dossier images et le nom du fichier
            imageUrl: `${req.protocol}://${req.get("host")}/images/resized_${
                req.file.filename
            }`,
        });

        console.log("book:", book);

        // Sauvegarde du livre dans la base de données avec la méthode save()
        await book.save();

        console.log("book saved");

        res.status(201).json({ message: "Saved!" });
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

// Modifier un livre
exports.modifyBook = (req, res, next) => {
    // On vérifie si un fichier est envoyé avec la requête
    const bookObject = req.file
        ? // Si un fichier est envoyé, on crée un objet à partir des données de la requête en format JSON
          {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get("host")}/images/resized_${
                  req.file.filename
              }`,
          }
        : // Si aucun fichier n'est envoyé, on laisse les données de la requête telles quelles
          { ...req.body };
    // On supprime ensuite l'id du livre
    delete bookObject._userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            // Seul l'utilisateur qui a créé le livre peut le modifier
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: "unauthorized request" });
            } else {
                if (req.file) {
                    // On supprime l'ancienne image si une nouvelle est envoyée avec la méthode unlink()
                    fs.unlink(
                        "images/resized" +
                            book.imageUrl.split("/images/resized")[1],
                        (error, info) => {
                            if (error) {
                                console.log(error);
                            }
                        }
                    );
                }
                // On met à jour le livre avec la méthode updateOne() en lui passant l'id du livre à modifier
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
                // On supprime l'image du livre avec la méthode unlink()
                const filename = book.imageUrl.split("/images/")[1];
                fs.unlink(`images/resized${filename}`, (error) => {
                    if (error) {
                        console.error("Error deleting file: ", error);
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
        .catch((error) => {
            res.status(500).json({ error });
        });
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
