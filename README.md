# Digital-Talent-Management-System
TalentGrid is a robust, full-stack web application designed to streamline the lifecycle of talent management within a digital ecosystem. Built on the MERN stack (MongoDB, Express.js, React, Node.js), it provides an organized "grid-based" approach to tracking progress, managing tasks, and optimizing human resource allocation.
# Sprint 1: Foundation & Authentication
Status: Completed ✅

The primary focus of Sprint 1 was to establish the core technical architecture and the visual language of the application.

Project Initialization: Set up the MERN stack environment (MongoDB, Express, React, Node.js).

Visual Branding: Conceptualized and designed the TalentGrid geometric logo, representing the interconnectivity of digital nodes and talent.

Core Authentication: Implemented the full-stack Auth system with JWT (JSON Web Tokens) for secure Login and Registration.

Frontend UI: Developed the initial high-fidelity Authentication pages using React and custom CSS, integrating the brand identity into the user interface.

Database Schema: Designed the initial User and Talent models in MongoDB to handle structured data management.
# 📖 Sprint 2 Core System Development

In this sprint, the focus was on developing the core system functionality, including Task Management and Dashboard.

✅ Features Implemented
🔹 Task Management Module

Create Tasks (Admin)
View Tasks (User & Admin)
Edit Tasks (Admin)
Delete Tasks (Admin)

🔹 User Task Interaction

Users can view assigned tasks
Users can submit their tasks

🔹 Dashboard

Admin Dashboard to manage tasks
User Dashboard to view task status

🔹 Authentication Integration

Secure routes using JWT authentication
Only authorized users can access features

🔹 Backend Development

Built REST APIs using Node.js and Express
Implemented CRUD operations for tasks

🔹 Database Integration

Connected MongoDB using Mongoose
Created models for Users and Tasks

🛠️ Tech Stack

Frontend:
React.js

Backend:
Node.js
Express.js

Database:
MongoDB

🔗 Key Functionalities

Full CRUD operations for Task Management
Role-based access (Admin/User – partially implemented)
Frontend and Backend integration
Real-time task handling

📂 Project Structure

/client → React Frontend
/server → Node.js Backend
/models → Database Schemas
/routes → API Routes
/middleware → Authentication

📊 Sprint 2 Outcome

Successfully developed the core working system where:

Admin can manage tasks
Users can interact with tasks
Dashboard displays task-related data.

## 🚀 Digital Talent Management System – Sprint 3 Completed

Continuing from Sprint 1 (Authentication) and Sprint 2 (Core Task Management), Sprint 3 focuses on implementing advanced features, improving system control, and adding analytics.

---

### ✅ Sprint 3 – Advanced Features & Optimization

🔐 Role-Based Access Control (RBAC)
- Implemented Admin and User roles
- Protected routes using existing authentication middleware
- Restricted admin-only features securely

📌 Task Status Tracking
- Added task status: Pending, In Progress, Completed
- Enabled status updates for better task lifecycle management
- Integrated seamlessly with existing task module

📊 Basic Analytics (Admin Dashboard)
- Created protected API endpoint: `GET /api/tasks/stats`
- Calculated:
  - Total tasks
  - Completed tasks
  - Pending tasks
  - Completion rate (%)

👥 User-wise Analytics
- Task count per user
- Completed tasks per user
- Identified top-performing users

💻 Frontend Enhancements
- Integrated analytics into Admin Dashboard
- Added Stats section:
  - Task counts
  - Completion rate visualization
  - User performance insights
- Enabled auto-refresh after task operations

🎨 UI Improvements
- Clean and responsive design
- Modern dashboard layout
- Consistent UI with previous sprints

---

### ⚙️ Tech Stack
- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: JWT

---

### 🔒 Important Notes
- No existing functionality was modified or broken
- Authentication and task management remain stable
- Code follows modular and scalable structure

---

### 📈 Progress Summary
- ✅ Sprint 1: Authentication & Setup
- ✅ Sprint 2: Task Management System
- ✅ Sprint 3: Advanced Features & Analytics
- ⏳ Sprint 4: Deployment (Next Phase)

---

### 🎯 Outcome
Successfully enhanced the application with secure role-based access, structured task tracking, and meaningful analytics for admin insights.

---

🔜 Next Step: Deployment & Production Release (Sprint 4)
