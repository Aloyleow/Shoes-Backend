import express, { type Request, type Response } from "express";
import { z } from "zod";
import pool from "../services/pool";

const router = express.Router();

const shoeTypeSchema = z.object({
  typename: z.string().max(30)
});

type ShoeType = z.infer<typeof shoeTypeSchema>

router.post("/shoetype", async(req: Request<{}, {}, ShoeType>, res: Response<"Success" | { error: string }>) => {

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

      res.status(400).json({ error: error.message });

    } else {

      res.status(500).json({ error: "Internal server error" });

    }
    
  }


})

const eidtShoeTypeSchema = z.object({
  newtypename: z.string().max(30),
  typeid: z.number(),
  typename: z.string().max(30),
});

type EditShoeType = z.infer<typeof eidtShoeTypeSchema>

router.put("/shoetype", async(req: Request<{}, {}, EditShoeType>, res: Response<"Success" | { error: string }>) => {

  const dataUpload = `
  UPDATE shoetypes
  SET typename = $1
  WHERE typeid = $2 AND typename = $3
  `
  const queryType = `
  SELECT *
  FROM shoetypes
  WHERE typename = $1
  `

  try {

    const validateReqBody = eidtShoeTypeSchema.safeParse(req.body);
    if (!validateReqBody.success) {
      const validateError = validateReqBody.error.issues.map(item => `${item.path}: ${item.message}`);
      throw new Error(`Validation type failed ${validateError}`);
    }

    const checkType = await pool.query(queryType, [req.body.newtypename]);
    if (checkType.rowCount !== 0) {
      throw new Error("Shoe type already exist.");
    }

    const dataInput = [
      req.body.newtypename,
      req.body.typeid,
      req.body.typename
    ]

    const upload = await pool.query(dataUpload, dataInput);
    if (!upload) {
      throw new Error("PG Database Error.");
    }

    res.status(200).json("Success")

    
  } catch (error: unknown) {

    if (error instanceof Error) {

      res.status(400).json({ error: error.message });

    } else {

      res.status(500).json({ error: "Internal server error" });

    }
    
  }


})

const displayShoeTypeSchema = z.array(z.object({
  typeid: z.number(),
  typename: z.string().max(30),
}))

type DisplayShoeType = z.infer<typeof displayShoeTypeSchema>

router.get("/shoetype", async(req: Request, res: Response<DisplayShoeType | {error: string}>) => {

  const queryData = `
  SELECT * 
  FROM shoetypes
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