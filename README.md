# StaffSync — Modern Human Resource Management Solution

> **Modern Human Resource & Workforce Management System (MERN Stack)**  
> Built with MongoDB, Express.js, React.js (Vite), Node.js, and Bootstrap 5.

---

## 🔗 Project Review Links (For Mentor Evaluation)

| Item | Link / Value |
|---|---|
| **Project Title** | StaffSync - Modern human resource management solution |
| **Live Production Demo** | `https://staffsync-portal.vercel.app` *(Replace with your deployed Vercel URL)* |
| **GitHub Repository** | `https://github.com/your-username/staffsync` *(Replace with your GitHub repository link)* |
| **Technology Stack** | MongoDB Atlas, Express.js, React.js (Vite), Node.js, JWT, Bootstrap |
| **System Roles** | HR Administrator, Department Manager, Staff Employee |

---

## 🔑 Quick Demo Login Credentials

You can use the **1-Click Auto-Fill** buttons on the login page or enter these test credentials manually:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **HR Administrator** | `hr@staffsync.com` | `hr1234` | Full personnel CRUD, all department attendance, leave decisions, broadcast circulars |
| **Team Manager** | `manager@staffsync.com` | `mgr1234` | Team member roster, leave approvals/rejections with notes, schedule training |
| **Staff Employee** | `employee@staffsync.com` | `emp1234` | Digital punch clock, leave requests, attendance history, view training & circulars |

---

## 🍃 Step-by-Step MongoDB Atlas Connection Guide

Follow these steps to connect your website to a cloud MongoDB database so your application runs smoothly on both your local machine and on Vercel:

### Step 1: Create a Free MongoDB Atlas Account
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Under **Deployments**, click **Build a Database**.
3. Choose the **M0 Free (Shared)** tier (Free Forever, 512 MB).
4. Select your preferred Cloud Provider (e.g., AWS) and a region closest to you (e.g., `N. Virginia (us-east-1)` or `Mumbai (ap-south-1)`).
5. Click **Create Deployment**.

### Step 2: Configure Database User Security
1. In the **Security Quickstart** prompt (or from the left sidebar under **Database Access**):
   - Choose **Username and Password** authentication.
   - Enter a username (e.g., `admin`).
   - Enter or auto-generate a secure password (e.g., `SecurePass12345`).
   - ⚠️ **Important**: Save this password safely; you will use it in your connection URI!
2. Click **Create Database User**.

### Step 3: Configure Network IP Access (Crucial for Vercel)
1. On the left sidebar under **Security**, click **Network Access**.
2. Click **+ Add IP Address**.
3. Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   > *Note: This allows both your local machine and Vercel's serverless cloud functions to securely query the database.*
4. Click **Confirm**. Wait 1–2 minutes until the status shows **Active**.

### Step 4: Copy Your MongoDB Connection URI
1. Go back to **Database** on the left menu.
2. Click the **Connect** button next to your cluster.
3. Choose **Drivers** (Node.js).
4. Copy the connection string provided. It will look like this:
   ```bash
   mongodb+srv://admin:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
5. Replace `<password>` with your actual database user password (from Step 2).
6. Insert the database name `staffsync` right before the `?` query parameter:
   ```bash
   mongodb+srv://admin:SecurePass12345@cluster0.xxxx.mongodb.net/staffsync?retryWrites=true&w=majority
   ```

### Step 5: Configure Local Environment (`.env`)
1. In the `server` directory, create or edit the `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://admin:SecurePass12345@cluster0.xxxx.mongodb.net/staffsync?retryWrites=true&w=majority
   JWT_SECRET=staffsync_jwt_secret_production_key_2026
   ```

### Step 6: Seed Demo Data into the Database
Run the seed script from the project root or server directory:
```bash
cd server
npm run seed
```
You should see:
```text
✅ STAFFSYNC DATABASE SEEDING COMPLETED SUCCESSFULLY!
Demo Credentials for Instant Review:
  1. HR Administrator : hr@staffsync.com      | Password: hr1234
  2. Team Manager     : manager@staffsync.com | Password: mgr1234
  3. Staff Employee   : employee@staffsync.com| Password: emp1234
```

---

## 🚀 Step-by-Step Vercel Deployment Guide

Deploy your full-stack MERN application to Vercel in 4 simple steps:

### Step 1: Push Code to Your GitHub Repository
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "feat: complete StaffSync HR management solution"
   ```
2. Create a new repository on [GitHub](https://github.com/new) named `staffsync`.
3. Link your remote repository and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-github-username>/staffsync.git
   git push -u origin main
   ```

### Step 2: Import into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Select your `staffsync` repository and click **Import**.

### Step 3: Set Environment Variables on Vercel
In the **Configure Project** screen, expand **Environment Variables** and add:
- `MONGO_URI`: Your MongoDB Atlas URI (from Step 4 above)
- `JWT_SECRET`: Any random secure string (e.g. `staffsync_jwt_secret_production_key_2026`)

### Step 4: Deploy!
1. Click **Deploy**.
2. Vercel will install dependencies, build the Vite frontend into `client/dist`, and configure the serverless API routes (`/api/*`).
3. Once finished, Vercel gives you your live production URL (e.g., `https://staffsync-portal.vercel.app`).
4. Paste this link into your mentor project submission form!

---

## 📋 Epics and Features Breakdown (6 Epics, 19 Tasks)

### Epic 1: Authentication & Role-Based Authorization
- [x] Secure JWT Token-based authentication with bcrypt password hashing
- [x] Persistent session handling with authorization header interceptors
- [x] Three isolated user roles: `HR Admin`, `Manager`, and `Employee`
- [x] Role-protected routing preventing unauthorized privilege escalation
- [x] User Profile management (Full Name, Phone, Address, Password updates)

### Epic 2: Personnel & Employee Directory
- [x] Full CRUD operations for employee records (HR exclusive)
- [x] Dual-View Switcher: Interactive **Grid Cards View** and **Data Table View**
- [x] Live multi-filter toolbar: Instant search, department filter, and role filter
- [x] Manager hierarchy assignment and reporting line linking
- [x] Safe deletion confirmations and field validation

### Epic 3: Leave & Time-Off Management
- [x] Leave entitlement allowance summary cards (Casual, Sick, Annual, Unpaid)
- [x] Interactive leave application form with automatic working day calculator
- [x] Approval status workflow (`pending`, `approved`, `rejected`)
- [x] Manager/HR review console with 1-click approvals and rejection feedback
- [x] Employee personal leave application history log

### Epic 4: Attendance Tracking & Punch Clock
- [x] Interactive digital punch clock terminal with live ticking seconds
- [x] Daily Shift Clock-In and Clock-Out actions with timestamp validation
- [x] Automatic daily working hours calculation (`8h 15m`)
- [x] Today's attendance status pill and live work session duration
- [x] Organization-wide attendance log auditing with date filter (HR & Managers)

### Epic 5: Announcements & Company Notice Board
- [x] Official bulletin board categorized by Announcements and Company News
- [x] HR broadcast composer with rich message details
- [x] Author verification badges and publish date tracking
- [x] Deletion control for outdated circulars (HR exclusive)

### Epic 6: Learning & Professional Development (Trainings)
- [x] Program scheduling console for HR and Managers
- [x] Status calculation (Upcoming, In Progress, Completed based on dates)
- [x] Multi-select employee enrollment roster
- [x] Trainer attribution and curriculum objectives overview
- [x] Employee personal enrolled program dashboard view

---

## 💻 Running the Application Locally

### Prerequisites
- Node.js (v16 or higher)
- Local MongoDB running on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas cloud URI

```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
cd server
npm install
npm run seed      # Seeds demo database accounts
npm run dev       # Starts development server with hot-reload

# Terminal 2: React Frontend (runs on http://localhost:3000)
cd client
npm install
npm run dev       # Starts Vite dev server with proxy to :5000
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🛡️ License
Educational & Academic Project Submission. MIT License.
