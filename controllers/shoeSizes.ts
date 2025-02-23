import express, { type Request, type Response } from "express";
import { z } from "zod";
import pool from "../services/pool";

const router = express.Router();

const shoeSizeSchema = z.object({
  sizecountry: z.enum(['US', 'UK', 'EURO']),
  sizenumber: z.number(),
});

type ShoeSize = z.infer<typeof shoeSizeSchema>


router.post("/shoesize", async(req: Request<{}, {}, ShoeSize>, res: Response<"Success" | { error: string }>) => {

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

      res.status(400).json({ error: error.message });

    } else {

      res.status(500).json({ error: "Internal server error" });

    }
    
  }


})

const eidtShoeSizeSchema = z.object({
  newsizecountry: z.enum(['US', 'UK', 'EURO']),
  newsizenumber: z.number(),
  sizeid: z.number(),
  sizecountry: z.enum(['US', 'UK', 'EURO']),
  sizenumber: z.number(),
});

type EditShoeSize = z.infer<typeof eidtShoeSizeSchema>

router.put("/shoesize", async(req: Request<{}, {}, EditShoeSize>, res: Response<"Success" | { error: string }>) => {

  const dataUpload = `
  UPDATE sizes
  SET sizecountry = $1, sizenumber = $2
  WHERE sizeid = $3 AND sizecountry = $4 AND sizenumber = $5
  `
  const queryType = `
  SELECT *
  FROM sizes
  WHERE sizecountry = $1 AND sizenumber = $2
  `

  try {

    const validateReqBody = eidtShoeSizeSchema.safeParse(req.body);
    if (!validateReqBody.success) {
      const validateError = validateReqBody.error.issues.map(item => `${item.path}: ${item.message}`);
      throw new Error(`Validation type failed ${validateError}`);
    }

    const checkType = await pool.query(queryType, [req.body.newsizecountry, req.body.newsizenumber]);
    if (checkType.rowCount !== 0) {
      throw new Error("Shoe size already exist.");
    }

    const dataInput = [
      req.body.newsizecountry,
      req.body.newsizenumber,
      req.body.sizeid,
      req.body.sizecountry,
      req.body.sizenumber
    ]

    const upload = await pool.query(dataUpload, dataInput);
    if (!upload) {
      throw new Error("PG Database Error.");
    }

    res.status(201).json("Success")

    
  } catch (error: unknown) {

    if (error instanceof Error) {

      res.status(400).json({ error: error.message });

    } else {

      res.status(500).json({ error: "Internal server error" });

    }
    
  }


})

const displayShoeSizesSchema = z.array(z.object({
  sizeid: z.number(),
  sizecountry: z.enum(['US', 'UK', 'EURO']),
  sizenumber: z.number(),
}))

type DisplayShoeSizes = z.infer<typeof displayShoeSizesSchema>

router.get("/shoesize", async(req: Request, res: Response<DisplayShoeSizes | {error: string}>) => {

  const queryData = `
  SELECT * 
  FROM sizes
  `;

  try {

    const checkData = await pool.query(queryData);
    if (!checkData) {
      throw new Error("PG Database Error.");
    }
    
    res.status(200).json(checkData.rows)
    
  } catch (error: unknown) {

    if (error instanceof Error) {

      res.status(400).json({ error: error.message });

    } else {

      res.status(500).json({ error: "Internal server error" });

    }
    
  }

})


export default router