import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import { fromBuffer, fromFile } from 'file-type'
import { tmpdir } from 'os'

const execute = promisify(exec)

const videoToWebp = async(filePath:string, quality?: number, crop?: boolean) => {
    const tempPath = tmpdir() + '/stickers'
    const outName = tmpdir() + '/stickers/stickerOut.webp'
    const inputFile = filePath
    quality = quality ? quality : 50
    const extractFrameCommand = `ffmpeg -i "${inputFile}" -q:v ${quality} "${tempPath}/s%d.png"`
    await execute(extractFrameCommand)
    const combineFramesCommand = `ffmpeg -s 512x512 -pix_fmt rgb24 -framerate 30 -i "${tempPath}/s%d.png" ${crop ? '-vf "crop=512:512"' : ''} -c:v libwebp -q:v ${quality} -y ${outName}`
    await execute(combineFramesCommand)
    const buffer = fs.readFileSync(outName)
    await execute(`rimraf ${tempPath}`)
    return buffer
}

const imgToWebp = async(filePath: string, quality?: number, crop?: boolean, resize?: boolean) => {
    const outName = tmpdir() + '/stickers/stickerOut.webp'
    const inputFile = filePath
    quality = quality ? quality : 50
    const combineFramesCommand = `ffmpeg -s 512x512 -pix_fmt rgb24 -framerate 30 -i ${inputFile} ${crop ? '-vf "crop=512:512"' : ''} ${resize ? 'scale=512:512:force_original_aspect_ratio=decrease' : ''} -c:v libwebp -q:v ${quality} -y ${outName}`
    await execute(combineFramesCommand)
    const buffer = fs.readFileSync(outName)
    await execute(`rimraf ${tmpdir() + '/stickers'}`)
    return buffer
}

export async function makeStickerFromFile(filePath: string, quality?: number, crop?: boolean) {
    if(!fs.existsSync(`${tmpdir()}/stickers`)) fs.mkdirSync(`${tmpdir()}/stickers`)
    const path = filePath
    const mime = (await fromFile(path))?.mime ?? 'unknown/unknown'
    const isVideo = mime.split('/')[0] === 'video' ? true : false
    if(isVideo) {
        return await videoToWebp(filePath, quality, crop)
    } else {
        return await imgToWebp(filePath, quality, crop)
    }
}

export async function makeStickerFromBuffer(buffer: Buffer, quality?: number, crop?: boolean) {
    if(!fs.existsSync(`${tmpdir()}/stickers`)) fs.mkdirSync(`${tmpdir()}/stickers`)
    const path = tmpdir() + `/stickers/input.${(await fromBuffer(buffer))?.ext}`
    fs.writeFileSync(`${path}`, buffer)
    const mime = (await fromFile(path))?.mime ?? 'unknown/unknown'
    const isVideo = mime.split('/')[0] === 'video' ? true : false
    if(isVideo) {
        return await videoToWebp(path, quality, crop)
    } else {
        return await imgToWebp(path, quality, crop)
    }
}