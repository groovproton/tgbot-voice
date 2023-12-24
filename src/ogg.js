import axios from "axios";
import ffmpeg from 'fluent-ffmpeg'
import installer from '@ffmpeg-installer/ffmpeg'

import {createWriteStream} from "fs"
import {dirname, resolve} from 'path'
import {fileURLToPath} from 'url'
import {removeFile} from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
    constructor() {
        const ffPath = '/usr/bin/ffmpeg'; //ffmpeg.setFfmpegPath(installer.path)
        ffmpeg.setFfmpegPath(ffPath)
        console.log("OggConverter constructor: ", ffPath, ffmpeg.path, ffmpeg.version);
    }

    toMp3(inputFile, outputFile) {
        try {
            const outputPath = resolve(dirname(inputFile), `${outputFile}.mp3`)
            console.log("Out file: " + outputPath)
            return new Promise((resolve, reject) => {
                ffmpeg(inputFile)
                    .inputOption('-t 30')
                    .output(outputPath)
                    .on('end', () => {
                        removeFile(inputFile)
                        resolve(outputPath)
                    })
                    .on('error', (e) => reject(e.message))
                    .run()
            })
        } catch (e) {
            console.log('Error while creating MP3', e.message)
        }
    }

    async create(url, filename) {
        try {
            const oggPath = resolve(__dirname, '../voices', `${filename}.ogg`)
            const response = await axios({
                method: 'get',
                url,
                responseType: 'stream',
            })
            return new Promise((resolve, reject) => {
                const stream = createWriteStream(oggPath)
                response.data.pipe(stream)
                stream.on('finish', () => resolve(oggPath))

            })

        } catch (e) {
            console.log('Error while creating ogg', e.message)
        }
    }
}

export const ogg = new OggConverter()