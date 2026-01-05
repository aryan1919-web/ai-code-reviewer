# 🚀 CodeReview AI - AI-Powered Code Review Platform

![CodeReview AI](https://img.shields.io/badge/CodeReview-AI-6366f1?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs)

A beautiful, modern code review platform powered by **Google Gemini AI**. Get instant feedback on bugs, security vulnerabilities, and optimization suggestions for your code.

## ✨ Features

- 🤖 **AI-Powered Reviews** - Uses Google Gemini AI for intelligent code analysis
- 🐛 **Bug Detection** - Identifies bugs with severity levels and fix suggestions
- 🔒 **Security Analysis** - Detects vulnerabilities and security issues
- ⚡ **Performance Tips** - Get optimization suggestions
- 📝 **16+ Languages** - JavaScript, Python, Java, C++, Go, Rust, and more
- 🎨 **Beautiful UI** - Modern glassmorphism design with dark theme
- 📱 **Responsive** - Works on desktop and mobile
- 📜 **Review History** - Save and revisit past reviews
- 💯 **100% FREE** - Uses Gemini's free tier (1500 requests/day)

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Monaco Editor** - Code editor (same as VS Code)
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Google Gemini AI** - AI model
- **Rate Limiting** - API protection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google Gemini API key (FREE)

### 1. Get Your FREE API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google
3. Click "Create API Key"
4. Copy your API key

### 2. Setup Backend

```bash
# Navigate to backend folder
cd ai-code-reviewer/backend

# Install dependencies
npm install

# Create .env file (copy from example)
copy .env.example .env

# Edit .env and add your API key
# GEMINI_API_KEY=your_api_key_here

# Start the server
npm run dev
```

### 3. Setup Frontend

```bash
# Open new terminal and navigate to frontend
cd ai-code-reviewer/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Open the App
Visit `http://localhost:3000` in your browser 🎉

## 📁 Project Structure

```
ai-code-reviewer/
├── backend/
│   ├── server.js          # Express server with Gemini AI
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── ReviewPanel.jsx
│   │   │   └── HistorySidebar.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `PORT` | Backend server port (default: 5000) | No |

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/review` | Submit code for AI review |
| GET | `/api/health` | Check API status |
| GET | `/api/languages` | Get supported languages |

## 🎯 Supported Languages

JavaScript, TypeScript, Python, Java, C++, C, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, SQL, HTML, CSS

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 📄 License

This project is licensed under the MIT License.

---

⭐ **Star this repo if you found it helpful!**

Built with ❤️ using React, Tailwind CSS & Google Gemini AI
