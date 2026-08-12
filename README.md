# 📜 NotaryChain

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-client--phi--three--35.vercel.app-2D6A4F?style=for-the-badge&logo=vercel&logoColor=white)](https://client-phi-three-35.vercel.app)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_v8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Polygon Amoy](https://img.shields.io/badge/Polygon_Amoy-Testnet-8247E5?style=for-the-badge&logo=polygon&logoColor=white)
![Firebase Auth](https://img.shields.io/badge/Firebase_Auth-v10-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Groq AI](https://img.shields.io/badge/Groq_AI-Llama_3.3_70B-F55036?style=for-the-badge&logo=groq&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge)

## Next-Generation Blockchain Document Authentication, Biometric Face Verification & Polygon Neobank Platform

NotaryChain is an enterprise-grade Web3 platform engineered to eliminate paper-based document workflows for legal firms, financial institutions, banks, and enterprises. It integrates zero-knowledge SHA-256 document hashing, cryptographic proof sealed on the Polygon Amoy blockchain, AI-driven document analysis, face biometric authentication, and Polygon Open Money Stack (OMS) financial workflows.

---

## 📌 Table of Contents
- [🌐 Live Production Links](#-live-production-links)
- [🛠️ Tech Stack & Module Functions](#️-tech-stack--module-functions)
- [✨ Key Platform Features](#-key-platform-features)
- [📐 System Architecture](#-system-architecture)
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

## 🛠️ Tech Stack & Module Functions

> **Note**: NotaryChain uses **MongoDB Atlas** for data persistence and **Firebase** strictly for Google OAuth client authentication. **Supabase is NOT used in this project.**

| Technology | Role / Category | Functional Purpose in NotaryChain |
| :--- | :--- | :--- |
| **MongoDB Atlas** | Primary Database | Stores user profile records, hashed credentials, document metadata, audit trail events, Passkey records, AI analysis reports, and 128D Face ID biometric embeddings. |
| **Firebase Auth** | Authentication Client | Provides client-side Google OAuth 2.0 authentication for 1-click Google Sign-In and account identity initialization. |
| **FaceNet 128D Neural AI** | Biometric Verification | Client & server facial feature vector matching (Euclidean distance cutoff 0.58 / 93% match threshold) for 2-Step identity verification. |
| **Polygon Amoy Testnet** | Blockchain Ledger | Immutable smart contract ledger (`Chain ID: 80002`) used to permanently seal and verify document SHA-256 cryptographic fingerprints. |
| **Polygon OMS API** | Neobank & Payments | Powers Polygon Open Money Stack (OMS) neobank features including custodial USDC wallets, P2P money transfers, Cash-In deposit barcodes, and bank payouts. |
| **Groq Llama-3.3-70B** | AI Intelligence Engine | Performs OCR text extraction, contract summarization, key clause extraction, risk flag detection, and overall trust score generation. |
| **Node.js & Express.js** | Backend API Server | Handles secure REST API endpoints, JWT token verification, database queries, file upload security, and external API orchestration. |
| **React 18 & Vite** | Frontend Application | High-performance single page application built with Vite for modern web UI rendering and interactive dashboard interfaces. |
| **TailwindCSS & Framer Motion** | UI Design System | Responsive layout styling, dark mode support, and micro-interaction animations. |
| **Ethers.js v6** | Web3 Integration | Connects frontend and backend to Polygon Amoy RPC nodes and browser extension wallets (`window.ethereum`). |

---

## ✨ Key Platform Features

### 1. 📜 Cryptographic Document Vault & Polygon Anchoring
- **Zero-Knowledge SHA-256 Hashing**: Generates unique SHA-256 cryptographic fingerprints on client and server prior to storage.
- **Polygon Amoy Blockchain Proof**: Seals document hashes permanently onto the Polygon Amoy testnet (`Chain ID: 80002`), ensuring immutable tamper resistance.
- **Public Verification Engine**: Allows third-party auditors to verify any document's authenticity using its SHA-256 hash without exposing confidential document content.

### 2. 💳 Polygon Open Money Stack (OMS) Neobank
- **Custodial USDC Settlement**: Executes instant peer-to-peer money transfers using `.polygon` handles (e.g. `@ada.polygon`).
- **Multi-Currency Converter**: Live currency switching between USD, USDC, EUR, and INR with real-time conversion rates.
- **Financial Workflows**: Integrated Cash-In top-ups, bank payouts, and digital deposit barcodes.

### 3. 👤 Biometric Face Verification & Passkey Authentication
- **128D FaceNet Embeddings**: Extracts facial vector embeddings to verify user identity against registered profiles during high-security transactions.
- **Passkey Fallback**: Passkey security fallback for 2-step verification matched against MongoDB hashed credentials.
- **Real-Time Liveness Detection**: Scans live camera feeds for micro-movement indicators to block photos, videos, or deepfake spoof attempts.

### 4. 🤖 NotaryChain AI Engine
- **Document Text Extraction & Summarization**: Automatically parses text from PDFs, images, and DOCX files to generate concise plain-language summaries.
- **Key Terms & Risk Scoring**: Identifies missing indemnity clauses, risk flags, and assigns a Trust Score (0–100).
- **Domain-Scoped AI Assistant**: Embedded chatbot that provides guidance on document verification, notarization, and Polygon payments.

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
            │   SHA-256 Smart Contract    │   │  Atlas DB │   │  Custodial USDC Sandbox   │
            └─────────────────────────────┘   └───────────┘   └───────────────────────────┘
```

---

## 📂 Repository Directory Structure

```
vibeforge/
├── client/                                 # Frontend Vite React Application
│   ├── src/
│   │   ├── api/                           # Axios API modules (auth, doc, neobank, ai)
│   │   ├── components/
│   │   │   ├── admin/                     # Analytics, Audit Logs, User Management
│   │   │   ├── auth/                      # Login, Signup, Passkey, FaceScanner
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

### 🔐 Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/signup` - Register a new user account
- `POST /api/v1/auth/login` - Authenticate user & issue JWT token pair
- `POST /api/v1/auth/google/init` - Initialize Google OAuth session
- `POST /api/v1/auth/google/verify-identity` - Execute 2-Step Face ID or Passkey verification
- `GET /api/v1/auth/me` - Fetch authenticated user profile

### 📜 Documents & Blockchain (`/api/v1/documents`)
- `GET /api/v1/documents` - Fetch user's uploaded document history
- `POST /api/v1/documents/upload` - Upload file, compute SHA-256 hash & execute AI analysis
- `GET /api/v1/documents/:id` - Fetch document details & blockchain transaction receipt
- `POST /api/v1/documents/:id/anchor` - Anchor document SHA-256 hash to Polygon Amoy

### 💳 Polygon Neobank (`/api/v1/neobank`)
- `GET /api/v1/neobank/account` - Fetch custodial USDC account balance & ledger history
- `POST /api/v1/neobank/send` - Execute instant peer-to-peer USDC transfer
- `POST /api/v1/neobank/cash-in` - Generate Cash-In deposit barcode & credit balance
- `POST /api/v1/neobank/withdraw` - Initiate bank payout transfer

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
Create a `.env` file in `server/`:
```env
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
