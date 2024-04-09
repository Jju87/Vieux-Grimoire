const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {

        // ici on utilise split pour récupérer le token dans le header de la requête autorisation
        // car le token est précédé du mot clé Bearer donc l'ordre est Bearer en 0 et le token en 1
        const token = req.headers.authorization.split(' ')[1];
        
        // ici on utilise la méthode verify de jwt pour décoder le token
        // ce qui nous permet de récupérer l'objet userId pour la suite
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN')
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };
        next();
}catch(error) {
        res.status(401).json({error:'Token invalide ou expiré'});
    }
};