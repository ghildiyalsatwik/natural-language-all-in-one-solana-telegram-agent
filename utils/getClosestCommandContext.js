import dotenv from "dotenv";
dotenv.config();
import { openai } from "./getOpenAI.js";
import { qdrant } from "./getQdrantDB.js";

export async function getClosestCommandContext(userMessage) {

    const embeddingResp = await openai.embeddings.create({

        model: "text-embedding-3-small",
        
        input: userMessage
    
    });

    const queryVector = embeddingResp.data[0].embedding;

    const searchResults = await qdrant.search(process.env.COLLECTION_NAME, {
        
        vector: {
          
            name: "default",
          
          vector: queryVector,
        
        },
        
        limit: 1,
    
    });

    if (!searchResults.length) return null;

    const top = searchResults[0];
    
    return {
        
        command_name: top.payload.command_name,
        
        command_text: top.payload.embedding_text,
        
        score: top.score,
    };

}