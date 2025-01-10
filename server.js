import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import upload from "./multar.js";
import { candidateModel } from "./schema.js";
import { checkRecCred, findRec, multarUpload, signInRec, signUpRec, testAPI } from "./rec_functions.js";
import { findCan, signInCan, signUpCan } from "./can_functions.js";

const app = express();
const port = process.env.PORT || 5353;
const CanModel = candidateModel;
const saltRounds = 10;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET, 
  });


const corsOptions = {
    origin: 'http://localhost:5174', // Your frontend URL (or a list of allowed URLs)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    credentials: true,  
  };

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));
app.options('*', (req, res) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:5174');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.send();
  });
  
  
app.get("/", testAPI);

app.get("/searchRec", findRec);

app.get("/searchCan", findCan);

app.get("/checkCred", (req, res) => {
    res.send("Hey baby!!..");
})

app.post("/checkRecCred", upload.none(), checkRecCred);

app.post("/upload", upload.single("logo"), multarUpload);

app.post("/signUpRec", upload.single("logo"), signUpRec);

app.post("/signUpCan", upload.single("resume"), async (req, res) => {
    try{
        const { fullName, username, email, password, jobTitle, experience, skills, roles, qualifications, jobLocation, workType, salary, availability } = req.body;

        // check if candidate email exists in the database
        const checkEmail = await CanModel.findOne({
            email: email,
        });

        console.log(req.file);
        
        // check if recruiter username exists in the database
        const checkUsername = await CanModel.findOne({
            username: username,
        });

        // if either the email or username exitsts in the database return error
        if(checkEmail || checkUsername){
            throw new Error("The username or email has been used");
        }

        // if email or username does not exists in the database 
        else{

            // // // if there is no image file return error
            if (!req.file) {
                throw new Error('No file uploaded.');
                }
                
            //   if there is an image file, then upload it and return error if any
            const savedResume = await cloudinary.uploader.upload(req.file.path, (error, result) => {
                
                if(error) throw new Error(error.message);
            });

            // hash password
            const hashedPassword = await bcrypt.hash(password, saltRounds);    
            
            // add candidate into the database
            const candidate = await CanModel.create({
                fullName: fullName,
                username: username,
                email: email,
                password: hashedPassword,
                jobTitle: jobTitle,
                experience: experience,
                skills: skills,
                roles: roles,
                resume: savedResume.url,
                qualifications: qualifications,
                jobLocation: jobLocation,
                workType: workType,
                availability: availability,
                salary: salary,
            });
            
        res.json(candidate);
        }
    }
    catch(error){
        res.status(400).json({
            error: error.message,
        });
    }
    
}
);

app.post("/signInRec", upload.single("none"), signInRec);

app.post("/signInCan", upload.single("none"), signInCan);

app.listen(port, () => {
    console.log(`Server started running on port ${port}`);
})