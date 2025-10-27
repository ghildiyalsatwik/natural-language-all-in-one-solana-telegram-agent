import { clearState, getState } from "../utils/redisUtils.js";
import dotenv from "dotenv";
dotenv.config();

//console.log((await getState(1297531770)));

await clearState(1297531770);

// const state = await getState(1297531770);

// console.log(state);

// async function getUserIntentSessionLLM(userMessage, userId) {

//     const systemPrompt = process.env.SYSTEM_PROMPT_SESSION;

//     const state = await getState(userId);

//     console.log(state);

//     const prompt = `
                
//             You are an intent classifier for a Solana trading Telegram bot.

//             Current command being confirmed: "${state.current_intent}"

//             ${systemPrompt}
//     `;

//     const response = await fetch(process.env.INFERENCE_URL, {
        
//         method: "POST",
        
//         headers: { "Content-Type": "application/json" },
        
//         body: JSON.stringify({
          
//             model: process.env.MODEL,
          
//             prompt: `###System:\n${prompt}\n###User:\n${userMessage}`,
          
//             stream: false,
        
//         }),
      
//     });


//     const json = await response.json();
    
//     try {
        
//         const parsed = JSON.parse(json.response.trim());

//         console.log(parsed.intent);
        
//         return parsed.intent;
    
//     } catch (e) {
        
//         console.error("Could not parse intent:", e);
        
//         return "neutral";
//     }
    
// }

// const resp = await getUserIntentSessionLLM('no', 1297531770);

// console.log(resp);