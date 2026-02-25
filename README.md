#🚀 TaskFlow: Real-Time Project Management Platform

A high-performance, full-stack project management solution designed for real-time collaboration. This platform enables users to manage complex workflows through an interactive Kanban interface while communicating instantly with team members.

# Key Features
Real-Time Collaboration: Integrated Socket.io for instantaneous updates and live team chat within project workspaces.

Dynamic Kanban Board: A fully interactive drag-and-drop interface for managing task states (Todo, In Progress, Completed).

Secure Authentication: Robust user security using JWT (JSON Web Tokens) and HTTP-only cookies, featuring a complete email verification and password reset flow.

Professional Notifications: Automated, branded email communication powered by Nodemailer, Mailgen, and Gmail SMTP (App Passwords).

Project Analytics: Backend infrastructure ready for data aggregation using MongoDB Aggregation Pipelines to track project efficiency.

Asset Management: Secure image and file handling integrated with Cloudinary and Multer.

# Tech Stack
Frontend: React.js, Tailwind CSS, Recharts (for data visualization).

Backend: Node.js, Express.js.

Database: MongoDB (Mongoose ODM).

Communication: Socket.io (WebSockets), Nodemailer (SMTP).

Cloud Services: Cloudinary (Storage), Gmail (Email Relay).

# Challenges & Achievements
1. The Migration to Production-Ready SMTP
Challenge: Initially, the system used Mailtrap for email testing, which limited the project to a "sandbox" environment where real users (or interviewers) couldn't receive verification codes.
Achievement: Successfully migrated the entire notification engine to Gmail SMTP using Google App Passwords. This involved reconfiguring the transport layer to handle SSL (Port 465) and ensuring high deliverability, making the project truly "live."

2. Mastering Real-Time State
Challenge: Syncing task movements across multiple users without requiring a page refresh.
Achievement: Implemented a WebSocket layer that broadcasts project changes instantly. This reduced server overhead compared to traditional polling and significantly improved the User Experience (UX).

3. Decoupled Architecture vs. Unified Deployment
Challenge: Managing CORS issues and deployment complexity when running React and Express on different ports (5173 and 8000).
Achievement: Developed a strategy to serve the React production build (dist folder) directly through the Express backend using express.static. This unified the origin, eliminated CORS errors, and simplified the deployment pipeline for local network testing.

# Getting Started
Prerequisites
Node.js (v16+)

MongoDB Atlas Account

Gmail Account (with 2-Step Verification enabled for App Passwords)

Environment Setup
Create a .env file in the root directory:

Code snippet
PORT=8000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_name
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
Installation
Bash
 Install backend dependencies
npm install

Install frontend dependencies
cd client
npm install

 Run in development mode
npm run dev
📜 Future Roadmap
Advanced Analytics: Implementing a full dashboard using MongoDB $group and $match stages.

Role-Based Access Control (RBAC): Defining Admin, Member, and Viewer permissions.

Mobile Responsiveness: Optimizing the Kanban drag-and-drop for touch interfaces.
