import dotenv from "dotenv";
dotenv.config();
import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({ 
    
    url: process.env.QDRANT_DB_URL,
    
    apiKey: process.env.QDRANT_DB_API_KEY
});