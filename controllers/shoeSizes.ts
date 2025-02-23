import express, { type Request, type Response } from "express";
import { z } from "zod";
import pool from "../services/pool";

const router = express.Router();

const shoeSizeSchema = z.object({
  sizecountry: z.enum(['US', 'UK', 'EURO']),
  sizenumber: z.number(),
});

type ShoeSize = z.infer<typeof shoeSizeSchema>

router.post("/shoesize", async(req: Request<{}, {}, ShoeSize>, res: Response) => {

  const dataUpload = `
  INSERT INTO sizes (sizecountry, sizenumber)
  VALUES ($1, $2)
  `
  const queryType = `
  SELECT *
  FROM sizes
  WHERE sizecountry = $1 AND sizenumber = $2
  `

  try {

    const validateReqBody = shoeSizeSchema.safeParse(req.body);
    if (!validateReqBody.success) {
      const validateError = validateReqBody.error.issues.map(item => `${item.path}: ${item.message}`);
      throw new Error(`Validation type failed ${validateError}`);
    }

    const dataInput = [
      req.body.sizecountry,
      req.body.sizenumber
    ]

    const checkType = await pool.query(queryType, dataInput);
    if (checkType.rowCount !== 0) {
      throw new Error("Shoe size already exist.");
    }

    const upload = await pool.query(dataUpload, dataInput);
    if (!upload) {
      throw new Error("PG Database Error.");
    }

    res.status(201).json("Success")

    
  } catch (error: unknown) {

    if (error instanceof Error) {

      res.status(500).json({ error: error.message });

    } else {

      res.status(500).json({ error: "Internal server error" });

    }
    
  }


})


export default router