# ExperiTrust

## Description
ExperiTrust is a digital platform designed to help undergraduates transform academic, volunteer, and project-based activities into verified and measurable work experience and get to apply to job opportunities. 
The platform introduces a structured verification system that allows employers to objectively evaluate graduate readiness beyond traditional CVs. ExperiTrust bridges the gap between education and employment by creating a trusted, transparent experience validation process.

## GitHub Repository
```bash
https://github.com/Lenineng/ExperiTrust.git
```

## How to Set Up the Environment and Project
### Frontend
``` bash
cd experitrust-frontend
```
use Live Server in VS Code

### Backend
```bash
git clone https://github.com/Lenineng/ExperiTrust.git
cd experitrust
cd backend
npm install
```
Create .env file and add:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```
Run Backend Server
```bash
npm run dev
```
## Figma Mockups
```
https://www.figma.com/design/OtvUJceeilcPUilRI4cAEe/ExperiTrust?node-id=0-1&p=f&t=MUxBUenoVVA5g5tO-0
```
## Screenshots
please find a folder for some screenshots

## Deployment Plan
### Frontend Deployment

Platform: Netlify (Free Tier),
Connected to GitHub repository,
Auto-deploy on push to main branch

### Backend Deployment

Platform: Render (Free Tier),
Node.js server deployment, 
Connected to MongoDB Atlas (Cloud Database)

### Database

MongoDB Atlas (Free Cluster),
Cloud-hosted database with secure access

## Video Demo
1st video ( 5 mins ) : https://www.loom.com/share/c5655a23f71c475a8f0d154a6d32dde4
2nd video ( 2 mins ) continuation : https://www.loom.com/share/a26e05a9f5614a5292358b1353bfaf7d
