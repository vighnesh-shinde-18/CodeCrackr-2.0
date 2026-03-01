# CodeCrackr 2.0 🚀

![MERN](https://img.shields.io/badge/Stack-MERN-blue)
![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED)
![Redis](https://img.shields.io/badge/Caching-Redis-DC382D)
![Status](https://img.shields.io/badge/Status-Production-success)

A production-grade AI-powered coding discussion platform featuring scalable backend architecture, Redis caching, RBAC authorization, and fully Dockerized deployment.

## 🔗 Live Demo
- **Frontend:** [https://codecrackrai.netlify.app/](https://codecrackrai.netlify.app/)
- **Backend API:** [https://codecrakr-2-0.onrender.com/api/v1](https://codecrakr-2-0.onrender.com/)

---

## 📸 Screenshots

<img width="1918" height="972" alt="CodeCrackr Dashboard" src="https://github.com/user-attachments/assets/2a113f1d-456a-4294-8758-778a44b802f8" />
 <img width="1918" height="965" alt="Codecrackr Problems" src="https://github.com/user-attachments/assets/5b855c9a-2b13-488a-8eea-36de35b9d660" />
 <img width="1916" height="960" alt="codecrackr code-playgound" src="https://github.com/user-attachments/assets/27d26415-9a98-4c47-b1c4-4a670d57e4f2" />
 <img width="1893" height="907" alt="Codecrackr problem-solving" src="https://github.com/user-attachments/assets/8d06c6ff-e866-4ef1-833e-bbe83e164de9" />

---

## 📌 Problem Statement
Most coding discussion platforms suffer from:
- **High Latency:** Slow response times on read-heavy operations.
- **Lack of Guidance:** No instant feedback or AI assistance for debugging.
- **Security Risks:** Weak authorization protocols.

**CodeCrackr 2.0** solves this by engineering a full-stack system that prioritizes **scalability (Redis/Docker)**, **security (RBAC/JWT)**, and **developer productivity (Gemini AI)**.

---

## ⚡ Key Features
- **🤖 AI-Powered Coding Assistant:** Debug, refactor, and generate code explanations using Gemini AI.
- **🚀 High-Performance Caching:** Redis implementation reduced read-load by **30%** and improved API response by **~40%**.
- **🔐 Secure RBAC System:** Granular permission management for Users, Moderators, and Admins.
- **🐳 Containerized Deployment:** Consistent environments across dev and prod using Docker & Docker Compose.
- **📝 Online Code Compiler:** Integrated Judge0 API for compiling code in C++, Python, Java, and JavaScript.

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React.js, TanStack Query, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (Indexed for performance) |
| **Caching** | Redis (Upstash/Render) |
| **DevOps** | Docker, Docker Compose, GitHub Actions (CI/CD) |
| **AI & APIs** | Google Gemini API, Judge0 API |

---

## 🏗 System Architecture
The system follows a layered architecture separating routing, middleware validation, business logic, and data access layers.

### Authorization & RBAC
The system implements strict Role-Based Access Control validated via middleware:
- **Middleware:** Verifies JWT and User Role before controller execution.
- **Permissions:** Only the "Question Owner" can mark solutions as accepted; Admins can moderate all content.

### Performance Engineering
- Implemented middleware-level validation to prevent unnecessary database calls.
- **Redis Caching:** Implemented Look-Aside caching strategy for frequent database queries (e.g., fetching problem statements).
- **Database Optimization:** Applied compound indexing on MongoDB collections to speed up search and filtering.
- **State Management:** TanStack Query handles server-state caching on the frontend to minimize redundant API calls.

---

## 📂 Folder Structure
```bash
CodeCrackr-2.0/
│
├── client/                # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── api/           # Axios instances & API calls
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom hooks (useAuth, useDebounce)
│   │   ├── pages/         # Application routes
│   │   └── main.jsx
│   └── Dockerfile         # Frontend container config
│
├── server/                # Backend Application (Express)
│   ├── controllers/       # Business logic layer
│   ├── middlewares/       # Auth, RBAC, Validation
│   ├── models/            # Mongoose Schemas
│   ├── routes/            # API Endpoints
│   ├── utils/             # Helper functions (Cloudinary, Emails)
│   └── Dockerfile         # Backend container config
│
├── docker-compose.yml     # Container orchestration
└── README.md
```

## 🚀 Getting Started
Production deployment uses environment-specific configuration with secure secret management.
You can run this project either locally (Node) or in a Dockerized environment.

### 🧑‍💻 Option 1: Run Locally (Without Docker)

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/vighnesh-shinde-18/CodeCrackr-2.0
cd codecrackr-2.0
```

#### 2️⃣ Setup Backend 
```bash
cd server
npm install
```

Create a .env file in server/ root:
```bash
PORT=5000
MONGODB_URL=your_mongodb_connection_string
DB_NAME=test
SALT=5

# Auth
ACCESS_TOKEN_SECRET=your_jwt_secret
ACCESS_TOKEN_EXPIRY=5d

# AI & Judge0
GEMINI_API_KEY=your_gemini_api_key
JUDGE0_API=[https://judge0-ce.p.rapidapi.com](https://judge0-ce.p.rapidapi.com)
JUDGE0_KEY=your_rapidapi_key

# Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
ADMIN_EMAIL=admin_email@gmail.com

# Caching & Client
REDIS_URL=redis://your_redis_url:6379
FRONTEND_URL=http://localhost:5173
```

Run the backend server:
```bash
npm run start
```

#### 3️⃣ Setup Frontend
 
```bash
cd ../client
npm install
```

Create a .env file in the client folder:
```bash
VITE_ADMIN_EMAIL=admin_email@gmail.com
VITE_API_BASE_URL=http://localhost:5000
```
Run the frontend development server:
```bash
npm run dev
```

### 🧑‍💻 Option 2: Run With Docker
Ensure Docker & Docker Compose are installed.
Ensure Docker Desktop is running.

#### 1️⃣ Build & Start Containers
Make sure your backend .env file is set up as described in Option 1
```bash
docker compose up --build
```

#### 2️⃣ Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:5000







