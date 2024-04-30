import * as PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import styles from '../../../pages/Book/Book.module.css';
import { displayStars } from '../../../lib/functions';

function BookInfo({ book }) {
  return (
    <>
      <div className={styles.BookInfo}>
        <h1>{book.title}</h1>
        <p className={styles.Author}>{`Auteur: ${book.author}`}</p>
        <p className={styles.PublishDate}>{book.year}</p>
        <p className={styles.Genre}>{book.genre}</p>
        <div className={styles.Rating}>
          <div>{displayStars(book.averageRating)}</div>
          <p>{`${book.averageRating}/5`}</p>
        </div>
      </div>
      <div className="summaryContainer">
        <p className={styles.Summary}>{book.summary}</p>
      </div>
    </>
  );
}

BookInfo.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.string,
    userId: PropTypes.string,
    title: PropTypes.string,
    author: PropTypes.string,
    year: PropTypes.number,
    imageUrl: PropTypes.string,
    genre: PropTypes.string,
    ratings: PropTypes.arrayOf(PropTypes.shape({
      userId: PropTypes.string,
      grade: PropTypes.number,
    })),
    summary: PropTypes.string,
    averageRating: PropTypes.number,
  }).isRequired,
};

export default BookInfo;
