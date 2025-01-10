import bcrypt from "bcryptjs";
import { recruiterModel } from "./schema.js";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

dotenv.config();

const saltRounds = 10;
const RecModel = recruiterModel;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET, 
  });


const testAPI = (req, res) => {
    res.send("API working fine");
}

const  checkRecCred = async (req, res) => {
    try{
        // destructure the neccessary variables from the req.body
        const { username, email } = req.body;

        // if there is not a username or email  variable found throw error
        if (!username || !email) {
            throw new Error("Both username and email are required");
        }
            // if there is an username check if it exists in the database before hand
            const checkUsername = await RecModel.findOne({
                username: username,
            });

            // if there is an email check if it exists in the database before hand
            const checkEmail = await RecModel.findOne({
                email: email,
            });
            
            // if the username exists before throw error
            if(checkUsername){
                throw new Error("Username is taken");
            }

            // if the email exists before throw error
            else if(checkEmail){
                throw new Error("Email has been used");
            }
            // console.log("Working fine");
                res.status(200).json({message: "Success"});
    }
    catch(error){
        throw new Error(error.message);
    }
}

const signUpRec =  async (req, res) => {
    try{
        // const username = "Test2";
        // const email = "adenusijoseph9@gmail.com";
        // const password = "HAHAHA";
        // const company = "TVC";
        // const industry = "HEY";
        // const size = 4;
        // const introduction = "Hey I'm new here";
        // const hiring = ["New", "Year", "Eve"];
        // const title = ["He", "She", "They"];
        // const qualification = "Professional";

        const { username, email, password, company, industry, size, introduction, hiring, title, qualification } = req.body;
        
        // check if recruiter email exists in the database
        const checkEmail = await RecModel.findOne({
            email: email,
        });
        
        // check if recruiter username exists in the database
        const checkUsername = await RecModel.findOne({
            username: username,
        });

        // if either the email or username exitsts in the database return error
        if(checkEmail || checkUsername){
            throw new Error("The username or email has been used");
        }

        // if email or username does not exists in the database 
        else{

            // if there is no image file return error
            if (!req.file) {
                throw new Error('No file uploaded.');
              }
              
            //   if there is an image file, then upload it and return error if any
            const logoObject = await cloudinary.uploader.upload(req.file.path, (error, result) => {
              
                if(error) throw new Error(error.message);

            });
            console.log(logoObject);

            // hash password
            const hashedPassword = await bcrypt.hash(password, saltRounds);    
            
            // add recruiter into the database
            const recruiter = await RecModel.create({
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
            res.json(recruiter);
        }
    }
    catch(error){
        res.status(400).json({
            error: error.message,
        });
    }
}

const signInRec = async (req, res) => {
    try{
        const { email, password } = req.body;

        // if there is no email or password throw error
        if(!email || !password){
            throw new Error("Email and password is required");
        }

        // check if recruiter exists in database
        const checkUser = await RecModel.findOne({
            email: email,
        });
        
        // if there is no recruiter throw error
        if(!checkUser){
            throw new Error("Recruiter not found, please kindly sign up");
        }

        // validate recruiter password entry
        const hashedPassword = checkUser.password;
        const validatePassword = await bcrypt.compare(password, hashedPassword);
        
        // if recruiter password entry is invalid throw error
        if(!validatePassword){
            throw new Error("Password is incorrect");
        }

        // if recruiter password is valid send success message as json
        else{
            res.status(200).json({
                message: "Password valid",
                user: checkUser,
            });
        }
    }
    catch(error){
        res.status(400).json({
            error: error.message,
        });
    }
}

const findRec = async (req, res) => {
    try{
        // return all users recruiters from the collection
        const users = await RecModel.find();
        // const users = await MyModel.find({
        //     qualification: "Degree",
        // });

        // if there is no recruiter found throw new error
        if(users.length == 0) throw new Error("User not found");

        // if there is recruiter the send it in JSON format
        res.status(200).json({ users });
    }
    catch(error){
        res.status(400).json({
            error: error.message,
        })
    }
}

const multarUpload = async (req, res) => {
    try{
        // try uploading the image file
        await cloudinary.uploader.upload(req.file.path, (error, result) => {
              
            if(error) throw new Error(error.message);
    
            res.status(200).json({
                message: 'File uploaded successfully!',
                file: req.file,  // Cloudinary file details
              });
        });
    }
    catch(error){
        res.status(400).json({
            error: error
        });
    }
}

export { testAPI, checkRecCred, multarUpload, signUpRec, signInRec, findRec };