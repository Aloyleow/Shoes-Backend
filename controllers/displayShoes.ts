import express, { type Request, type Response } from "express";
import { z } from "zod";
import pool from "../services/pool";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../services/aws-s3";

const router = express.Router();

const displayShoesSchema = z.array(z.object({
  shoesid: z.number(),
  name: z.string(),
  type: z.string().max(30),
  brand: z.string().max(30),
  country: z.enum(['US', 'UK', 'EURO']),
  number: z.number(),
  colour: z.string().max(30),
  miscellaneous: z.string(),
  costprice: z.number(),
  picture: z.any(),
}));

type DisplayShoesData = z.infer<typeof displayShoesSchema>

router.get("/display", async (req: Request, res: Response<DisplayShoesData | { error: string }>) => {

  const queryData = `
  SELECT 
    s.shoesid, 
    s.name,
    st.typename AS type,
    b.brandname AS brand,
    sz.sizecountry AS country, 
    sz.sizenumber AS number, 
    s.colour, 
    s.miscellaneous,
    s.costprice, 
    s.picture
  FROM shoes s
  JOIN shoetypes st ON s.typeid = st.typeid
  JOIN brands b ON s.brandid = b.brandid
  JOIN sizes sz ON s.sizeid = sz.sizeid
  `;

  try {

    const checkData = await pool.query(queryData);
    if (!checkData) {
      throw new Error("PG Database Error.");
    }

    const gatheredData: DisplayShoesData = checkData.rows;

    for (const item of gatheredData) {

      if (item.picture){
        
        const pictureParams = {
          Bucket: process.env.BUCKET_NAME,
          Key: `${item.shoesid}`
        }

        const command = new GetObjectCommand(pictureParams)
        const url = await getSignedUrl(s3, command, {expiresIn: 3600});
        if (!checkData) {
          throw new Error("AWS Database Error.");
        }

        item.picture = url

      } else {

        item.picture = "none"

      }
    }

    res.status(200).json(gatheredData)
    
  } catch (error: unknown){

    if (error instanceof Error) {

      res.status(400).json({ error: error.message });

    } else {

      res.status(500).json({ error: "Internal server error" });

    }

  }
})

export default router