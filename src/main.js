import {Telegraf, session} from 'telegraf'
import {message} from 'telegraf/filters'
import {code} from 'telegraf/format'
import config from 'config'
import process from "nodemon";
import {ogg} from './ogg.js'
import {openai} from './openai.js'

console.log({ENV_NAME: config.get('ENV_NAME')})

const INITIAL_SESSION = {
    messages: []
}

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

const messVoice = {
    "duration": 1,
    "mime_type": "audio/ogg",
    "file_id": "AwACAgIAAxkBAAMfZYYDYPaN0JvVRnGMz4DGFknh-FUAAt1DAAIe_DBIdYNG-lymsgABMwQ",
    "file_unique_id": "AgAD3UMAAh78MEg",
    "file_size": 5116
}
bot.use(session())
bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION;
    await ctx.reply(code('Начало новой беседы. Жду сообщения'))
})


bot.command('start', async (ctx) => {
    ctx.session = INITIAL_SESSION;
    await ctx.reply(code('Начало новой беседы. Жду сообщения'))
    await ctx.reply(JSON.stringify(ctx.message, null, 2))
})


bot.on(message('voice'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('Сообщение принял. Жду ответ от сервера...'))
        //await ctx.reply(JSON.stringify(ctx.message.voice, null, 2))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id) // messVoice.file_id  "AwACAgIAAxkBAAMfZYYDYPaN0JvVRnGMz4DGFknh-FUAAt1DAAIe_DBIdYNG-lymsgABMwQ"
        const userId = String(ctx.message.from.id)
        console.log(link)

        const href = link.href

        const oggPath = await ogg.create(href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)

        const text = await openai.transcription(mp3Path)

        await ctx.reply(code(`Ваш запрос: ${text}`))

        ctx.session.messages.push({
            role: openai.roles.USER,
            content: text
        })

        const response = await openai.chat(ctx.session.messages)

        console.log({mes: response.message})
        ctx.session.messages.push(response.message)


        await ctx.reply(response.message.content)
        //await ctx.reply(JSON.stringify(link))
    } catch (e) {
        console.log(`Error while voice message:`, e)
    }
})

bot.on(message('text'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try {
        await ctx.reply(code('Сообщение принял. Жду ответ от сервера...'))

        ctx.session.messages.push({role: openai.roles.USER, content: ctx.message.text})

        const response = await openai.chat(ctx.session.messages)

        ctx.session.messages.push(response.message)

        await ctx.reply(response.message.content)
    } catch (e) {
        console.log(`Error while voice message:`, e)
    }
})


bot.command('echo', async (ctx) => {
    await ctx.reply(JSON.stringify(ctx.message.text.replace("\/echo", ""), null, 2))
})
bot.command('ping', async (ctx) => {
    await ctx.reply("pong")
})


bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))


const mes = {
    "message_id": 2,
    "from": {
        "id": 377799118,
        "is_bot": false,
        "first_name": "evgeniy",
        "username": "evgeniym",
        "language_code": "ru"
    },
    "chat": {
        "id": 377799118,
        "first_name": "evgeniy",
        "username": "evgeniym",
        "type": "private"
    },
    "date": 1702846929,
    "text": "/start",        //Text from user
    "entities": [
        {
            "offset": 0,
            "length": 6,
            "type": "bot_command"
        }
    ]
}

/**
 Done! Congratulations on your new bot. You will find it at t.me/make_voice_bot. You can now add a description, about section and profile picture for your bot, see /help for a list of commands. By the way, when you've finished creating your cool bot, ping our Bot Support if you want a better username for it. Just make sure the bot is fully operational before you do this.

 Use this token to access the HTTP API:
 6822810599:AAHMSVamfIrzANLBOAVCmfWn3smqzUB1zq8
 Keep your token secure and store it safely, it can be used by anyone to control your bot.

 For a description of the Bot API, see this page: https://core.telegram.org/bots/api
 */
