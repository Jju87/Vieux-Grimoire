const { default: axios } = require("axios");
require("dotenv").config({ path: "backend/.env" });

const moderateImage = async (req, res, next) => {
    const imageUrl = req.body.imageUrl;
    const apiKey = process.env.KEY_API_MODERATIONCONTENT;

    try {
        const response = await axios.get(
            `https://api.moderatecontent.com/moderate/?url=${imageUrl}&key=${apiKey}`
        );

        console.log("Response from ModerateContent API: ", response.data); // Log the complete response

        const { predictions } = response.data;

        if (predictions && predictions.adult !== undefined) {
            console.log("Adult score: ", predictions.adult); // Log adult score

            if (predictions.adult > 40) {
                return res.status(400).json({ error: "Image non autorisée" });
            }
        } else {
            console.log("No adult score returned from ModerateContent API");
        }

        next();
    } catch (error) {
        res.status(500).json({ error });
        console.log("Error: ", error);
    }
};

module.exports = moderateImage;