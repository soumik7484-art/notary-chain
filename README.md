# 📜 NotaryChain

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-client--phi--three--35.vercel.app-2D6A4F?style=for-the-badge&logo=vercel&logoColor=white)](https://client-phi-three-35.vercel.app)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Polygon Amoy](https://img.shields.io/badge/Polygon_Amoy-Testnet-8247E5?style=for-the-badge&logo=polygon&logoColor=white)
![Firebase Auth](https://img.shields.io/badge/Firebase_Auth-v10-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge)

## Next-Generation Blockchain Document Authentication, Biometric Face Verification & Polygon Neobank Platform

NotaryChain is an enterprise-grade Web3 & MERN stack platform engineered to eliminate paper-based document workflows for legal firms, financial institutions, banks, and enterprises. It integrates zero-knowledge SHA-256 document hashing, cryptographic proof sealed on the Polygon Amoy blockchain, AI-driven document analysis, face biometric authentication, and Polygon Open Money Stack (OMS) financial workflows.

---

## 📌 Table of Contents
- [🌐 Live Production Links](#-live-production-links)
- [✨ Key Platform Features](#-key-platform-features)
- [📐 System Architecture](#-system-architecture)
- [🛠️ Detailed Tech Stack](#️-detailed-tech-stack)
- [📂 Repository Directory Structure](#-repository-directory-structure)
- [📡 Core API Endpoints](#-core-api-endpoints)
- [🔐 Security Protocols & Cryptography](#-security-protocols--cryptography)
- [⚙️ Local Installation & Development Guide](#️-local-installation--development-guide)
- [📄 License & Credits](#-license--credits)

---

## 🌐 Live Production Links

| Service | Live URL | Description |
| :--- | :--- | :--- |
| **🌐 Main Web Platform** | [https://client-phi-three-35.vercel.app](https://client-phi-three-35.vercel.app) | Landing page, user onboarding, and core portal |
| **💳 Polygon Neobank** | [https://client-phi-three-35.vercel.app/neobank](https://client-phi-three-35.vercel.app/neobank) | Custodial USDC settlements, P2P transfers & vouchers |
| **👛 Web3 Wallet** | [https://client-phi-three-35.vercel.app/wallet](https://client-phi-three-35.vercel.app/wallet) | Live Web3 wallet balance, network status & address details |
| **📜 Document Vault** | [https://client-phi-three-35.vercel.app/documents](https://client-phi-three-35.vercel.app/documents) | Cryptographic vault & SHA-256 document inspection |
| **🛡️ Verification Queue** | [https://client-phi-three-35.vercel.app/verifications](https://client-phi-three-35.vercel.app/verifications) | Document verification queue & audit workflow |
| **⚡ Blockchain Health** | [https://client-phi-three-35.vercel.app/blockchain-health](https://client-phi-three-35.vercel.app/blockchain-health) | Real-time Polygon Amoy RPC & ledger status |

---

## ✨ Key Platform Features

### 1. 📜 Cryptographic Document Vault & Polygon Anchoring
- **Zero-Knowledge SHA-256 Hashing**: Generates unique SHA-256 cryptographic fingerprints on the client and server prior to storage.
- **Polygon Amoy Blockchain Proof**: Seals document hashes permanently onto the Polygon Amoy testnet (`Chain ID: 80002`), ensuring immutable tamper resistance.
- **Public Verification Engine**: Allows third-party auditors to verify any document's authenticity using its SHA-256 hash without exposing confidential document content.

### 2. 💳 Polygon Open Money Stack (OMS) Neobank
- **Custodial USDC Settlement**: Executes instant peer-to-peer money transfers using `.polygon` handles (e.g. `@ada.polygon`).
- **Multi-Currency Converter**: Live currency switching between USD, USDC, EUR, and INR with real-time conversion rates.
- **Financial Workflows**: Integrated Cash-In top-ups, bank payouts, and digital deposit barcodes.

### 3. 👤 Biometric Face Verification & AI Liveness Detection
- **InsightFace AI 512D Embeddings**: Extracts facial vector embeddings to verify user identity against registered profiles during high-security transactions.
- **Real-Time Liveness Detection**: Scans live camera feeds for micro-movement indicators to block photos, videos, or deepfake spoof attempts.
- **Google OAuth 2FA**: Multi-factor identity confirmation for enterprise role access.

### 4. 🤖 NotaryChain AI Engine
- **Document Text Extraction & Summarization**: Automatically parses text from PDFs, images, and DOCX files to generate concise plain-language summaries.
- **Key Terms & Risk Scoring**: Identifies missing indemnity clauses, risk flags, and assigns a Trust Score (0–100).
- **Domain-Scoped AI Assistant**: Embedded chatbot that provides guidance on document verification, notarization, and Polygon payments while strictly filtering off-topic queries.

### 5. 🔐 Multi-Layered Authentication & Dual Reset System
- **Dual Reset Flow**: Combines Firebase Authentication client-side reset with backend Nodemailer SMTP API email dispatch to guarantee password reset delivery.
- **AES-256 Payload Encryption**: Encrypts sensitive file metadata and user payloads both in transit and at rest.

### 6. ⚡ Real-Time Web3 Wallet Synchronization
- **Live Account Prioritization**: Dynamically detects `window.ethereum.selectedAddress` to prioritize active browser extension accounts over cached values.
- **Event-Driven Listeners**: Subscribes to MetaMask `accountsChanged` and `chainChanged` events for instant UI synchronization across all dashboards.

---

## 📐 System Architecture

```
                               ┌──────────────────────────────────────────┐
                               │            Client (React / Vite)         │
                               │  Vercel Edge Serverless Deployment       │
                               └────────────────────┬─────────────────────┘
                                                    │ REST / Web3
                                ┌───────────────────┴───────────────────┐
                                │          Server (Node.js / Express)   │
                                └───────┬───────────┬───────────┬───────┘
                                        │           │           │
            ┌───────────────────────────┴─┐   ┌─────┴─────┐   ┌─┴─────────────────────────┐
            │   Polygon Amoy Blockchain   │   │  MongoDB  │   │  Polygon Open Money Stack │
            │   SHA-256 Smart Contract    │   │  Database │   │  Custodial USDC Sandbox   │
            └─────────────────────────────┘   └───────────┘   └───────────────────────────┘
```

---

## 🛠️ Detailed Tech Stack

| Technology Layer | Components & Frameworks | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React `18.3.1`, Vite `8.2` | High-performance single page application |
| **UI & Animations** | Tailwind CSS `3.x`, Framer Motion, Lucide Icons | Responsive modern design system |
| **Web3 Client** | Ethers.js `v6`, MetaMask Provider (`window.ethereum`) | Blockchain RPC interaction & wallet sync |
| **Backend Runtime** | Node.js `v20.x`, Express.js `4.x` | RESTful microservice API architecture |
| **Database** | MongoDB Atlas, Mongoose ORM `v8.x` | User, Document, and Audit Trail persistence |
| **Blockchain Ledger** | Polygon Amoy Testnet (`Chain ID: 80002`) | Immutable SHA-256 hash sealing |
| **Fintech API** | Polygon Open Money Stack (OMS) Sandbox `v0.11` | Custodial USDC payments & wallet banking |
| **Authentication** | Firebase Auth `v10`, Google OAuth 2.0, JWT Tokens | Authentication & session management |
| **Email Service** | Nodemailer, SMTP API | Password reset & transaction emails |
| **Hosting Platform** | Vercel Serverless Platform | Production client hosting |

---

## 📂 Repository Directory Structure

```
vibeforge/
├── client/                                 # Frontend Vite React Application
│   ├── src/
│   │   ├── api/                           # Axios API modules (auth, doc, neobank, ai)
│   │   ├── components/
│   │   │   ├── admin/                     # Analytics, Audit Logs, User Management
│   │   │   ├── auth/                      # Login, Signup, Forgot/Reset Password, FaceScanner
│   │   │   ├── blockchain/                # Polygonscan QR Modal, Ledger Status
│   │   │   ├── common/                    # DesktopTopNav, Sidebar, MobileBottomNav, FloatingChatbot
│   │   │   ├── dashboard/                 # Company, Bank, Notary, Admin Dashboards
│   │   │   ├── documents/                 # DocumentList, DocumentUpload, DocumentHistory, AIInsights
│   │   │   ├── neobank/                   # HomeScreen, SendScreen, CashInScreen, WithdrawScreen
│   │   │   └── verification/              # VerificationQueue, VerificationDetails
│   │   ├── config/                        # Firebase Authentication setup
│   │   ├── context/                       # AuthContext, ThemeContext, NotificationContext
│   │   ├── layouts/                       # DashboardLayout, AuthLayout, PublicLayout
│   │   ├── pages/                         # Landing, Dashboard, Neobank, Wallet, Documents, Profile
│   │   └── index.css                      # Global CSS token definitions
│   ├── package.json
│   └── vite.config.js
│
└── server/                                 # Backend Node.js Express Application
    ├── config/                            # Database connection, Environment validation, CORS
    ├── controllers/                       # Auth, Document, Neobank, AI, & Verification controllers
    ├── middleware/                        # JWT protection, Role-based auth, Rate limiters, Security
    ├── models/                            # User, Document, AuditLog, AIReport schemas
    ├── routes/                            # Express API route endpoints
    ├── services/                          # Email, Token, Audit, & Encryption services
    └── server.js                          # Express app entry point
```

---

## 📡 Core API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register a new user account
- `POST /api/auth/login` - Authenticate user & issue JWT token pair
- `POST /api/auth/forgot-password` - Trigger dual password reset email
- `POST /api/auth/reset-password/:token` - Confirm password reset
- `GET /api/auth/me` - Fetch authenticated user profile

### 📜 Documents & Blockchain (`/api/documents`)
- `GET /api/documents` - Fetch user's uploaded & tested document history
- `POST /api/documents/upload` - Upload file, compute SHA-256 hash & execute AI analysis
- `GET /api/documents/:id` - Fetch document details & blockchain transaction receipt
- `POST /api/documents/:id/anchor` - Anchor document SHA-256 hash to Polygon Amoy

### 💳 Polygon Neobank (`/api/neobank`)
- `GET /api/neobank/account` - Fetch custodial USDC account balance & ledger history
- `POST /api/neobank/send` - Execute instant peer-to-peer USDC transfer
- `POST /api/neobank/cash-in` - Generate Cash-In deposit barcode & credit balance
- `POST /api/neobank/withdraw` - Initiate bank payout transfer

---

## 🔐 Security Protocols & Cryptography

1. **Zero-Knowledge Hashing**: Raw document contents never leave the user's browser un-hashed during cryptographic verification.
2. **AES-256 Payload Encryption**: Encrypts sensitive file buffers and database entries using 256-bit symmetric key encryption.
3. **Immutable Audit Logs**: Records every authentication attempt, document upload, notarization, and financial payout into a non-deletable audit collection.
4. **Strict Rate Limiting**: Enforces IP-based rate limiting on all authentication, upload, and AI endpoints to prevent brute-force attacks.

---

## ⚙️ Local Installation & Development Guide

### Prerequisites
- **Node.js**: `v18.x` or `v20.x`
- **npm**: `v9.x` or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster URI
- **MetaMask**: Browser extension installed

### Step 1: Clone the Repository
```bash
git clone https://github.com/soumik7484-art/notary-chain.git
cd notary-chain
```

### Step 2: Configure Environment Variables
Create a `.env` file in the project root:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/notarychain

# JWT Secrets
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Blockchain & AI
POLYGON_AMOY_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
BLOCKCHAIN_PRIVATE_KEY=your_wallet_private_key
GROQ_API_KEY=your_groq_api_key
```

### Step 3: Install & Start Development Servers

```bash
# 1. Install & start Frontend Client
cd client
npm install
npm run dev

# 2. Open a new terminal, install & start Backend Server
cd ../server
npm install
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 📄 License & Credits

Distributed under the **MIT License**. See `LICENSE` for full details.

Developed for **Polygon Open Money Stack** and **Cryptographic Document Authentication**.
