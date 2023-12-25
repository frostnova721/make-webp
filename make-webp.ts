import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import { fromBuffer, fromFile } from 'file-type'
import { tmpdir } from 'os'

const execute = promisify(exec)

const videoToWebp = async(filePath:string, quality?: number, crop?: boolean, author?: string, title?: string) => {
    const tempPath = tmpdir() + '/stickers'
    const outName = tmpdir() + '/stickers/stickerOut.webp'
    const inputFile = filePath
    quality = quality ? quality : 50
    const extractFrameCommand = `ffmpeg -i "${inputFile}" -q:v ${quality} "${tempPath}/s%d.png"`
    await execute(extractFrameCommand)
    const combineFramesCommand = `ffmpeg -s 512x512 -pix_fmt rgb24 -framerate 30 -i "${tempPath}/s%d.png" ${author ? `-metadata author="${author}"` : ''} ${title ? `-metadata title="${title}"` : ''} ${crop ? '-vf "crop=512:512"' : ''} -c:v libwebp -q:v ${quality} -y ${outName}`
    await execute(combineFramesCommand)
    const buffer = fs.readFileSync(outName)
    await execute(`rimraf ${tempPath}`)
    return buffer
}

const imgToWebp = async(filePath: string, quality?: number, crop?: boolean, author?: string, title?: string) => {
    const outName = tmpdir() + '/stickers/stickerOut.webp'
    const inputFile = filePath
    quality = quality ? quality : 50
    //'scale=512:512:force_original_aspect_ratio=decrease'  add this after the input file to stretch the image to 512x512
    const combineFramesCommand = `ffmpeg -s 512x512 -pix_fmt rgb24 -framerate 30 -i ${inputFile} ${author ? `-metadata author="${author}"` : ''} ${title ? `-metadata title="${title}"` : ''} ${crop ? '-vf "crop=512:512"' : ''} -c:v libwebp -q:v ${quality} -y ${outName}`
    await execute(combineFramesCommand)
    const buffer = fs.readFileSync(outName)
    await execute(`rimraf ${tmpdir() + '/stickers'}`)
    return buffer
}

/**
 * 
 * @param { string } filePath Path of the file to be converted to webp (required)
 * @param { number } quality quality of the webp image (0-100) defaults to 50 (optional)
 * @param { boolean } crop wether to crop the webp to 512x512 or not defaults to false (optional)
 * @param { string } author author (optional)
 * @param { string } title title of the webp image (optional)
 * @returns { Buffer } webp buffer
 */
export async function makeStickerFromFile(filePath: string, quality?: number, crop?: boolean, author?: string, title?: string): Promise<Buffer> {
    if(!fs.existsSync(`${tmpdir()}/stickers`)) fs.mkdirSync(`${tmpdir()}/stickers`)
    const path = filePath
    const mime = (await fromFile(path))?.mime ?? 'unknown/unknown'
    const isVideo = mime.split('/')[0] === 'video' ? true : false
    if(isVideo) {
        return await videoToWebp(filePath, quality, crop, author, title)
    } else {
        return await imgToWebp(filePath, quality, crop, author, title)
    }
}

/**
 * 
 * @param { Buffer } buffer Buffer from which the webp is to be made 
 * @param { number } quality quality of the webp image (0-100) defaults to 50
 * @param { boolean } crop wether to crop the webp to 512x512 or not defaults to false
 * @param { string } author author (optional)
 * @param { string } title title of the webp image (optional)
 * @returns { Buffer } webp buffer
 */
export async function makeStickerFromBuffer(buffer: Buffer, quality?: number, crop?: boolean, author?: string, title?: string): Promise<Buffer> {
    if(!fs.existsSync(`${tmpdir()}/stickers`)) fs.mkdirSync(`${tmpdir()}/stickers`)
    const path = tmpdir() + `/stickers/input.${(await fromBuffer(buffer))?.ext}`
    fs.writeFileSync(`${path}`, buffer)
    const mime = (await fromFile(path))?.mime ?? 'unknown/unknown'
    const isVideo = mime.split('/')[0] === 'video' ? true : false
    if(isVideo) {
        return await videoToWebp(path, quality, crop, author, title)
    } else {
        return await imgToWebp(path, quality, crop, author, title)
    }
}
