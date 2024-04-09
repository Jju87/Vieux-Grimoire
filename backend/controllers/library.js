const Book = require('../models/book');
const fs = require('fs');

exports.createBook = async (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    const userId = req.auth.userId;
  
    console.log('bookObject:', bookObject); 
    console.log('userId:', userId); // Log the user ID
  
    try {
      // Create the new book
      const book = new Book({
        ...bookObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.filename}`,
      });
  
      console.log('book:', book); // Log the book before saving
  
      // Save the new book
      await book.save();
  
      console.log('book saved'); // Log that the book was saved
  
      res.status(201).json({ message: 'Saved!' });
    } catch (error) {
      console.error('error:', error); // Log the error
      res.status(400).json({ error });
    }
  };

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.bestRating = (req, res, next) => {
  Book.find()
    .then((books) => {
      books.sort((a, b) => b.averageRating - a.averageRating);
      const topThreeBooks = books.slice(0, 3);
      res.status(200).json(topThreeBooks);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => res.status(404).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: 'unauthorized request' });
      } else {
        // Remove old file if new file submitted
        if (req.file) {
          fs.unlink(
            'images/' + book.imageUrl.split('/images/')[1],
            (error, info) => {
              if (error) {
                console.log(error);
              }
            }
          );
        }
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => {
            res.status(200).json({ message: 'Modified!' });
          })
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: 'unauthorized request' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, (error) => {
          if (error) {
            console.error('Error deleting file: ', error);
            // Even if an error occurs while deleting the file, we still want to try deleting the book
          }
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: 'Deleted!' });
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

exports.createRating = (req, res, next) => {
  const userId = req.auth.userId;
  const userGrade = req.body.rating;

  const ratingDatas = {
    userId: userId,
    grade: userGrade,
  };

  // Check the entered grade
  if (isNaN(userGrade) || userGrade < 0 || userGrade > 5) {
    return res.status(400).json({ message: 'Invalid rating' });
  }
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Check if user already added a rate
      const userRating = book.ratings.find(
        (element) => element.userId === userId
      );
      if (userRating) {
        return res.status(400).json({ message: 'You already added ratings' });
      }
      // Add rating datas
      book.ratings.push(ratingDatas);
      // Recalculate the average
      const initialValue = 0;
      const averageRating = (
        book.ratings.reduce(
          (acc, element) => acc + element.grade,
          initialValue
        ) / book.ratings.length
      ).toFixed(1);

      // Adjust average rating
      book.averageRating = Math.round(Number(averageRating));
      return book.save();
    })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(500).json({ erreur: error }));
};