import express, { type Request, type Response } from "express";
import { z } from "zod";
import pool from "../services/pool";

const router = express.Router();

const shoeTypeSchema = z.object({
  typename: z.string().max(30)
});

type ShoeType = z.infer<typeof shoeTypeSchema>

router.post("/shoetype", async(req: Request<{}, {}, ShoeType>, res: Response) => {

  const dataUpload = `
  INSERT INTO shoetypes (typename)
  VALUES ($1)
  `
  const queryType = `
  SELECT typename
  FROM shoetypes
  WHERE typename = $1
  `

  try {

    const validateReqBody = shoeTypeSchema.safeParse(req.body);
    if (!validateReqBody.success) {
      const validateError = validateReqBody.error.issues.map(item => `${item.path}: ${item.message}`);
      throw new Error(`Validation type failed ${validateError}`);
    }

    const checkType = await pool.query(queryType, [req.body.typename]);
    if (checkType.rowCount !== 0) {
      throw new Error("Shoe type already exist.");
    }

    const upload = await pool.query(dataUpload, [req.body.typename]);
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