<p align="center">
  <img src="./public/FinanceFlowLogo.webp" alt="FinanceFlow Logo" width="280px" />
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
</p>

---

FinanceFlow is an AI-powered financial management platform designed to help individuals and small businesses effortlessly track, analyze, and optimize their spending with real-time insights.

---

## 🌟 Key Features

* **Advanced Analytics:** Detailed charts and trends representing spending patterns, category distributions, and relative income-to-expense variances.
* **Smart Receipt Scanner:** Drag-and-drop OCR tool powered by **Google Gemini 2.5 Flash** to automatically scan, parse, and upload transaction line items.
* **Intelligent Chatbot:** Direct, conversational assistant to query balances, fetch summaries, and request personal budgeting advice.
* **WhatsApp Expense Tracking (Twilio):** Record transactions directly by texting a Twilio WhatsApp sandbox number (e.g., "spent 500 on groceries").
* **Automated Monthly Alerts:** Automated background scheduler that creates, formats, and emails personalized monthly financial roundups.

---

## 🏗️ System Architecture

The application is structured into three primary layers to maximize performance and data integrity:

```mermaid
graph TD
    Client[React + Vite SSR Frontend] <-->|HTTP / Session Cookies| Server[Node.js + Express API Server]
    Server <-->|Mongoose ODM| DB[(MongoDB Atlas Database)]
    Server <-->|Google GenAI SDK| Gemini[Google Gemini 2.5 Flash]
    Server <-->|Nodemailer| Mailer[Email SMTP Server]
    Server <-->|WhatsApp Webhook| Twilio[Twilio WhatsApp Gateway]
```

### 1. Presentation Layer (Vite + React SPA / SSR)
- Single Page Application with server-side hydration capability.
- Communicates with the backend API via cookies and session-based fetch requests.
- Client-side views render components (Dashboard, Analytics charts, Forms) dynamically based on current auth state.

### 2. Service & Orchestration Layer (Node.js + Express)
- Handles core routing, session management, and authentication guards.
- **Generative AI Handler:** Communicates with Google Gemini API for OCR receipt parsing, conversational chatbot logic, and monthly analytics.
- **WhatsApp Webhook:** Processes messages sent via Twilio's WhatsApp sandbox API.
- **Job Scheduler:** Executes recurring processes (e.g., daily transaction resets, monthly summary alerts) mapped to secure Vercel Cron endpoints.

### 3. Data Storage Layer (MongoDB Atlas)
- **User Document Schema:** Stores user credentials, WhatsApp phone numbers, and references to associated bank accounts.
- **Account Schema:** Tracks distinct financial wallets (Savings, Current) and their balances.
- **Transaction Schema:** Logs historical income/expense records with Decimal128 precision.

---

## 📊 Transaction Flows

### WhatsApp Expense Logging Sequence

```mermaid
sequenceDiagram
    actor User as WhatsApp User
    participant Twilio as Twilio Gateway
    participant Server as Express Backend
    participant DB as MongoDB
    
    User->>Twilio: Text message: "spent 500 on groceries"
    Twilio->>Server: HTTP POST /api/twilio/whatsapp
    Server->>DB: Find User by WhatsApp Number
    alt User Found
        Server->>DB: Save New Transaction (amount, description)
        Server->>Twilio: XML Response: "✅ Transaction Recorded!"
        Twilio->>User: Text reply confirmation
    else User Not Found
        Server->>Twilio: XML Response: "❌ Number not registered"
        Twilio->>User: Text reply warning
    end
```

---

## 🤝 FinanceFlow Development Team

* [Pranjal Singh](https://github.com/prancodes)
* [Om Singh](https://github.com/24-droid)
* [Pushkar Singh](https://github.com/BackpropX)
* [Vikas Vishwakarma](https://github.com/VikasVk03)

---

© 2026 FinanceFlow. All rights reserved.
