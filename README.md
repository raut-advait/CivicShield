# 🛡️ CivicShield

### AI-Powered Civic Misinformation Detection Platform

CivicShield is an AI-powered system designed to detect misinformation related to **government schemes, elections, and civic processes**. The platform analyzes claims from text or images and verifies them using trusted fact-checking sources, news APIs, and media monitoring systems.

Our goal is to **help citizens verify civic information instantly and prevent the spread of misinformation.**

---

# 🚨 Problem

Civic misinformation spreads rapidly through social media, messaging platforms, and informal sources.

Examples include:

* Fake government scheme announcements
* Misleading election information
* False claims about public policies
* Edited or misleading images from newspapers or social media

Many citizens lack easy access to reliable fact-checking tools and may unknowingly spread misinformation.

---

# 💡 Solution

CivicShield provides a simple interface where users can:

1. Enter a civic claim or news statement
2. Upload or scan an image containing text (OCR)
3. Instantly verify the claim using trusted sources

The system then provides:

* A **verification verdict**
* A **confidence score**
* **Verified fact-check sources**
* A simplified **analysis summary**

---

# ⚙️ How It Works

### Claim Verification Pipeline

```
User Input (Text / Image)
        ↓
OCR (Extract text from image)
        ↓
Input Normalization
        ↓
Fact-Check Search (Google Fact Check API)
        ↓
News Source Retrieval (NewsAPI)
        ↓
Media Monitoring (GDELT)
        ↓
Evidence Analysis
        ↓
Verdict Generation
        ↓
Source Transparency
```

The result is presented to the user with **clear evidence and source links**.

---

# 🚀 Features

### 🔎 Claim Verification

Verify civic claims related to:

* Government schemes
* Elections
* Public policies
* Civic news

---

### 📰 Multi-Source Validation

The system cross-checks claims using:

* Google Fact Check Tools API
* NewsAPI
* GDELT Media Monitoring

---

### 📷 OCR Image Verification

Users can **scan newspapers, screenshots, or forwarded images** to extract text and verify the claim.

---

### 📊 Evidence Transparency

The platform shows:

* Fact-check articles
* News sources
* Media coverage

Users can verify the sources themselves.

---

### 🧠 AI-Generated Summary

The system generates a **simple explanation of the verification result** to make it easy for users to understand.

---

### 📢 Future Feature: Scheme Eligibility

The system will also help users discover **government schemes they are eligible for** based on their profile.

---

# 🏗️ Tech Stack

### Frontend

* React Native

### Backend

* Node.js
* Express.js

### Database

* Supabase (PostgreSQL)

### APIs

* Google Fact Check Tools API
* NewsAPI
* GDELT

### AI / Processing

* OCR (Google Vision / Tesseract)
* Claim analysis pipeline

### Tools

* GitHub
* VS Code

---

# 📂 Project Structure

```
civicshield
│
├── backend
│   ├── routes
│   ├── services
│   ├── config
│   └── server.js
│
├── mobile-app
│   ├── screens
│   ├── components
│   └── services
│
├── README.md
└── package.json
```

---

# 🧪 Example Use Case

User input:

```
Government giving free laptops to students.
```

System output:

```
Verdict: Likely False
Confidence: 72%

Evidence:
• Fact-check articles found
• News coverage limited
• No official government announcement
```

Sources are provided so users can verify independently.

---

# 🎯 Impact

CivicShield helps:

### Citizens

Access verified civic information quickly.

### Governments

Reduce misinformation about schemes and policies.

### Society

Promote informed civic participation and responsible information sharing.

---

# 🔮 Future Improvements

* Multi-language support
* WhatsApp integration
* Government scheme recommendation engine
* Personalized scheme notifications
* Expanded fact-check datasets

---

# 📜 License

This project is for educational and hackathon purposes.

---

# ⭐ Acknowledgements

* Google Fact Check Tools API
* NewsAPI
* GDELT Project
* Supabase

---
