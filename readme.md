# 🧠 RAG Playground – Compare Multiple RAG Architectures

# Keys:-
> Backend is hosted correctly, 
> frontend is hosted correctly, 
> render is computing the results correctly, 
> but at the time of response back it shows CORS error, 
> by the way all its working fine on the local system

# Frontend = 
> https://helloworlfd.vercel.app/  (For Reference to All the features that i added to my task)
---
# Please Watch the video Below
 **Watch the demo video on Google Drive:**  
👉 [Click here to view the demo](https://drive.google.com/file/d/1J03PcaxUngdxH9xMmX1KNjoCyf99w9QD/view?usp=sharing)  
*(R)*
---

https://github.com/dchaudhari7177/Cognitive.git 
> 👆 Public repository containing the full source code.


## 📹 Demo Video (Local Functionality)

⚠️ **The deployed site is currently facing CORS issues**, which are preventing some functionalities from working in production.  
To demonstrate the complete flow, here’s a **video recorded from the local setup**, showcasing:

- Uploading PDFs
- Selecting different RAG pipelines
- Querying and retrieving results
- Side-by-side output comparison with context

📁
---
## 🚀 How to Run 
### 1. Start the Frontend
cd rag-playground-frontend
npm install  
npm run dev
### 1. Start the Frontend
cd rag-playground-backend
uvicorn app:main --reload


## 🔍 Project Overview

This project implements a **RAG Playground** that allows users to:

- Upload **PDFs**
- Query across **multiple RAG pipelines**
- **Compare outputs** side-by-side or in tabbed view
- View **retrieved context**, **source metadata**, and **LLM-generated answers**
- Analyze **performance metrics** such as:
  - Response time
  - Qualitative answer comparison
  - Retrieved chunks
  - Re-ranker or confidence scores (if available)

---

## 🧪 RAG Architectures Implemented

1. **Simple RAG**
2. **Hybrid RAG**
3. **Re-Ranker Enhanced RAG**

---

## 🌐 Key Frontend Features

- 📤 Upload PDFs
- ✅ Choose one or more RAG architectures
- 💬 Input and submit a question
- 🔁 Compare outputs from all selected pipelines
- 🧠 See generated answer + supporting context
- 📉 View latency & qualitative differences
- ⚡ Loading indicators during processing
- 📱 Fully responsive UI

---

## ⚙️ Tech Used

- **Frontend:** Next.js, Tailwind CSS, Shadcn/UI
- **Backend:** FastAPI (Python), Render
- **LLMs:** Groq, Gemini API, OpenRouter


---

## 🚧 Deployment Status

- Backend and frontend hosted successfully.
- **CORS issues currently prevent full production functionality.**
- All features are functional and demonstrated in the shared video.

---

## 📝 Deliverables

- ✅ GitHub repository with complete code
- ✅ Working frontend and backend with all features
- ✅ Local functionality demonstrated via video ([Google Drive Link](https://drive.google.com/file/d/1J03PcaxUngdxH9xMmX1KNjoCyf99w9QD/view?usp=drive_link))
- 🚧 Deployed URL (CORS fix in progress)

---

## 🙌 Thank you for reviewing!
