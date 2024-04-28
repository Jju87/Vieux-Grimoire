/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { generateStarsInputs } from '../../../lib/functions';
import { useFilePreview } from '../../../lib/customHooks';
import addFileIMG from '../../../images/add_file.png';
import styles from './BookForm.module.css';
import { updateBook, addBook } from '../../../lib/common';

function BookForm({ book, validate }) {
  const userRating = book ? book.ratings.find((elt) => elt.userId === localStorage.getItem('userId'))?.grade : 0;

  const [rating, setRating] = useState(0);

  const navigate = useNavigate();
  const {
    register, watch, formState, handleSubmit, reset,
  } = useForm({
    defaultValues: useMemo(() => ({
      title: book?.title,
      author: book?.author,
      year: book?.year,
      genre: book?.genre,
    }), [book]),
  });
  useEffect(() => {
    reset(book);
  }, [book]);
  const file = watch(['file']);
  const [filePreview] = useFilePreview(file);

  useEffect(() => {
    setRating(userRating);
  }, [userRating]);

  useEffect(() => {
    if (!book && formState.dirtyFields.rating) {
      const rate = document.querySelector('input[name="rating"]:checked').value;
      setRating(parseInt(rate, 10));
      formState.dirtyFields.rating = false;
    }
  }, [formState]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (data) => {
    setIsLoading(true);
    const dataCopy = { ...data };
    if (!book) {
      if (!dataCopy.file[0]) {
        alert('Vous devez ajouter une image');
        setIsLoading(false);
        return;
      }
      if (!dataCopy.rating) {
        dataCopy.rating = 0;
      }
      try {
        const response = await addBook(dataCopy); // Envoyer les données directement
        setIsLoading(false);
        if (response.error) {
          // Si une erreur est renvoyée depuis le serveur
          if (response.error.includes('contient du contenu pour adulte non autorisé')) {
            setErrorMessage('Votre image contient du contenu pour adulte non autorisé sur notre application');
          } else {
            setErrorMessage('Une erreur est survenue lors de la publication du livre');
          }
        } else {
          validate(true);
          navigate('/');
        }
      } catch (error) {
        setIsLoading(false);
        alert('Une erreur est survenue lors de l\'ajout du livre');
      }
    } else {
      try {
        const updatedBookResponse = await updateBook(dataCopy, dataCopy.id);
        setIsLoading(false);
        const updatedBook = await updatedBookResponse.json();
        if (updatedBook.error) {
          // Si une erreur est renvoyée depuis le serveur lors de la mise à jour du livre
          alert(updatedBook.error);
        } else {
          // Validation réussie, rediriger vers la page d'accueil
          navigate('/');
        }
      } catch (error) {
        setIsLoading(false);
        alert('Une erreur est survenue lors de la mise à jour du livre');
      }
    }
  };

  const readOnlyStars = !!book;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.Form}>
      <input type="hidden" id="id" {...register('id')} />
      <label htmlFor="title">
        <p>Titre du livre</p>
        <input type="text" id="title" {...register('title')} />
      </label>
      <label htmlFor="author">
        <p>Auteur</p>
        <input type="text" id="author" {...register('author')} />
      </label>
      <label htmlFor="year">
        <p>Année de publication</p>
        <input type="text" id="year" {...register('year')} />
      </label>
      <label htmlFor="genre">
        <p>Genre</p>
        <input type="text" id="genre" {...register('genre')} />
      </label>
      <label htmlFor="rate">
        <p>Note</p>
        <div className={styles.Stars}>
          {generateStarsInputs(rating, register, readOnlyStars)}
        </div>
      </label>
      <label htmlFor="file">
        <p>Visuel</p>
        <div className={styles.AddImage}>
          {filePreview || book?.imageUrl ? (
            <>
              <img src={filePreview ?? book?.imageUrl} alt="preview" />
              <p>Modifier</p>
            </>
          ) : (
            <>
              <img src={addFileIMG} alt="Add file" />
              <p>Ajouter une image</p>
            </>
          )}
        </div>
        <input {...register('file')} type="file" id="file" />
      </label>
      {errorMessage && <p>{errorMessage}</p>}
      <button type="submit" disabled={isLoading}>{isLoading ? 'Chargement...' : 'Publier'}</button>
    </form>
  );
}

BookForm.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
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
    averageRating: PropTypes.number,
  }),
  validate: PropTypes.func,
};

BookForm.defaultProps = {
  book: null,
  validate: null,
};
export default BookForm;
