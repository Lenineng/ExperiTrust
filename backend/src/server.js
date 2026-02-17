import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"

import {connectDB} from "./lib/db.js"

import authRoutes from "./routes/auth.route.js"
import studentRoutes from "./routes/student.route.js";
import employerRoutes from "./routes/employer.route.js";
import adminRoutes from "./routes/admin.route.js";


dotenv.config()
const app = express();

const PORT= process.env.PORT

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
    
}))
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/admin", adminRoutes);



app.listen(PORT, () =>{
    connectDB()
    console.log("Server is running on port "+ PORT)
})
