# NotaryChain

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-client--phi--three--35.vercel.app-2D6A4F?style=for-the-badge&logo=vercel&logoColor=white)](https://client-phi-three-35.vercel.app)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Polygon Amoy](https://img.shields.io/badge/Polygon_Amoy-Testnet-8247E5?style=for-the-badge&logo=polygon&logoColor=white)
![Firebase Auth](https://img.shields.io/badge/Firebase_Auth-v10-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge)

## A modern full-stack MERN & Web3 application for document authentication, AI fraud detection, face biometrics, and Polygon Neobank payments.

---

## 🌐 Live Production Links

- 🔗 **Main Application**: [https://client-phi-three-35.vercel.app](https://client-phi-three-35.vercel.app)
- 💳 **Polygon Neobank**: [https://client-phi-three-35.vercel.app/neobank](https://client-phi-three-35.vercel.app/neobank)
- 👛 **Web3 Wallet Balance**: [https://client-phi-three-35.vercel.app/wallet](https://client-phi-three-35.vercel.app/wallet)
- 📜 **Cryptographic Vault**: [https://client-phi-three-35.vercel.app/documents](https://client-phi-three-35.vercel.app/documents)

---

## 🎯 Features & Architecture

### 📜 Cryptographic Document Vault
- **SHA-256 Hashing**: Instant client/server hashing for zero-knowledge document integrity.
- **Polygon Amoy Anchoring**: Cryptographic seals written to the Polygon Amoy blockchain.
- **AI Document Scanner**: Text extraction, key clause summaries, and automated risk scoring.

### 💳 Polygon Open Money Stack (OMS) Neobank
- **USDC Custodial Transfers**: Instant peer-to-peer payments via `.polygon` handles.
- **Multi-Currency Converter**: USD, USDC, EUR, and INR balance switching.
- **Financial Workflows**: Cash-In top-ups, bank payouts, and digital deposit vouchers.

### 👤 Biometric Face Verification & Security
- **Face 2FA Scanner**: InsightFace vector embedding matching against user profiles.
- **Liveness Detection**: Real-time camera canvas scanning preventing identity spoofing.
- **Dual Reset System**: Firebase Auth + Nodemailer SMTP dual password reset flow.

---

## 🚀 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18.3.1 + Vite 8.2 |
| **Styling** | Tailwind CSS 3.x + Custom Vanilla CSS Design System |
| **Backend API** | Node.js v20.x + Express.js v4.x |
| **Database** | MongoDB Atlas + Mongoose ORM |
| **Blockchain** | Polygon Amoy Testnet (Chain ID `80002`) + Ethers.js |
| **Fintech API** | Polygon Open Money Stack (OMS) Sandbox v0.11 |
| **Authentication** | Firebase Auth v10 + Google OAuth 2.0 |
| **Hosting & Deployment** | Vercel Edge Serverless Deployment |

---

## 🛠️ Quick Start & Setup

### 1. Clone & Install
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

### 2. Run Locally
```bash
# Start Client Development Server (Port 3000)
npm run dev

# Start Server (Port 5000)
npm run dev
```

---

## 📄 License
Distributed under the **MIT License**.
