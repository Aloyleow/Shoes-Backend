import express, {type Request, type Response} from "express";
import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import saveImage from "../services/multerStorage";
import s3 from "../services/aws-s3";
import pool from "../services/pool";

const router = express.Router();

const uploadShoesSchema = z.object({
  name: z.string(),
  typeid: z.number(),
  brandid: z.number(),
  sizeid: z.number(),
  colour: z.string().max(30),
  miscellaneous: z.string(),
  costprice: z.number(),
  picture: z.boolean(),
});

type UploadShoes = z.infer<typeof uploadShoesSchema>;

router.post("/upload", saveImage.single('imageAWS'), async (req: Request<{},{}, UploadShoes>, res: Response) => {

  const bucketName = process.env.BUCKET_NAME;

  const dataUpload = `
  INSERT INTO shoes (name, typeid, brandid, sizeid, colour, miscellaneous, costprice, picture)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING shoesid
  `

  const queryType = `
  SELECT typeid FROM shoetypes
  WHERE typeid = $1
  `

  const queryBrand = `
  SELECT brandid FROM brands
  WHERE brandid = $1
  `

  const querySize = `
  SELECT sizeid FROM sizes
  WHERE sizeid = $1
  `
  // const awsParams = {
  //   Bucket: bucketName,
  //   Key: req.file?.originalname,
  //   Body: req.file?.buffer,
  //   ContentType: req.file?.mimetype
  // }

  try {

    const validateReqBody = uploadShoesSchema.safeParse(req.body);
    if (!validateReqBody.success) {
      const validateError = validateReqBody.error.issues.map(item => `${item.path}: ${item.message}`);
      throw new Error(`Validation type failed ${validateError}`);
    } 

    const checkType = await pool.query(queryType, [req.body.typeid]);
    const checkBrand = await pool.query(queryBrand, [req.body.brandid]);
    const checkSize = await pool.query(querySize, [req.body.sizeid]);

    const dataInput = [
      req.body.name,
      req.body.typeid,
      req.body.brandid,
      req.body.sizeid,
      req.body.colour,
      req.body.miscellaneous,
      req.body.costprice,
      req.body.picture
    ] 


  } catch {
      
  }
})

// router.post("/test", async (req, res) => {
//   const queryUpload = `
//   INSERT INTO brands (brandname)
//   VALUES ($1)
//   RETURNING brandid
//   `

//   try {
//     const upload = await pool.query(queryUpload, [req.body.brandname]);
// //returning id while created
//     res.status(201).json(upload.rows[0].brandid);
   
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(500).json({ error: error.message})
//     } 
//     res.status(500).json({ error: "major error" })
//   }


// })

export default router