import OpenAI from "openai";
import config from 'config'
import {createReadStream} from 'fs'

const params = {
    apiKey: config.get('OPENAI_API_KEY'),
}


class OAI {
    roles = {
        ASSISTANT: "assistant",
        SYSTEM: "system",
        USER: "user"
    }
    openai

    constructor(params) {
        this.openai = new OpenAI(params);
    }

    async chat(messages) {
        try {
            const mes = {
                messages,
                model: "gpt-3.5-turbo",
            }
            const completion = await this.openai.chat.completions.create(mes)

            const mmm = completion.choices[0]

            console.log("Chat answer:", {message:mmm.message, completion });

            return mmm


        } catch (e) {
            console.log(`Error while send to chat:`, e)
        }
    }

    async chatTest2(text) {
        const completion = await openai.chat.completions.create({
            messages: [{"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Who won the world series in 2020?"},
                {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
                {"role": "user", "content": "Where was it played?"}],
            model: "gpt-3.5-turbo",
        });

        console.log(completion.choices[0]);

    }

    chatTest(text) {
        const mes = {
            messages: [{
                role: "user",
                content: text
            }
            ],
            model: "gpt-3.5-turbo",
        }
        this.openai.chat.completions.create(mes)
    }

    async transcription(filePath) {
        const dt = {
            file: '',
            model: 'whisper-1',
            language: 'en', // ISO-639-1
            prompt: '',  //  https://platform.openai.com/docs/guides/speech-to-text/prompting
            response_format: ''  // json, text, srt, verbose_json, or vtt.

        }
        try {
            const response = await this.openai.audio.transcriptions.create({
                model: 'whisper-1',
                file: createReadStream(filePath),
                // language: 'en'
            });
            return response ? response.text : 'Mock';

        } catch (e) {
            console.log(`Error while transcription mp3 file:`, e)
        }
    }
}

export const openai = new OAI(params)