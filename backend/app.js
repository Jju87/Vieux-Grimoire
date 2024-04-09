const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const libraryRoutes = require('./routes/library');
const userRoutes = require('./routes/user');

mongoose.connect('mongodb+srv://gardierjulien:AQYpc5XFyNQRhJAy@old-grimoire.ipsfjmd.mongodb.net/?retryWrites=true&w=majority&appName=old-grimoire',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à old-grimoire-API (mongodb) réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Utilisation de express.json() pour parser le corps des requêtes au format JSON
app.use(express.json());

// Middleware pour définir les en-têtes CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
})

// Définition des routes
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/books', libraryRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
