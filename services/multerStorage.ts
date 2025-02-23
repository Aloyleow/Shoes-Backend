import multer from "multer";

const storage = multer.memoryStorage();
const saveImage = multer({
  storage: storage
});

export default saveImage