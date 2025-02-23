import express, { type Request, type Response } from "express";
import { z } from "zod";
import pool from "../services/pool";

const router = express.Router();

const shoeBrandSchema = z.object({
  brandname: z.string().max(30)
});

type ShoeBrand = z.infer<typeof shoeBrandSchema>

router.post("/shoebrand", async(req: Request<{}, {}, ShoeBrand>, res: Response<"Success" | { error: string }>) => {

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

      res.status(400).json({ error: error.message });

    } else {

      res.status(500).json({ error: "Internal server error" });

    }
    
  }


})

const editShoeBrandSchema = z.object({
  newbrandname: z.string().max(30),
  brandid: z.number(),
  brandname: z.string().max(30)
});

type EditShoeBrand = z.infer<typeof editShoeBrandSchema>

router.put("/shoebrand", async(req: Request<{}, {}, EditShoeBrand>, res: Response<"Success" | { error: string }>) => {

  const dataUpload = `
  UPDATE brands
  SET brandname = $1
  WHERE brandid = $2 AND brandname = $3
  `
  const queryType = `
  SELECT *
  FROM brands
  WHERE brandname = $1
  `

  try {

    const validateReqBody = shoeBrandSchema.safeParse(req.body);
    if (!validateReqBody.success) {
      const validateError = validateReqBody.error.issues.map(item => `${item.path}: ${item.message}`);
      throw new Error(`Validation type failed ${validateError}`);
    }

    const checkType = await pool.query(queryType, [req.body.newbrandname]);
    if (checkType.rowCount !== 0) {
      throw new Error("Shoe brand already exist.");
    }

    const dataInput = [
      req.body.newbrandname,
      req.body.brandid,
      req.body.brandname
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


export default router