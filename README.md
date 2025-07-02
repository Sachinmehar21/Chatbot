# MERN AI Chatbot with Hugging Face

A simple full-stack AI chatbot using React, Express, and Hugging Face's Inference API.

## Project Structure

```
/client   # React frontend
/server   # Express backend
```

---

## Setup Instructions

### 1. Backend (Express)

1. Go to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your Hugging Face API key:
   ```env
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   ```
4. Start the server:
   ```bash
   npm start
   ```
   The server runs on `http://localhost:5000` by default.

### 2. Frontend (React)

1. Go to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```
   The app runs on `http://localhost:3000` by default.

---

## Features
- Simple chat UI
- Loading and error states
- Uses Hugging Face's `bigscience/bloom` conversational model
- Environment variable for API key

---

## Notes
- Make sure your Hugging Face account has access to the Inference API.
- You can change the model in `server/index.js` if you want to use a different conversational model.
- For production, consider securing your API endpoints and environment variables. 