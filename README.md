# AI-Powered Interview Prep App

This is a full-stack Single Page Application (SPA) designed to help job seekers practice for interviews. Users can upload their resume and a job description, and our app will generate a dynamic, interactive mock interview. It uses AI to provide real-time feedback and scoring on the user's answers by comparing them to their resume.

## Live Demo

* **Live App (Vercel):** `[INSERT YOUR-LIVE-VERCEL-URL-HERE]`
* **Live API (Render):** `[INSERT YOUR-LIVE-RENDER-URL-HERE]`

## Features

* **JWT Authentication:** Secure user signup and login using JSON Web Tokens.
* **PDF Upload:** Users can upload their Resume and a Job Description (JD).
* **PDF Text Extraction:** The backend automatically extracts and processes text from the PDFs.
* **AI Embeddings:** Text chunks from the resume are converted into vector embeddings (using OpenAI) for semantic search.
* **RAG-Powered Feedback:** User answers are evaluated using a Retrieval-Augmented Generation (RAG) model. The AI retrieves relevant parts of the user's resume to give a relevant score (1-10) and constructive feedback.
* **Document Management:** Users can view and delete their uploaded files.

## Tech Stack

### Frontend (Client)
* **React.js**
* **Vite** (as the build tool)
* **Tailwind CSS** (for styling)
* **React Router** (for page routing)
* **Axios** (for API requests)
* **React Hot Toast** (for notifications)
* **React Context API** (for global auth state)

### Backend (Server)
* **Node.js**
* **Express.js** (for the REST API)
* **MongoDB (Mongoose)** (as the database)
* **JSON Web Token (JWT)** (for authentication)
* **Bcrypt.js** (for password hashing)
* **OpenAI API** (for embeddings and chat generation)
* **Cloudinary** (for file storage)
* **Multer** (for handling file uploads)
* **`pdfreader`** (for parsing PDF text)
* **`cosine-similarity`** (for RAG)

### Deployment
* **Frontend:** Vercel
* **Backend:** Render

---

## Setup and Installation

To run this project locally, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/Ritesh-977/Ai-Interview_Prep
cd Ai-Interview_Prep
```
### 2. Backend Setup
```bash
# 1. Navigate to the backend folder
cd backend

# 2. Install dependencies
npm install

#  Create a .env file
touch .env

# 4. Add your environment variables to the .env file
# (See the .env.example section below)

# Start the server
npm run dev
```
### 3. Frontend Setup
```bash
# 1. Navigate to the frontend folder
cd ../frontend

# 2. Install dependencies
npm install

# 3. Start the client
npm run dev
```
### Environment Variables
``` bash
# Server Port
PORT=5001

# MongoDB Connection String
MONGO_URI=mongodb+srv://...

# JWT Secret Key
JWT_SECRET=your-very-strong-secret-key-123

# OpenAI API Key
OPENAI_API_KEY=sk-...

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
