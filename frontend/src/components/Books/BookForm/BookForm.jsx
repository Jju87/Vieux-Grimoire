/* eslint-disable no-return-assign */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-console, no-alert */
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
      summary: book?.summary,
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

  const handleErrorResponse = (error) => {
    setIsLoading(false);
    if (error && error.response && error.response.data) {
      if (error.response.data.error) {
        // eslint-disable-next-line prefer-template
        alert(error.response.data.error);
      }
    } else {
      alert('Votre image comporte du contenu pour adulte non autorisé sur notre application');
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    const dataCopy = { ...data };
    if (!book) {
      if (!dataCopy.file[0]) {
        alert('Vous devez ajouter une image');
        setIsLoading(false);
        return;
      }
      if (!dataCopy.title) {
        alert('Vous devez ajouter un titre');
        setIsLoading(false);
        return;
      }
      if (!dataCopy.author) {
        alert('Vous devez ajouter un auteur');
        setIsLoading(false);
        return;
      }
      if (!dataCopy.year) {
        alert('Vous devez ajouter une année');
        setIsLoading(false);
        return;
      }
      if (!dataCopy.genre) {
        alert('Vous devez ajouter un genre');
        setIsLoading(false);
        return;
      }
      if (!dataCopy.rating) {
        dataCopy.rating = 0;
      }
      try {
        const response = await addBook(dataCopy);
        setIsLoading(false);
        if (response.data) {
          if (response.data.error) {
            handleErrorResponse({ response });
          } else if (response.data.message && response.data.message === 'Saved!') {
            validate(true);
            // console.log('after validate');
          } else {
            // console.log('Response message:', response.data.message);
          }
        } else {
          alert('Votre image comporte du contenu pour adulte non autorisé sur notre application');
        }
      } catch (error) {
        handleErrorResponse(error);
      }
    } else {
      try {
        const updatedBookResponse = await updateBook(dataCopy, dataCopy.id);
        setIsLoading(false);
        if (updatedBookResponse.data.message !== 'Modified!') {
          handleErrorResponse({ response: updatedBookResponse });
        } else {
          navigate('/');
        }
      } catch (error) {
        handleErrorResponse(error);
      }
    }
  };

  const readOnlyStars = !!book;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.Form}>
      <input type="hidden" id="id" {...register('id')} />
      <label htmlFor="title">
        <p>Titre du livre</p>
        <input type="text" id="title" {...register('title')} defaultValue="Le petit prince" onFocus={(e) => { if (e.target.defaultValue === e.target.value) e.target.value = ''; }} />
      </label>
      <label htmlFor="author">
        <p>Auteur</p>
        <input type="text" id="author" {...register('author')} defaultValue="Antoine de Saint-Exupéry" onFocus={(e) => { if (e.target.defaultValue === e.target.value) e.target.value = ''; }} />
      </label>
      <label htmlFor="year">
        <p>Année de publication</p>
        <input type="text" id="year" {...register('year')} defaultValue="1946" onFocus={(e) => { if (e.target.defaultValue === e.target.value) e.target.value = ''; }} />
      </label>
      <label htmlFor="genre">
        <p>Genre</p>
        <input type="text" id="genre" {...register('genre')} defaultValue="Fable" onFocus={(e) => { if (e.target.defaultValue === e.target.value) e.target.value = ''; }} />
      </label>
      <label htmlFor="summary">
        <p>À propos de ce livre</p>
        <textarea id="summary" {...register('summary')} defaultValue="C'est un petit garçon qui vit seul sur une planète lointaine. Amoureux d'une rose très capricieuse, il part en voyage sur d'autres planètes à la recherche d'amis. Il croise différents personnages : un homme d'affaires, un roi, un géographe, un renard… qui vont tous lui apprendre quelque chose..." onFocus={(e) => { if (e.target.defaultValue === e.target.value) e.target.value = ''; }} />
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
    summary: PropTypes.string,
    averageRating: PropTypes.number,
  }),
  validate: PropTypes.func,
};

BookForm.defaultProps = {
  book: null,
  validate: null,
};
export default BookForm;
