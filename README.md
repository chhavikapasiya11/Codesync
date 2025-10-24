# CodeSync 🚀

**CodeSync** is a real-time collaborative coding platform designed for developers and learners to code together seamlessly. It supports multiple programming languages, live linting, terminal execution, and AI-powered code suggestions, making it ideal for pair programming, code reviews, and online learning.

---

## 🌟 Features

### **Core Features**
- **Real-time Collaborative Editor:** Edit code simultaneously with peers using a Monaco-based editor integrated with Socket.IO.
- **Multi-file Support:** Manage multiple files in a single session like VS Code.
- **Terminal Integration:** Execute code in a private terminal for each user (supports C++, Java, Python, JavaScript, etc.).
- **Live Linting & Error Tracking:** ESLint integration for JavaScript with real-time error highlighting and a "Know" button for detailed error explanation.
- **Git-based Versioning Features:**  
  1. **Save & Commit with Microphone:** Save code snapshots and optionally record a voice note explaining the changes.  
  2. **Rollback:** Restore any previous version of code in the session.  
  3. **Difference Viewer:** Compare code changes between versions side-by-side.  
  4. **Version History:** Browse all past commits and view details for each version.
- **Language Support:** JavaScript, TypeScript, Python, C++, Java, HTML (easily extendable).
- **Role-based Authentication:** Sign up and login with secure JWT-based authentication.
- **Frontend Live Preview:** Render HTML/CSS/JS output live within the platform.

### **Additional Features**
- Unsaved changes indicator with auto-highlighted "Save" button.
- Session-based loading of latest saved code when a user joins.
- Private terminal output per user.
- Multi-tab collaborative editing with file management.

---

## 🛠 Tech Stack

- **Frontend:** React.js, Monaco Editor, Socket.IO client, Axios
- **Backend:** Node.js, Express.js, Socket.IO server, MongoDB (via Mongoose)
- **Authentication:** JWT-based secure login/signup
- **Code Execution:** Docker-based or Judge0 API for secure code execution
- **Linting:** ESLint for live error detection
- **Version Control:** Git-based versioning within the platform

---

## ⚙️ Installation
## **Clone the repository**
git clone https://github.com/chhavikapasiya11/Codesync.git
cd Codesync
## **Run locally**
## Backend
cd backend
npm install
npm run dev
## Frontend
cd ../frontend
npm install
npm start
## Live App
Access the deployed application:  
https://codesyncfinal-frontend.onrender.com
## Demo Video
Watch the working demo:  
https://drive.google.com/file/d/1JMn0WrCuhnfwmPk6SKIm2AGtmMT3h9x9/view?usp=sharing

