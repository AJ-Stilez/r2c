import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    //     // destination: (req, file, cb) => {
    //     //     cb(null, 'uploads/'); // specify upload folder
    //     //   },
        filename: (req, file, cb) => {
          cb(null, Date.now() + path.extname(file.originalname));
        }
      });
    // const storage = multer.memoryStorage();
    const upload = multer({storage: storage});

    export default upload;