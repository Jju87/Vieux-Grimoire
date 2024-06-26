const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()

// Définition de regex (volontairement simplistes pour la démo)
const passwordFormat = /.{6,}/; // Au moins 6 caractères
const emailFormat = /@/; // Présence d'un @

// Création d'un nouvel utilisateur
exports.userSignup = (req, res) => {
    // Vérification de la validité de l'email et du mot de passe et envoi d'une erreur 400 si invalide, 
    // ainsi qu'un message d'erreur côté serveur
    if (!emailFormat.test(req.body.email)) {
        return res.status(400).json({ error: "L'adresse email doit contenir le symbole '@' " });
    }
    if (!passwordFormat.test(req.body.password)) {
        return res.status(400).json({ error : "Le mot de passe doit contenir au moins 6 caractères" });
    }
    // Hashage du mot de passe
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            // Enregistrement de l'utilisateur dans la base de données
            console.log("nouvel utilisateur : ", user)
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
}

// Connexion d'un utilisateur existant
exports.login = (req, res, next) => {
    // Recherche de l'utilisateur dans la base de données avec findOne()
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'});
            }
            // Comparaison du mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    // Si le mot de passe est incorrect, on renvoie une erreur 401
                    if (!valid) {
                        return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                    }
                    console.log("user login : ", user, "token : ", jwt.sign( { userId: user._id,}, 'RANDOM_TOKEN', { expiresIn: '24h' } ));
                    // Si le mot de passe est correct, on renvoie une réponse 200 avec l'userId et un token
                    console.log(process.env.RANDOM_TOKEN)
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id,},
                            process.env.RANDOM_TOKEN,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };