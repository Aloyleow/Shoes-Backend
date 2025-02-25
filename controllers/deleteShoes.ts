import express, { type Request, type Response } from "express";
import { z } from "zod"
import pool from "../services/pool";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../services/aws-s3";

const router = express.Router();

const nukeShoeSchema = z.object({
  shoesid: z.number()
});

type NukeShoe = z.infer<typeof nukeShoeSchema> 

router.delete("/display/shoe", async (req: Request<{}, {}, NukeShoe>, res: Response<"Success" | { error: string }>) => {

  const nukeQuery = `
  DELETE 
  FROM shoes
  WHERE shoesid = $1 
  `;

  const queryShoe = `
  SELECT shoesid, picture
  FROM shoes
  WHERE shoesid = $1
  `

  try {

    const validateReqBody = nukeShoeSchema.safeParse(req.body);
    if (!validateReqBody.success) {
      const validateError = validateReqBody.error.issues.map(item => `${item.path}: ${item.message}`);
      throw new Error(`Validation type failed ${validateError}`);
    }

    const checkShoe = await pool.query(queryShoe, [req.body.shoesid])
    if (!checkShoe) {
      throw new Error("PG Database Error.")
    }
    if (checkShoe.rowCount !==1){
      throw new Error("No one Entry found")
    }

    if (checkShoe.rows[0].picture) {
      
      const pictureParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${checkShoe.rows[0].shoesid}`
      }
      
      const command = new DeleteObjectCommand(pictureParams);
      const deleteimage = await s3.send(command);
      if (!deleteimage) {
        throw new Error("AWS Database Error");
      }

    }

    const nukeShoe = await pool.query(nukeQuery, [req.body.shoesid])
    if(!nukeShoe) {
      throw new Error("PG Database Error")
    }

    res.status(201).json("Success");
    
  } catch (error: unknown){

    if (error instanceof Error) {

      res.status(400).json({ error: error.message });

    } else {

      res.status(500).json({ error: "Internal server error" });

    }

  }
})

export default router