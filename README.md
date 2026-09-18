# PaperCraft 📝

PaperCraft is a full-stack MERN web app that turns any PDF or study material into ready-to-use exam papers, online quizzes, or a bank of max-marks-style questions — powered by Google's Gemini AI.

**🔗 Live App:** [papercraft-beta.vercel.app](https://papercraft-beta.vercel.app/)

## Features

- 📄 **Upload a PDF** and let AI generate questions straight from its content
- 🧾 **Exam Paper Generator** — create a downloadable, formatted exam paper PDF
- 🧠 **Online Quiz Mode** — take an AI-generated quiz in-browser and view your results
- ❓ **Max Question Bank** — generate a downloadable set of high-weightage questions
- 💾 **Saved Services** — save and revisit previously generated papers/quizzes
- 🔐 **Authentication** — sign up, log in, OTP-based email verification, and password reset
- 💳 **Payments** — Razorpay integration for secure online payments
- 🌗 **Light/Dark theme** support
- 💬 **Feedback** system for users

## Tech Stack

**Frontend**

- React 19 + Vite
- Redux Toolkit / React-Redux for state management
- React Router
- Tailwind CSS
- jsPDF & pdfjs-dist for PDF generation/parsing
- Axios, Lucide React icons
- Razorpay Checkout for payments

**Backend**

- Node.js + Express 5
- MongoDB with Mongoose
- Google Gemini API (`@google/genai`) for AI-generated content
- JWT-based auth with access/refresh tokens (cookie-based)
- Cloudinary for storing generated PDFs
- Razorpay API for payment processing and order/payment verification
- Nodemailer / Resend / Brevo / SendGrid for transactional emails (OTP, feedback, etc.)
- bcryptjs for password hashing, express-validator for input validation

## Project Structure

```
PaperCraft/
├── backend/
│   ├── config/          # DB & Cloudinary config
│   ├── controllers/     # Route handlers (auth, gemini, feedback, saved services, payments)
│   ├── middleware/  
│   ├── mongodb/         # Mongoose models (users, OTP, feedback, savedServices)
│   ├── routes/  
│   ├── utils/  
│   └── server.js
└── frontend/
    └── src/
        ├── Components/
        │   ├── common/       # Navbar, Login, Signup, Forgot password, Feedback
        │   ├── home/          # Home options, PDF upload, About, Saved services
        │   ├── Option_pages/  # Exam paper / quiz / max-question option screens
        │   └── End_pages/     # Final download / quiz-taking / results screens
        ├── Redux/            # Store & slices (user, upload, download, theme)
        └── Services/         # PDF generation & content-generation helpers
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A MongoDB database (local or Atlas)
- A Google Gemini API key
- A Cloudinary account
- A Razorpay account (Key ID & Key Secret)
- An email-sending provider (Brevo / SendGrid / Resend, depending on which you wire up)

### 1. Clone the repo

```
git clone https://github.com/nayansuva03/PaperCraft_Beta.git
cd PaperCraft_Beta
```

### 2. Backend setup

```
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```
NODE_ENV=development
MONGODB_URL=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:5173

JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

BREVO_API_KEY=your_brevo_api_key
```

Run the backend:

```
npm run dev
```

The server starts on `http://localhost:5000`.

### 3. Frontend setup

```
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Scripts

| Location | Command           | Description                      |
| -------- | ----------------- | -------------------------------- |
| backend  | `npm run dev`     | Start backend with nodemon       |
| backend  | `npm start`       | Start backend in production mode |
| frontend | `npm run dev`     | Start Vite dev server            |
| frontend | `npm run build`   | Build frontend for production    |
| frontend | `npm run preview` | Preview production build         |
| frontend | `npm run lint`    | Run ESLint                       |

## Author

**Nayan Suva** — [@nayansuva03](https://github.com/nayansuva03)
