# make-webp
 Create webp image with less loss of quality and lower size than normal conversions with lower artifacts with the help of FFMPEG

## Dependencies
- This code needs FFMPEG installed on your system with libwebp library to run

## Usage
Basic usage is as follows:
```
import { makeWebpFromFile, makeWebpFromFile } from 'make-webp'

//returns the buffer of the webp
//input can be video or image

//conversion with a video/image file
const webp = await makeWebpFromFile('path_to_file')

//conversion with a buffer
const webp = await makeWebpFromBuffer(buffer)
```

## Contributions
- Any modification or changes to the code are welcome!

## Credits
- Code written with ❤️ in TypeScript by FrostNova

