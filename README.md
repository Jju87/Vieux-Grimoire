# Mon Vieux Grimoire 

This repository contains the backend API for "Mon Vieux Grimoire," a book rating and referencing website. This API is developed using Node.js with Express.js framework and MongoDB for data storage.

## Technologies Used:
- **Express.js**
- **MongoDB**
- **fs (File System)**
- **dotenv**
- **multer**
- **sharp**

Users can post books, by adding a picture of the book, add basinc info, and grade them by giving them a rate out of 5 stars. 
Once signed in, a user can rate other books as well.
A user can also see which books are best rated.


## UPDATE ON DEPLOYMENT:

Several additions have been made:

- **User Engagement**: To enhance user interaction, users can now write **descriptions/reviews** for books. 

- **Responsive Design**: A significant improvement has been made to the site's accessibility and responsive design.

- **Image Hosting on CDN**: Images are now hosted on a Content Delivery Network (CDN) using another middleware. This implementation ensures faster loading times.

- **Content Moderation**: A new middleware has been introduced to implement a content moderation logic. Images are now moderated through interaction with an API that utilizes AI to analyze if the images contain inappropriate content, such as adult material. Based on the API's response, images are either approved or rejected. 

**Feel free to interact and publish, modify, or delete content using the pre-filled demo account provided at signin!**

https://vieux-grimoire.vercel.app/

Thank you!



