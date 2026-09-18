# 🏢 CampusConnect: AI Voice Assistant for Raghu Engineering College

**🚀 Live Demo / Working Model:** [CampusConnect Live Website](https://djmanikanta2007.github.io/MY-PROJECTS/CampusConnect/frontend/)

![CampusConnect Logo](frontend/favicon.ico)

## 📌 Project Overview
CampusConnect is an intelligent, real-time voice AI assistant designed specifically for Raghu Engineering College. It allows students, parents, and visitors to call a dedicated phone number, ask questions conversationally, and receive immediate, highly accurate answers about the university campus, facilities, and academic details.

## 💡 The Solution
Navigating a massive university campus or scouring websites for simple answers can be frustrating. CampusConnect solves this by providing a 24/7, human-like voice interface. Just call the number and ask!

## 🛠️ Technology Stack
- **Twilio**: Handles the telephony infrastructure, converting voice to text (Speech-to-Text), and reading responses back over the phone (Text-to-Speech).
- **FastAPI & Python**: The core backend framework that processes webhook requests from Twilio and handles chat requests from the web frontend directly.
- **AI Models (via Groq API)**: Utilizes the qwen/qwen3.8-27b model via the Groq client to generate highly accurate and instantaneous responses based on the college knowledge base.
- **Vanilla Web Stack (HTML/CSS/JS)**: A lightweight frontend to interact with the AI via a chat interface and showcase the architecture.

## 🧠 The Knowledge Base
The AI is strictly trained on a custom knowledge base to prevent hallucinations. Current trained data includes:
- **Campus Details**: Located in Dakamarri, Visakhapatnam, offering a serene and pollution-free environment (~35 km from city centre).
- **Hostels**: Separate hostels for boys (~700 beds) and girls (~450 beds) with AC and non-AC options, mess, and Wi-Fi.
- **Food**: Two main college canteens on campus serving Indian and Chinese cuisine (09:00 AM to 09:00 PM).
- **Academic Programs**: B.Tech in CSE (AIML, Data Science, Cyber Security, IoT), ECE, EEE, Mechanical, Civil, plus M.Tech and MBA.
- **Facilities**: Central Library, specialized labs (Nano Tech, Electro Lounge, Coding Lounge), Sports Complex, Medical Centre, and ATM.

## 🚀 Future Improvements (RAG Integration)
While the current version uses a strict System Prompt, the next iteration will integrate **Retrieval-Augmented Generation (RAG)**:
1. Scrape the entire Raghu Engineering College website and student handbooks.
2. Store the data as vector embeddings in a database (like Pinecone).
3. Use semantic search to dynamically inject only the most relevant paragraphs into the AI's prompt when a caller asks highly specific questions (e.g., department phone numbers or event schedules).

---