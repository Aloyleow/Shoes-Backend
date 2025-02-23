import { Pool } from "pg"

const pool = new Pool ({
  connectionString: process.env.PGSTRING_URI
});

export default pool