import express, { type Request, type Response } from "express";
import { z } from "zod";
import pool from "../services/pool";

const router = express.Router();

const editShoeSchema = z.object({
  name: z.string(),
  colour: z.string().max(30),
  miscellaneous: z.string(),
  shoesid: z.number()
});

type EditShoe = z.infer<typeof editShoeSchema>;

router.put("/display/shoe", async (req: Request<{}, {}, EditShoe>, res: Response<"Success" | { error: string }>) => {

  const dataUpload = `
  UPDATE shoes
  SET name = $1, colour = $2 ,miscellaneous = $3
  WHERE shoesid = $4
  `

  const queryShoes = `
  SELECT *
  FROM shoes
  WHERE shoesid = $1
  `

  try {

    const validateReqBody = editShoeSchema.safeParse(req.body);
    if (!validateReqBody.success) {
      const validateError = validateReqBody.error.issues.map(item => `${item.path}: ${item.message}`);
      throw new Error(`Validation type failed ${validateError}`);
    }

    const checkShoe = await pool.query(queryShoes, [req.body.shoesid]);
    if (checkShoe.rowCount !== 1) {
      throw new Error("Shoe not in Data.");
    }

    const dataInput = [
      req.body.name,
      req.body.colour,
      req.body.miscellaneous,
      req.body.shoesid
    ]

    const upload = await pool.query(dataUpload, dataInput);
    if (!upload) {
      throw new Error("PG Database Error.");
    }

    res.status(201).json("Success");


  } catch (error: unknown) {

    if (error instanceof Error) {

      res.status(400).json({ error: error.message });

    } else {

      res.status(500).json({ error: "Internal server error" });

    }

  }
})

export default router