import express, { type Request, type Response } from "express";
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

router.post("/upload", saveImage.single('imageAWS'), async (req: Request<{}, {}, UploadShoes>, res: Response) => {

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

  try {

    const validateReqBody = uploadShoesSchema.safeParse(req.body);
    if (!validateReqBody.success) {
      const validateError = validateReqBody.error.issues.map(item => `${item.path}: ${item.message}`);
      throw new Error(`Validation type failed ${validateError}`);
    }

    const checkType = await pool.query(queryType, [req.body.typeid]);
    if (checkType.rowCount === 0 || !checkType) {
      throw new Error("Shoe Type does not exist.");
    }

    const checkBrand = await pool.query(queryBrand, [req.body.brandid]);
    if (checkBrand.rowCount === 0 || !checkBrand) {
      throw new Error("Shoe Brand does not exist.");
    }

    const checkSize = await pool.query(querySize, [req.body.sizeid]);
    if (checkSize.rowCount === 0 || !checkSize) {
      throw new Error("Shoe Size does not exist.");
    }

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

    const upload = await pool.query(dataUpload, dataInput);
    if (!upload) {
      throw new Error("PG Database Error.");
    }

    if (req.body.picture) {

      const awsParams = {
        Bucket: bucketName,
        Key: upload.rows[0].brandid,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype
      }
      const command = new PutObjectCommand(awsParams)

      const uploadImage = await s3.send(command)
      if (!uploadImage) {
        throw new Error("AWS Database Error.");
      }

      res.status(201).json("Success");

    }

    res.status(201).json("Success w/o Image");


  } catch (error: unknown){

    if (error instanceof Error) {

      res.status(500).json({ error: error.message });

    } else {

      res.status(500).json({ error: "Internal server error" });

    }

  }
})

export default router