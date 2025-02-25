import express, {type Application} from "express";
import { types } from "pg";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import uploadShoes from "./controllers/uploadShoes"
import shoeTypes from "./controllers/shoeTypes"
import shoeBrands from "./controllers/shoeBrands"
import shoeSize from "./controllers/shoeSizes"
import displayShoes from "./controllers/displayShoes"
import deleteShoes from "./controllers/deleteShoes"
import editShoes from "./controllers/editShoes"

types.setTypeParser(1700, (val) => {
  return parseFloat(val);
});
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(cors());

app.use(express.json());

app.use("/api", 
  uploadShoes,
  shoeTypes,
  shoeBrands,
  shoeSize,
  displayShoes,
  deleteShoes,
  editShoes
)

app.listen(port, () => {
  console.log(`Shoes on port ${port}`)
})