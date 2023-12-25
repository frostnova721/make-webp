const webp = require('./dist/make-webp')
const fs = require('fs')

const imgPath = './assets/img.png'
const vidPath = './assets/vid.webm'

const fn = async() => {
    const vidWebpFromFile = await webp.makeStickerFromFile(vidPath, 80, false, 'sticker auth', 'sticker title') //returns a buffer of the webp
    const imgWebpFromBuffer = await webp.makeStickerFromBuffer(fs.readFileSync(imgPath), 80, false, 'sticker auth', 'sticker title') //same stuff

    fs.writeFileSync('./out/vid.webp', vidWebpFromFile)
    fs.writeFileSync('./out/img.webp', imgWebpFromBuffer)
} 

fn()