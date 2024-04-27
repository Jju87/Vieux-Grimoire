const { default: axios } = require("axios");
require("dotenv").config({ path: "backend/.env" });

const moderateImage = async (req, res, next) => {
    const imageUrl = req.body.imageUrl;
    const apiKey = process.env.KEY_API_MODERATIONCONTENT;
    console.log("imageUrl in moderateImage: ", imageUrl);
    console.log("apiKey in moderateImage: ", apiKey);

    try {
        const response = await axios.get(
            `https://api.moderatecontent.com/moderate/?url=${imageUrl}&key=${apiKey}`
          );
        // accolades pour destructurer la réponse de l'API et récupérer les prédictions comme
        // indiqué dans la documentation de l'API
        const { predictions } = response.data;

        // Si la prédiction est supérieure à 50%, on renvoie une erreur 400 avec un message d'erreur
        if (predictions.adult > 50) {
            return res.status(400).json({ error: "Image non autorisée" });
        }
        next();
    } catch (error) {
        res.status(500).json({ error });
        console.log("Error: ", error);
    }
};

module.exports = moderateImage;
