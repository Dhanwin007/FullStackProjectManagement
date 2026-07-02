# 🚀 TaskFlow

A modern full-stack project management platform built with **React**, **Node.js**, **Express.js**, and **MongoDB**. TaskFlow enables teams to collaborate efficiently through an interactive Kanban board, real-time communication, secure authentication, and project analytics.
Live on : https://frontend-project-management-snowy.vercel.app/login
---

## ✨ Features

* 🔐 Secure Authentication using JWT and HTTP-only Cookies
* 📧 Password Reset and role based permissions
* 📋 Create and Manage Projects
* ✅ Create, Update, Delete, and Organize Tasks
* 📌 Interactive Drag-and-Drop Kanban Board
* 💬 Real-Time Team Chat using Socket.io
* 📊 Project Analytics Dashboard
* ☁️ Secure File & Image Uploads with Cloudinary


---

## 🛠️ Tech Stack

| Category                | Technologies           |
| ----------------------- | ---------------------- |
| Frontend                | React.js, Tailwind CSS |
| Backend                 | Node.js, Express.js    |
| Database                | MongoDB, Mongoose      |
| Authentication          | JWT, HTTP-only Cookies |
| Real-Time Communication | Socket.io              |
| Charts & Analytics      | Recharts               |
| File Storage            | Cloudinary             |
| Email Services          | Nodemailer, Resend SMTP |

---

## 📂 Project Structure

```text
FullStackProjectManagement/
│
├── frontend/                 # React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/                 # Express Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── utils/
│   └── package.json
│
├
├── README.md
└── package.json
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=8000

MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=7d

CLIENT_URL=http://localhost:5173(make sure to change this in cors and .env)

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

Adjust the variables according to your project configuration.

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js (v18 or later recommended)
* npm
* MongoDB Atlas or a local MongoDB instance
* Cloudinary Account
* Resend or mailtrap account

---

## Clone the Repository

```bash
git clone https://github.com/Dhanwin007/FullStackProjectManagement.git
```

```bash
cd taskflow
```

---

## Install Backend Dependencies

```bash
cd backend
npm install
```

---

## Install Frontend Dependencies

Open another terminal.

```bash
cd fronted
npm install
```

---

## Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will start on:

```
http://localhost:8000
```

---

## Start the Frontend

Open another terminal.

```bash
cd frontend
npm run dev
```

The frontend will start on:

```
http://localhost:5173
```

---

## Build for Production

### Frontend

```bash
cd frontend
npm run build
```

### Backend

```bash
cd backend
npm start
```

---

## 📡 Major Functionalities

### Authentication

* User Registration
* Login
* Logout
* Email Verification-not implemented in frontend so only route exists ; no button to avail it further no ui that opens on email
* Forgot Password
* Reset Password
* JWT Authentication
* HTTP-only Cookie Authentication
* Role-Based Access Control (RBAC)


### Project Management

* Create Projects
* Update Projects
* Delete Projects
* add and update roles of  Team Members
* Project Dashboard

### Task Management

* Create Tasks
* Update Tasks
* Delete Tasks
* Drag & Drop Kanban Workflow
* Task Status Tracking

### Real-Time Collaboration

* Live Team Chat
* Real-Time Project Synchronization using Socket.io

### Analytics


* Task Progress Visualization
* Completion Metrics
* Member assignment chart

### File Management

* Upload Images(user avatar and task related pdfs or docs)
* Upload Attachments
* Cloudinary Integration

---



## 💡 Highlights

* Secure authentication using JWT and HTTP-only cookies.
* Real-time communication powered by Socket.io.
* Interactive Kanban board for task management.
* Analytics dashboard for monitoring project progress.
* Cloudinary integration for secure file storage.
* Responsive design for desktop and mobile devices.

---

## 🔮 Future Improvements


* Activity Logs
* Push Notifications
* Calendar View
* Team Invitations
* Dark Mode
* Advanced Analytics
* Search and Filtering
* Project Templates

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new branch.

```bash
git checkout -b feature/your-feature
```

3. Commit your changes.

```bash
git commit -m "Add your feature"
```

4. Push the branch.

```bash
git push origin feature/your-feature
```

5. Open a Pull Request.

---



## 👨‍💻 Author

Developed by Dhanwin G

If you found this project useful, consider giving it a ⭐ on GitHub.
