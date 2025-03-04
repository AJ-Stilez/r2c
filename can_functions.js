import bcrypt from "bcryptjs";
import { candidateModel } from "./schema.js";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

dotenv.config();

const CanModel = candidateModel;
const saltRounds = 10;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET, 
  });


const signUpCan = async (req, res) => {
    try{
        const { fullName, username, email, resume, password, jobTitle, experience, skills, roles, qualifications, jobLocation, workType, salary, availability } = req.body;

        console.log(resume);
        // check if candidate email exists in the database
        const checkEmail = await CanModel.findOne({
            email: email,
        });    
        
        console.log(resume);
        
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

            // if there is no image file return error
            if (!resume) {
                throw new Error('No file uploaded.');
                };

            // hash password
            const hashedPassword = await bcrypt.hash(password, saltRounds);    
            
            // add candidate into the database
            const candidate = await CanModel.create({
                fullName: fullName,
                username: username,
                email: email,
                resume: resume,
                password: hashedPassword,
                jobTitle: jobTitle,
                experience: experience,
                skills: skills,
                roles: roles,
                resume: resume,
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

const signInCan = async (req, res) => {
    try{
        const { email, password } = req.body;

        // if there is no email or password throw error
        if(!email || !password){
            throw new Error("Email and password is required");
        }

        // check if candidate exists in database
        const checkUser = await CanModel.findOne({
            email: email,
        });
        
        // if there is no candidate throw error
        if(!checkUser){
            throw new Error("Candidate not found, please kindly sign up");
        }

        // validate candidate password entry
        const hashedPassword = checkUser.password;
        const validatePassword = await bcrypt.compare(password, hashedPassword);
        
        // if candidate password entry is invalid throw error
        if(!validatePassword){
            throw new Error("Password is incorrect");
        }

        // if candidate password is valid send success message as json
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

const findCan = async (req, res) => {
    try{
        const users = await candidateModel.find();
        // const users = await MyModel.find({
        //     qualification: "Degree",
        // });

        if(users.length == 0) throw new Error("User not found");

        res.status(200).json({ users });
    }
    catch(error){
        res.status(400).json({
            error: error.message,
        })
    }
}

export { signUpCan, findCan, signInCan };