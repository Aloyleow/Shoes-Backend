import express, {type Request, type Response} from "express";
import { z } from "zod";

const router = express.Router();

const uploadShoesSchema = z.object({
  name: z.string(),
  typeId: z.number(),
  brandId: z.number(),
  sizeId: z.number(),
  colour: z.string().max(30),
  miscellaneous: z.string(),
  costPrice: z.number(),
  imageAWS: z.string(),
});

type UploadShoes = z.infer<typeof uploadShoesSchema>;

export default router