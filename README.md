# NotaryChain

<div align="center">

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Polygon Amoy](https://img.shields.io/badge/Polygon_Amoy-Testnet-8247E5?style=for-the-badge&logo=polygon&logoColor=white)
![Firebase Auth](https://img.shields.io/badge/Firebase_Auth-v10-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge)

<br />

### 🌐 Enterprise Blockchain Document Authentication, Face Biometrics & Polygon Neobank Platform

A full-stack Web3 & MERN platform designed for paperless notarization, cryptographic document verification on the Polygon Amoy blockchain, AI-driven document analysis, face biometric authentication, and Polygon Open Money Stack (OMS) USDC financial workflows.

</div>

---

## 🚀 Live Production Deployment

- 🌐 **Web Application**: [https://client-phi-three-35.vercel.app](https://client-phi-three-35.vercel.app)
- 💳 **Polygon Neobank**: [https://client-phi-three-35.vercel.app/neobank](https://client-phi-three-35.vercel.app/neobank)
- 👛 **Web3 Wallet Balance**: [https://client-phi-three-35.vercel.app/wallet](https://client-phi-three-35.vercel.app/wallet)
- 📜 **Document Vault**: [https://client-phi-three-35.vercel.app/documents](https://client-phi-three-35.vercel.app/documents)

---

## 🛠️ Tech Stack & System Architecture

### Frontend (Client)
- **Framework**: React 18.3.1 + Vite 8.2
- **Styling**: Vanilla CSS + Tailwind CSS 3.x (Design system tokens `#2D6A4F`, `#2E2A26`, `#FAF8F4`)
- **Web3 Integration**: Ethers.js v6 + MetaMask Web3 Provider (`window.ethereum`)
- **Authentication**: Firebase Auth v10 + Google OAuth 2.0
- **Routing & State**: React Router DOM v6 + Context API + Framer Motion animations
- **Deployment**: Vercel Serverless Edge Network

### Backend (Server)
- **Runtime**: Node.js v20.x + Express.js v4.x
- **Database**: MongoDB Atlas + Mongoose ORM
- **Blockchain**: Polygon Amoy Testnet (Chain ID `80002`) via Ethers.js & JSON-RPC
- **Fintech Payments**: Polygon Open Money Stack (OMS) Sandbox v0.11 API
- **AI Processing**: Cryptographic AI Document Analysis Engine & Groq Llama 3.3
- **Security & Mail**: JWT Auth, AES-256 Encryption, Nodemailer SMTP dual reset flow

---

## 🌟 Key Features

### 1. 📜 Cryptographic Document Vault & Blockchain Anchoring
- **SHA-256 Hashing**: Automatic client and server SHA-256 hash generation for every uploaded document.
- **Polygon Amoy Anchoring**: Immutable document verification sealed on Polygon Amoy testnet (`0x000...1010`).
- **AI Analysis**: Text extraction, key terms identification, and risk scoring.

### 2. 💳 Polygon Open Money Stack (OMS) Neobank
- **Custodial USDC Settlement**: Instant peer-to-peer transfers using `.polygon` handles.
- **Multi-Currency Switcher**: Live USD, USDC, EUR, and INR balance conversion.
- **Financial Workflows**: Cash-in top-ups, bank payouts, and digital deposit vouchers.

### 3. 👤 Biometric Face Verification & AI Security
- **Face 2FA Scanner**: InsightFace vector embedding matching against Google/registered user profile pictures.
- **Liveness Detection**: Real-time camera canvas scanning to prevent spoofing and unauthorized access.

### 4. 👛 Real-Time Web3 Wallet Syncing
- **Active Account Precedence**: Real-time detection of `window.ethereum.selectedAddress` prioritizing active MetaMask extension accounts.
- **Chain Change Listeners**: Automatic UI updates on `accountsChanged` and `chainChanged` events.

---

## 📂 Project Directory Structure

```
vibeforge/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── api/               # Axios API endpoints & Web3 balance helpers
│   │   ├── components/        # UI Components (auth, dashboard, neobank, documents)
│   │   ├── context/           # Auth, Theme, & Notification Providers
│   │   ├── layouts/           # DashboardLayout, AuthLayout, PublicLayout
│   │   ├── pages/             # Landing, Dashboard, Neobank, Wallet, Documents, Profile
│   │   ├── config/            # Firebase config
│   │   └── index.css          # Core CSS design system
│   ├── package.json
│   └── vite.config.js
│
└── server/                     # Express Node.js Backend
    ├── config/                # Database & environment validation
    ├── controllers/           # Auth, Document, Neobank, AI, & Verification controllers
    ├── middleware/            # JWT auth, role auth, rate limiters, error handling
    ├── models/                # User, Document, AuditLog, AIReport schemas
    ├── routes/                # Express API routes
    ├── services/              # Email, Token, & Blockchain services
    └── server.js
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js `v18.x` or `v20.x`
- MongoDB instance (local or MongoDB Atlas)
- MetaMask browser extension

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/soumik7484-art/notary-chain.git
cd notary-chain

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
POLYGON_AMOY_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com
BLOCKCHAIN_PRIVATE_KEY=your_private_key
```

### 3. Run Development Servers
```bash
# Start Client (from client directory)
npm run dev

# Start Server (from server directory)
npm run dev
```

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for details.

<div align="center">
  <sub>Built with ❤️ for Polygon Open Money Stack & Global Document Authentication</sub>
</div>
