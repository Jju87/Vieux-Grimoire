# Mon Vieux Grimoire - Backend API

This repository contains the backend API for "Mon Vieux Grimoire," a book rating and referencing website. This API is developed using Node.js with Express.js framework and MongoDB for data storage.

## Technologies Used:
- **Express.js**: A fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: A NoSQL database used for storing book information and user data.
- **fs (File System)**: Utilized for handling file operations, including image uploads and deletion.
- **dotenv**: Used for loading environment variables from a `.env` file to keep sensitive information secure.
- **multer**: Middleware for handling `multipart/form-data`, primarily used for configuring image uploads.
- **sharp**: A high-performance image processing library for Node.js, utilized for image compression and format conversion.


## Image Optimization:

To ensure efficient handling of images, the following modules are utilized:

- **fs (File System)**: Used for file operations, including reading, writing, and deleting images from the local file system.
- **multer**: Middleware for handling file uploads, specifically configured for uploading book cover images.
- **sharp**: A high-performance image processing library used for image compression and format conversion or even rotation. This ensures that uploaded images are optimized for size and format, enhancing performance and reducing storage requirements.

 Thank you for checking out Mon Vieux Grimoire ! 
