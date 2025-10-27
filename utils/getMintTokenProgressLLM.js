import fetch from "node-fetch";
import { getState } from "./redisUtils.js";
import dotenv from "dotenv";
dotenv.config();

export async function getMintTokenProgressLLM(userMessage, userId) {
  
    const state = await getState(userId);
  
    const collected = state?.collected || {
    
        name: "",
    
        symbol: "",
    
        decimals: "",
    
        initial_amount: "",
  
    };

  const prompt = `
        
    You are helping the user complete the "mint_token" command.

    Current collected fields:
    
    ${JSON.stringify(collected, null, 2)}

    ${process.env.MINT_TOKEN_PROMPT}`;
  
    const resp = await fetch(process.env.INFERENCE_URL, {
    
        method: "POST",
    
        headers: { "Content-Type": "application/json" },
    
        body: JSON.stringify({
      
            model: process.env.MODEL,
      
            prompt: `###System:\n${prompt}\n###User:\n${userMessage}`,
      
            stream: false,
    
        }),
  
    });
  
    const json = await resp.json();
  
    try {
    
        return JSON.parse(json.response.trim());
  
    } catch (e) {
    
        console.error("Could not parse mint_token LLM response:", e);
    
        return { command: "none" };
  
    }
}