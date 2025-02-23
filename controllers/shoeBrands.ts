import express, { type Request, type Response } from "express";
import { z } from "zod";
import pool from "../services/pool";

const router = express.Router();

const shoeBrandSchema = z.object({
  brandname: z.string().max(30)
});

type ShoeBrand = z.infer<typeof shoeBrandSchema>

router.post("/shoebrand", async(req: Request<{}, {}, ShoeBrand>, res: Response) => {

  const dataUpload = `
  INSERT INTO brands (brandname)
  VALUES ($1)
  `
  const queryType = `
  SELECT brandname
  FROM brands
  WHERE brandname = $1
  `

  try {

    const validateReqBody = shoeBrandSchema.safeParse(req.body);
    if (!validateReqBody.success) {
      const validateError = validateReqBody.error.issues.map(item => `${item.path}: ${item.message}`);
      throw new Error(`Validation type failed ${validateError}`);
    }

    const checkType = await pool.query(queryType, [req.body.brandname]);
    if (checkType.rowCount !== 0) {
      throw new Error("Shoe brand already exist.");
    }

    const upload = await pool.query(dataUpload, [req.body.brandname]);
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