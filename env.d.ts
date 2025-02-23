declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: number;
    PGSTRING_URI?: string;
    BUCKET_NAME?: any;
    BUCKET_REG?: any;
    ACCESS_K?: any;
    S_ACCESS_K?: any;
  }
}