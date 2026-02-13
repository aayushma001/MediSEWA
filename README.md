
<div align="center">
  <img src="frontend/public/LOGO.png" alt="MediSEWA Logo" width="200" height="auto" />
  <h1>MediSEWA</h1>
  <p><strong>Integrated Healthcare Management Platform</strong></p>
</div>

## 🏥 Overview
MediSEWA is a comprehensive digital healthcare platform designed to bridge the gap between patients, doctors, and hospitals. It streamlines appointment booking, medical record management, and hospital administration, making healthcare services more accessible and efficient.

## ❗ Problem Statement
The current healthcare ecosystem is often fragmented and inefficient:
- **For Patients:** Finding the right specialist is difficult. Booking appointments often requires physical visits or endless phone calls. Medical history is scattered across paper files, leading to lost records and repeated tests.
- **For Doctors:** Managing schedules manually is time-consuming. Lack of access to a patient's complete medical history can hinder accurate diagnosis.
- **For Hospitals:** Administrative burdens and manual record-keeping slow down operations and reduce patient throughput.

## 💡 What We Are Trying to Create
Our mission is to **digitize and unify the healthcare experience**. We are building a centralized platform where:
- **Accessibility:** Patients can easily find specialists, book appointments, and access their medical history from anywhere, anytime.
- **Efficiency:** Hospitals can streamline their operations, from managing staff to tracking patient flow.
- **Connectivity:** Electronic Health Records (EHR) ensure that a patient's history travels with them, empowering doctors to make informed decisions.

**MediSEWA isn't just an app; it's a step towards a modern, transparent, and patient-centric healthcare system.**

## ✨ Key Features

### For Patients
- **Easy Registration & Login**: Secure access to personal health dashboard.
- **Find Doctors & Hospitals**: Search for specialists and medical centers.
- **Appointment Booking**: Hassle-free online scheduling.
- **Health Records**: View prescriptions, reports, and medical history.
- **Blog**: Access health tips and medical insights.

### For Doctors
- **Dashboard**: Manage appointments and patient schedules.
- **Digital Prescriptions**: Create and send prescriptions instantly.
- **Patient History**: Access patient medical records securely.

### For Hospitals
- **Admin Panel**: Manage doctors, staff, and hospital resources.
- **Analytics**: Track patient flow and hospital performance.

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Python, Django REST Framework
- **Database**: SQLite (Development) / PostgreSQL (Production ready)
- **Deployment**: Docker, Docker Compose

## 🚀 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.

### Quick Start with Docker
Run the entire application stack with a single command:

```bash
docker-compose up --build
```

Access the application:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000](http://localhost:8000)

## 📂 Project Structure

```
MediSEWA/
├── frontend/       # React + Vite Application
├── backend/        # Django REST Framework API
├── docker-compose.yml
└── .env
```
