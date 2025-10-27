import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const qdrant = new QdrantClient({ 
    
    url: process.env.QDRANT_DB_URL,
    
    apiKey: process.env.QDRANT_DB_API_KEY
});
  
const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });

const collectionName = "commands";

const collections = await qdrant.getCollections();

const exists = collections.collections.some(c => c.name === collectionName);

if(!exists) {

    await qdrant.createCollection(collectionName, {

        vectors: {

            default: {

                size: 1536,

                distance: "Cosine"

            }
        }
    
    });

    console.log(`Created collection: ${collectionName}`);

} else {

    console.log(`Collection: ${collectionName} already exists!`);
}

async function testEmbedding() {

    const text = process.env.CREATE_WALLET_PROMPT;

    const embeddingResp = await openai.embeddings.create({

        model: "text-embedding-3-small",
        
        input: text
    
    });

    console.log(embeddingResp);

    const vector = embeddingResp.data[0].embedding;

    console.log(vector);
}

async function deleteCollection() {

    await qdrant.deleteCollection(collectionName);

    console.log(`Collection: ${collectionName} has been deleted!`);
}

async function seedCreateWalletCommand() {

    const text = process.env.CREATE_WALLET_PROMPT;

    const embeddingResp = await openai.embeddings.create({

        model: "text-embedding-3-small",
        
        input: text
    
    });

    const vector = embeddingResp.data[0].embedding;

    await qdrant.upsert(collectionName, {

        points: [

            {

                id: 1,

                vector: { default: vector },

                payload: {

                    command_id: 1,

                    command_name: "create_wallet",

                    schema: { command: "create_wallet" },
                    
                    embedding_text: text
                }
            }
        ]

    });

    console.log("Seeded wallet creation command into Qdrant DB.");

};

async function testRetrieval() {

    const queryText = "create a Solana wallet for me.";

    const embeddingResp = await openai.embeddings.create({

        model: "text-embedding-3-small",
        
        input: queryText
    
    });

    const queryVector = embeddingResp.data[0].embedding;

    const searchResults = await qdrant.search(collectionName, {

        vector: { name: "default", vector: queryVector },

        limit: 1
    
    });

    console.log("Top match:", searchResults[0].payload);
    
    console.log("Similarity score:", searchResults[0].score);
}

async function seedRetrievePrivateKey() {

    const text = process.env.EJECT_PROMPT;

    const embeddingResp = await openai.embeddings.create({

        model: "text-embedding-3-small",
        
        input: text
    
    });

    const vector = embeddingResp.data[0].embedding;

    await qdrant.upsert(collectionName, {

        points: [

            {

                id: 2,

                vector: { default: vector },

                payload: {

                    command_id: 2,

                    command_name: "eject",

                    schema: { command: "eject" },
                    
                    embedding_text: text
                }
            }
        ]

    });

    console.log("Seeded retrieve private key command into Qdrant DB.");

};

//await seedCreateWalletCommand().catch(console.error);

// await testEmbedding();

// await deleteCollection();

// await testRetrieval();

// await seedRetrievePrivateKey();