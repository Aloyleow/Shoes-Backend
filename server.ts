import express, {type Application} from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import uploadShoes from "./controllers/uploadShoes"
import shoeTypes from "./controllers/shoeTypes"
import shoeBrands from "./controllers/shoeBrands"
import shoeSize from "./controllers/shoeSizes"
import displayShoes from "./controllers/displayShoes"

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
  displayShoes
)

app.listen(port, () => {
  console.log(`Shoes on port ${port}`)
})