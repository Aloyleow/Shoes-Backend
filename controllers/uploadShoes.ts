import express, { type Request, type Response } from "express";
import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import saveImage from "../services/multerStorage";
import s3 from "../services/aws-s3";
import pool from "../services/pool";

const router = express.Router();

const uploadShoeSchema = z.object({
  name: z.string(),
  typeid: z.number(),
  brandid: z.number(),
  sizeid: z.number(),
  colour: z.string().max(30),
  miscellaneous: z.string(),
  costprice: z.number(),
  picture: z.boolean(),
});

type UploadShoe = z.infer<typeof uploadShoeSchema>;

const formDataSchema = z.object({
  shoedata: z.string(),
})

type FormDataCheck = z.infer<typeof formDataSchema>;

router.post("/upload", saveImage.single('imageAWS'), async (req: Request<{}, {}, FormDataCheck>, res: Response<"Success"| "Success w/o Image" | { error: string }>) => {

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

    const parsedData: UploadShoe = JSON.parse(req.body.shoedata);
    
    const validateReqBody = uploadShoeSchema.safeParse(parsedData);
    if (!validateReqBody.success) {
      const validateError = validateReqBody.error.issues.map(item => `${item.path}: ${item.message}`);
      throw new Error(`Validation type failed ${validateError}`);
    }

    const checkType = await pool.query(queryType, [parsedData.typeid]);
    if (checkType.rowCount === 0 || !checkType) {
      throw new Error("Shoe Type does not exist.");
    }

    const checkBrand = await pool.query(queryBrand, [parsedData.brandid]);
    if (checkBrand.rowCount === 0 || !checkBrand) {
      throw new Error("Shoe Brand does not exist.");
    }

    const checkSize = await pool.query(querySize, [parsedData.sizeid]);
    if (checkSize.rowCount === 0 || !checkSize) {
      throw new Error("Shoe Size does not exist.");
    }

    const dataInput = [
      parsedData.name,
      parsedData.typeid,
      parsedData.brandid,
      parsedData.sizeid,
      parsedData.colour,
      parsedData.miscellaneous,
      parsedData.costprice,
      parsedData.picture
    ]

    const upload = await pool.query(dataUpload, dataInput);
    if (!upload) {
      throw new Error("PG Database Error.");
    }

    if (parsedData.picture) {

      const awsParams = {
        Bucket: bucketName,
        Key: `${upload.rows[0].shoesid}`,
        Body: req.file?.buffer,
        ContentType: req.file?.mimetype
      }
      const command = new PutObjectCommand(awsParams)

      const uploadImage = await s3.send(command)
      if (!uploadImage) {
        throw new Error("AWS Database Error.");
      }

      res.status(201).json("Success");

    } else {

      res.status(201).json("Success w/o Image");

    }


  } catch (error: unknown){

    if (error instanceof Error) {

      res.status(400).json({ error: error.message });

    } else {

      res.status(500).json({ error: "Internal server error" });

    }

  }
})

export default router