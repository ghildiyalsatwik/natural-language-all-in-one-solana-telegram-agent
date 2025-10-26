import express from "express";
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import fetch from "node-fetch";
import { startHandler } from "./handlers/startHandler.js";
import { getClosestCommandContext } from "./utils/getClosestCommandContext.js";
import { handleDefaultOrError } from "./handlers/handleDefaultOrError.js";
import { createWallet } from "./handlers/createWallet.js";

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

    const context = await getClosestCommandContext(userMessage);

    if(!context) {

        const reply = handleDefaultOrError(userId);

        await axios.post(BOT_URL, { chat_id: chatId, text: reply });

        return res.sendStatus(200);

    }

    const scoreThreshold = 0.5;

    if(context.score < scoreThreshold) {

        const reply = handleDefaultOrError(userId);

        await axios.post(BOT_URL, { chat_id: chatId, text: reply });

        return res.sendStatus(200);

    }

    if(context.command_name === "create_wallet") {

        const reply = await createWallet(userId);

        await axios.post(BOT_URL, { chat_id: chatId, text: reply });

        return res.sendStatus(200);

    }

});