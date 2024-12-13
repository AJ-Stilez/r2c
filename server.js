import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import path from "path";
import cors from "cors";


dotenv.config();

const app = express();
const port = process.env.PORT || 5353;
const uri = process.env.URI;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET, 
  });


mongoose.connect(uri)
.then(() => {
    console.log("MongoDb database connected");
})
.catch((error) => {
    console.log(`MongoDb connection error: ${error}`);
})

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
    hiring: {type: Array, required: true },
    title: {type: Array, required: true },
    qualification:  {type: String, required: true },
});

const MyModel = mongoose.model("tvc_database", mySchema);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // specify upload folder
      },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
   
const upload = multer({storage: storage});

app.get("/", (req, res) => {
    res.send("API working fine");
})

app.post("/signUp", upload.single("logo"), async (req, res) => {
    try{
        // const username = "Test1";
        // const email = "adenusijoseph5@gmail.com";
        // const password = "HAHAHA";
        // const company = "TVC";
        // const industry = "HEY";
        // const size = 4;
        // const introduction = "Hey I'm new here";
        // const hiring = ["New", "Year", "Eve"];
        // const title = ["He", "She", "They"];
        // const qualification = "Professional";
        const saltRounds = 10;
        const { username, email, password, company, industry, size, introduction, hiring, title, qualification } = req.body;

        const checkEmail = await MyModel.findOne({
            email: email,
        });
        const checkUsername = await MyModel.findOne({
            username: username,
        });

        if(checkEmail || checkUsername){
            res.json({
                error: "The username or email has been used",
            });
        }
        else{
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded.' });
              }
    
            const logoObject = await cloudinary.uploader.upload(req.file.path, (error, result) => {
              
                if(error) res.json(error.message);
    
                console.log({
                    message: 'File uploaded successfully!',
                    file: req.file,  // Cloudinary file details
                  });
            });
            console.log(logoObject);
    
            const hashedPassword = await bcrypt.hash(password, saltRounds);
    
            console.log(hashedPassword);
    
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
            // console.log(re)
            // res.send("Hello");
            res.json(response);
        }
    }
    catch(error){
        res.json(error.message);
    }
})

app.listen(port, () => {
    console.log(`Server started running on port ${port}`);
})