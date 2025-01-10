import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import upload from "./multar.js";
import { checkRecCred, findRec, multarUpload, signInRec, signUpRec, testAPI } from "./rec_functions.js";
import { findCan, signInCan, signUpCan } from "./can_functions.js";

const app = express();
const port = process.env.PORT || 5353;

const corsOptions = {
    origin: 'http://localhost:5174', // Your frontend URL (or a list of allowed URLs)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    credentials: true,  
  };

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));
  
app.get("/", testAPI);

app.get("/searchRec", findRec);

app.get("/searchCan", findCan);

app.get("/checkCred", (req, res) => {
    res.send("Hey baby!!..");
})

app.post("/checkRecCred", upload.none(), checkRecCred);

app.post("/upload", upload.single("logo"), multarUpload);

app.post("/signUpRec", upload.single("logo"), signUpRec);

app.post("/signUpCan", upload.single("resume"), signUpCan);

app.post("/signInRec", upload.single("none"), signInRec);

app.post("/signInCan", upload.single("none"), signInCan);

app.listen(port, () => {
    console.log(`Server started running on port ${port}`);
})