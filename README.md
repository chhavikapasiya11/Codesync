# CodeSync 🚀

**CodeSync** is a real-time collaborative coding platform designed for developers and learners to code together seamlessly. It supports multiple programming languages, live linting, terminal execution, and AI-powered code suggestions, making it ideal for pair programming, code reviews, and online learning.

---

## 🌟 Features

### **Core Features**
- **Real-time Collaborative Editor:** Edit code simultaneously with peers using a Monaco-based editor integrated with Socket.IO.
- **Multi-file Support:** Manage multiple files in a single session like VS Code.
- **Terminal Integration:** Execute code in a private terminal for each user (supports C++, Java, Python, JavaScript, etc.).
- **Live Linting & Error Tracking:** ESLint integration for JavaScript with real-time error highlighting and a "Know" button for detailed error explanation.
- **Versioning System:** Automatic and manual code version saving with rollback support.
- **AI Suggestions (Optional):** Suggests code fixes based on lint errors.
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

### **Clone the repository**
```bash
git clone https://github.com/yourusername/codesync.git
cd codesync
