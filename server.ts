import express, {type Application} from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const port: number = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(cors());

app.use(express.json());


app.listen(port, () => {
  console.log(`Shoes on port ${port}`)
})