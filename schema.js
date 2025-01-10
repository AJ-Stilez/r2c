import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.URI;

mongoose.connect(uri)
.then(() => {
    console.log("MongoDb database connected");
})
.catch((error) => {
    console.log(`MongoDb connection error: ${error}`);
})


const recruiterSchema = new mongoose.Schema({
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

const candidateSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true, },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
    },
    password: { type: String, required: true},
    jobTitle: { type: String, required: true },
    experience: { type: String, required: true },
    skills: { type: Array, required: true },
    roles: { type: Array, required: true },
    resume: { type: String, required: true },
    qualifications: { type: [String], required: true, default: [
        "none"
    ] },
    jobLocation: {type: String, required: true },
    workType: {type: String, required: true },
    availability: {type: String, required: true },
    salary:  {type: String, required: true },
});

const recruiterModel = mongoose.model("recruiter_collection", recruiterSchema);
const candidateModel = mongoose.model("candidate_collection", candidateSchema);

export { recruiterModel, candidateModel };