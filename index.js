const { Telegraf } = require("telegraf");
const axios = require("axios");
require("dotenv").config();
const bot = new Telegraf(process.env.BOT_TOKEN);

let count = 1;

bot.start((ctx) => {
  ctx.reply(
    "Hi there! Welcome to the qr code genie bot! Send me any message or link I will return you a qr code of that message or link or send me a qr code I will return you the data of that qr code."
  );
  ctx.reply("/help - to get help");
  ctx.reply("/clear - to clear the chat history");
});

bot.command("hello", (ctx) => ctx.reply("Hello! ❤️"));

//to clear the chat history
bot.command("clear", async (ctx) => {
  ctx.reply("Cleared the chat history!");
  const chatId = ctx.message.chat.id;
  const messageId = ctx.message.message_id;
  for (let i = messageId; i > 0; i--) {
    try {
      await ctx.telegram.deleteMessage(chatId, i);
    } catch (error) {
      break;
      console.error(`Error deleting message with ID ${i}:`, error.description);
    }
  }
});

//help command
bot.command("help", (ctx) => {
  ctx.reply(
    "Send me any message or link I will return you a qr code of that message or link or send me a qr code I will return you the data of that qr code."
  );
  ctx.reply("/clear - to clear the chat history");
});

// to convert data to qr code
bot.on("text", (ctx) => {
  ctx.reply("Wait a moment, I am generating the QR code...");
  ctx.replyWithPhoto({
    url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ctx.message.text}`,
  });
});

// to convert qr code to data
bot.on("photo", async (ctx) => {
  ctx.reply("Wait a moment, I am processing the QR code...");
  const photo = ctx.message.photo[0];
  const photoFile = await ctx.telegram.getFile(photo.file_id);
  const photoUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${photoFile.file_path}`;

  const response = await axios.get(
    `https://api.qrserver.com/v1/read-qr-code/?fileurl=${photoUrl}`
  );

  if (response.data[0].symbol[0].error === null) {
    await ctx.reply("The QR code contains the following data:");
    ctx.reply(response.data[0].symbol[0].data);
  } else {
    ctx.reply("Make sure you are sending a valid QR code image.");
  }
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
bot.launch(); // starting the bot
