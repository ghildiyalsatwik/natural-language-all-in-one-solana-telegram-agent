import { redis } from "./getRedis.js";

export async function setState(userId, state) {
    
    try {
      
        await redis.set(`session:${userId}`, JSON.stringify(state));
      
        console.log(`State saved for user ${userId}:`, state);
    
    } catch (err) {
      
        console.error("Redis setState error:", err);
    }
}


export async function getState(userId) {
    
    try {
      
        const data = await redis.get(`session:${userId}`);
      
        return data ? JSON.parse(data) : null;
    
    } catch (err) {
      
        console.error("Redis getState error:", err);
      
        return null;
    }
}



export async function clearState(userId) {
    
    try {
      
        await redis.del(`session:${userId}`);
      
        console.log(`Cleared state for user ${userId}`);
    
    } catch (err) {
      
        console.error("Redis clearState error:", err);
    
    }
}
