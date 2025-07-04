# AI Chat Assistant (MERN Fullstack)

A modern, mobile-friendly AI chatbot built with React, Express, and Google Gemini API. Features dark mode, responsive design, and easy deployment.

---

## 🚀 Features
- Beautiful, modern chat UI
- **Dark mode** toggle
- **Mobile responsive** design
- Real-time AI chat powered by Google Gemini
- Error handling and connection status
- Easy deployment (Render, Railway, etc.)
- Credit: by sachin

---

## 📱 Screenshots
<!-- Add screenshots here after deployment -->

---

## 🛠️ Tech Stack
- **Frontend:** React (with hooks, CSS-in-JS)
- **Backend:** Node.js, Express
- **AI:** Google Gemini API (`@google/generative-ai`)

---

## 🧑‍💻 Local Development

### 1. Clone the Repo
```bash
git clone https://github.com/YOUR_USERNAME/ai-chatbot.git
cd ai-chatbot
```

### 2. Install Dependencies
#### Backend
```bash
cd server
npm install
```
#### Frontend
```bash
cd ../client
npm install
```

### 3. Set Environment Variables
Create a `.env` file in the `server` directory:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run Locally
#### Start Backend
```bash
cd server
npm start
```
#### Start Frontend (in another terminal)
```bash
cd client
npm start
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)

---

## 🌐 Production Build & Deployment

### 1. Build React for Production
```bash
cd client
npm run build
cd ..
```

### 2. Serve React from Express
Add to `server/server.js` (after API routes, before `app.listen`):
```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
```

### 3. Deploy to Render
- Push your code to GitHub.
- Go to [https://render.com/](https://render.com/) and create a new Web Service.
- Root Directory: `server`
- Build Command: `npm install && npm run build --prefix ../client`
- Start Command: `node server.js`
- Add environment variable: `GEMINI_API_KEY`
- Deploy!

---

## 🙏 Credits
- UI & code: by sachin
- AI: Google Gemini

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
[MIT](LICENSE) 