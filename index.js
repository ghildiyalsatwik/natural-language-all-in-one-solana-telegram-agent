import express from "express";
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { startHandler } from "./handlers/startHandler.js";
import { getClosestCommandContext } from "./utils/getClosestCommandContext.js";
import { handleDefaultOrError } from "./handlers/handleDefaultOrError.js";
import { createWallet } from "./handlers/createWallet.js";
import { setState, getState, clearState } from "./utils/redisUtils.js";
import { getUserIntentSessionLLM } from "./utils/getUserIntentSessionLLM.js";
import { handleEject } from "./handlers/handleEject.js";

const app = express();

app.use(express.json());

const PORT = process.env.MAIN_SERVER_PORT;

const BOT_URL = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;

app.listen(PORT, () => {

    console.log(`Main server is running at PORT: ${PORT}`);

});

app.post('/webhook', async (req, res) => {

    const msg = req.body.message;

    const userId = msg.from.id;

    const userMessage = msg.text;

    const chatId = msg.chat.id;

    if(userMessage === '/start') {

        const reply = startHandler(userId);

        await axios.post(BOT_URL, { chat_id: chatId, text: reply });

        return res.sendStatus(200);

    }

    const state = await getState(userId);

    console.log('Session state is:\n', state);

    if(state) {

        const stage = state.stage;

        const intent = await getUserIntentSessionLLM(userMessage, userId);

        if(stage === 'awaiting_confirmation') {

            if(intent === 'affirmative') {

                if(state.current_intent === 'eject') {

                    await clearState(userId);

                    await axios.post(BOT_URL, {
                        
                        chat_id: chatId,
                        
                        text: "Retrieving your private key...",
                    
                    });

                    const reply = await handleEject(userId);

                    await axios.post(BOT_URL, { chat_id: chatId, text: reply });

                    return res.sendStatus(200);

                }
            }


            if(intent === 'negative') {

                await clearState(userId);

                await axios.post(BOT_URL, {
                    
                    chat_id: chatId,
                    
                    text: "Not retrieving your private key.",
                
                });
                  
                return res.sendStatus(200);
            }

            const context = await getClosestCommandContext(userMessage);


            if (context && context.score > 0.4) {
                
                await setState(userId, {
                
                    current_intent: state.current_intent,
                
                    next_intent: context.command_name,
                
                    stage: "awaiting_command_switch",
                
                });
        
                await axios.post(BOT_URL, {
                
                    chat_id: chatId,
                
                    text: `You're currently confirming "${state.current_intent}". Do you want to switch to "${context.command_name}" instead?`
                
                });
        
                return res.sendStatus(200);
            }


            await axios.post(BOT_URL, {
                
                chat_id: chatId,
                
                text: "I didn't catch that — please reply 'yes' or 'no'."
            
            });
            
            return res.sendStatus(200);
            
        }

        if(stage === 'awaiting_command_switch') {

            if(intent === 'affirmative') {

                const nextIntent = state.next_intent;
                
                await clearState(userId);

                await axios.post(BOT_URL, {
                    
                    chat_id: chatId,
                    
                    text: `Switching to "${nextIntent}".`,
                
                });


                if(nextIntent === "create_wallet") {
                    
                    const reply = await createWallet(userId);
                    
                    await axios.post(BOT_URL, { chat_id: chatId, text: reply });

                    return res.sendStatus(200);
                
                }

            }

            if(intent === 'negative') {

                await setState(userId, {
                    
                    current_intent: state.current_intent,
                    
                    stage: "awaiting_confirmation",
                
                });
          
                await axios.post(BOT_URL, {
                    
                    chat_id: chatId,
                    
                    text: `OK, continuing with "${state.current_intent}". Please reply 'yes' or 'no'.`,
                });
                  
                return res.sendStatus(200);

            }

            await axios.post(BOT_URL, {
                
                chat_id: chatId,
                
                text: "I did not catch you, please reply with 'yes' or 'no'.",
            
            });
            
            return res.sendStatus(200);
        }

    }
    
    
    const context = await getClosestCommandContext(userMessage);

    if(!context) {

        const reply = handleDefaultOrError(userId);

        await axios.post(BOT_URL, { chat_id: chatId, text: reply });

        return res.sendStatus(200);

    }

    const scoreThreshold = 0.4;

    if(context.score < scoreThreshold) {

        const reply = handleDefaultOrError(userId);

        await axios.post(BOT_URL, { chat_id: chatId, text: reply });

        return res.sendStatus(200);

    }

    if(context.command_name === "create_wallet") {

        const reply = await createWallet(userId);

        await axios.post(BOT_URL, { chat_id: chatId, text: reply });

        return res.sendStatus(200);

    } else if(context.command_name === 'eject') {

        await setState(userId, {

            current_intent: "eject",

            stage: "awaiting_confirmation"
        
        });

        await axios.post(BOT_URL, { chat_id: chatId, text: 'Are you sure?' });

        return res.sendStatus(200);

    }

    const reply = handleDefaultOrError(userId);
    
    await axios.post(BOT_URL, { chat_id: chatId, text: reply });
  
    return res.sendStatus(200);

});