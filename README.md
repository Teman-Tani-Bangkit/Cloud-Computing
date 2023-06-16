# TemanTani - Backend

The backend is responsible for handling the logic and database connections, as well as providing various API endpoints used by the frontend application.

![arsitektur](https://github.com/Teman-Tani-Bangkit/Cloud-Computing/assets/85775533/1758042b-d835-4c03-9f5b-5f1273ccceda)


## Table of Contents

- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)

## Installation

To get started with the TemanTani backend, follow these steps:

1. Make sure you have Node.js and npm (Node Package Manager) installed. You can download them from the [official Node.js website](https://nodejs.org).
2. Clone this repository to your local machine:
```bash
git clone https://github.com/username/temantani-backend.git
```
3. Navigate to the project directory:
```bash
cd temantani-backend
```
4. Install the required dependencies:
```bash
npm install
```
5. Create a file named .env in the project directory and add the necessary configuration. Here's an example:
```bash
KEY=secret-key
```
Replace secret-key with a secure secret key for JWT (JSON Web Token) purposes.
6. Configure the database connection settings in the connection.js file according to your database setup.
7. Set up a Google Cloud Storage account to store uploaded images and files. Create a service account key in the Google Cloud Console and save the JSON key file as serviceaccountkey.json in the project directory.
8. Once the installation is complete, you can run the TemanTani backend with the following command:
```bash
npm start
```

## API Endpoints
The TemanTani backend server provides the following API endpoints:

POST /register: Register a new user in the system.  
POST /login: Authenticate a user and obtain an access token upon successful login.  
POST /uploadProduk: Upload a new product to the system.  
GET /detailProduk/{idbarang}: Retrieve product details based on the product ID.  
GET /tampilkanProduk: Display all available products in the system.  
GET /tampilkanProduk?namabarang={namabarang}: Search and display products based on the product name.  
GET /tampilkanKategori/{kategori}: Display products based on a specific category.  
GET /userProfil/{userid}: Display user data that is currently logged in and also products that have been uploaded by that user.  
PUT /postProfil: Edit data user.  
POST /deteksiPenyakit: Detect plant diseases based on uploaded images.  
POST /rekomendasi: Get plant recommendations based on soil and climate conditions.  
Note: Include a valid access token in each authenticated request by providing the Authorization header with the value Bearer <access-token>.  
  
## Deployment
Deploy API Backend to Google Cloud Run
  
1. Clone this repository to your local machine:
```bash
git clone https://github.com/username/temantani-backend.git temantani
```
```bash
cd temantani
```
2. Create a Dockerfile
3. Create Docker Image to Container Registry
```bash
gcloud builds submit --tag gcr.io/<project-id>/temantani
```
4. Configure the Cloud Run settings according to your application.
5. Make sure you have created Cloud SQL
6. Add env and connect to Cloud SQL
env_variables:
  DB_HOST: <YOUR_DATABASE_HOST>  
  DB_USER: <YOUR_DATABASE_USER>  
  DB_PASS: <YOUR_DATABASE_PASSWORD>  
  DB_NAME: <YOUR_DATABASE_NAME>  
  DB_PORT: <YOUR_DATABASE_PORT>  
  KEY: <YOUR_PRIVATE_KEY>  
7. Deploy.
