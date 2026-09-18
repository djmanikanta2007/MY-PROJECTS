# 🎓 CampusConnect: AI Voice Assistant for Raghu Engineering College

**🌐 Live Demo / Working Model:** [CampusConnect Live Website](https://djmanikanta2007.github.io/MY-PROJECTS/CampusConnect/frontend/)

![CampusConnect Logo](frontend/favicon.ico)

## 📌 Project Overview
CampusConnect is an intelligent, real-time voice AI assistant designed specifically for Raghu Engineering College. It allows students, parents, and visitors to call a dedicated phone number, ask questions conversationally, and receive immediate, highly accurate answers about the university campus, facilities, and academic details.

## 🚀 The Solution
Navigating a massive university campus or scouring websites for simple answers can be frustrating. CampusConnect solves this by providing a 24/7, human-like voice interface. Just call the number and ask!

## 🛠️ Technology Stack
- **Twilio**: Handles the telephony infrastructure, voice recognition (Speech-to-Text), and Text-to-Speech using Amazon Polly.
- **n8n**: The workflow automation engine that acts as the bridge between Twilio webhooks and our AI model.
- **Groq & Llama-3**: We utilize Groq's insanely fast inference engine running the `llama-3.1-8b-instant` model to ensure that voice responses are generated with zero lag, providing a natural conversational flow.
- **Python & Vanilla Web Stack**: A lightweight HTML/CSS/JS frontend to showcase the project architecture and provide user instructions.

## 🧠 The Knowledge Base
The AI is strictly trained on a custom knowledge base to prevent hallucinations. Current trained data includes:
- **Campus Details**: Located in Dakamarri, Visakhapatnam, offering a serene and pollution-free environment (~35 km from city centre).
- **Hostels**: Separate hostels for boys (~700 beds) and girls (~450 beds) with AC and non-AC options, mess, and Wi-Fi.
- **Food**: Two main college canteens on campus serving Indian and Chinese cuisine (09:00 AM to 09:00 PM).
- **Academic Programs**: B.Tech in CSE (AIML, Data Science, Cyber Security, IoT), ECE, EEE, Mechanical, Civil, plus M.Tech and MBA.
- **Facilities**: Central Library, specialized labs (Nano Tech, Electro Lounge, Coding Lounge), Sports Complex, Medical Centre, and ATM.

## 🔮 Future Improvements (RAG Integration)
While the current version uses a strict System Prompt, the next iteration will integrate **Retrieval-Augmented Generation (RAG)**:
1. Scrape the entire Raghu Engineering College website and student handbooks.
2. Store the data as vector embeddings in a database (like Pinecone).
3. Use semantic search to dynamically inject only the most relevant paragraphs into the AI's prompt when a caller asks highly specific questions (e.g., department phone numbers or event schedules).

---

