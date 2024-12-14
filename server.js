const express = require("express");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const cors = require("cors");
const path = require("path");

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5353;
const uri = process.env.URI;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: '*', // Allow only this origin
    methods: ['GET', 'POST'], // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
}));

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET,
});

// MongoDB connection
mongoose.connect(uri)
.then(() => {
    console.log("MongoDb database connected");
})
.catch((error) => {
    console.log(`MongoDb connection error: ${error}`);
});

// Mongoose schema definition
const mySchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
    },
    logo: { type: String, required: true },
    password: { type: String, required: true },
    company: { type: String, required: true },
    industry: { type: String, required: true },
    size: { type: Number, required: true },
    introduction: { type: String, required: true },
    hiring: { type: Array, required: true },
    title: { type: Array, required: true },
    qualification: { type: String, required: true },
});

const MyModel = mongoose.model("tvc_database", mySchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // specify upload folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// API routes
app.get("/", (req, res) => {
    res.send("API working fine");
});

app.post("/signUp", upload.single("logo"), async (req, res) => {
    try {
        const { username, email, password, company, industry, size, introduction, hiring, title, qualification } = req.body;
        const saltRounds = 10;

        // Check if email or username is already in use
        const checkEmail = await MyModel.findOne({ email: email });
        const checkUsername = await MyModel.findOne({ username: username });

        if (checkEmail || checkUsername) {
            return res.json({
                error: "The username or email has been used",
            });
        }

        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Upload logo to Cloudinary
        const logoObject = await cloudinary.uploader.upload(req.file.path, (error, result) => {
            if (error) {
                return res.json(error.message);
            }
            console.log({
                message: 'File uploaded successfully!',
                file: req.file,  // Cloudinary file details
            });
        });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user in database
        const response = await MyModel.create({
            username: username,
            email: email,
            password: hashedPassword,
            company: company,
            industry: industry,
            logo: logoObject.url,
            size: size,
            introduction: introduction,
            hiring: hiring,
            title: title,
            qualification: qualification,
        });

        res.json(response);
    } catch (error) {
        res.json(error.message);
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server started running on port ${port}`);
});
