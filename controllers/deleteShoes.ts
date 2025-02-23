import express, { type Request, type Response } from "express";
import { z } from "zod"

const router = express.Router();

const nukeShoeSchema = z.object({
  shoesid: z.number()
});

type NukeShoe = z.infer<typeof nukeShoeSchema> 

router.delete("/display/shoe", async (req: Request<{}, {}, NukeShoe>, res: Response<{ error: string }>) => {

  const nukeDetails = `
  DELETE 
  FROM shoes
  WHERE shoesid = $1 
  `;
  
  
})