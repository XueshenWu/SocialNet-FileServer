


export type FileMIMEType = "application/json" |
    "application/octet-stream" |
    "application/xml" |
    "text/plain" |
    "text/html" |
    "video/mp4" |
    "image/jpeg" |
    "image/png" |
    "image/gif" |
    "image/webp"


const FileMIMETypeMap = {
    '':0,
    "application/json": 1,
    "application/octet-stream": 2,
    "application/xml": 3,
    "text/plain": 4,
    "text/html": 5,
    "video/mp4": 6,
    "image/jpeg": 7,
    "image/png": 8,
    "image/gif": 9,
    "image/webp": 10
}

const InverseFileMIMETypeMap = [
    '',
    "application/json",
    "application/octet-stream",
    "application/xml",
    "text/plain",
    "text/html",
    "video/mp4",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"

]



function attachMIMEType(data: Uint8Array, contentType: FileMIMEType): Uint8Array {

    console.log("attachMIMEType", contentType, FileMIMETypeMap[contentType])

    const mimeType:number = FileMIMETypeMap[contentType];
    const mimeTypeArray = new Uint8Array([mimeType] );
    if (mimeTypeArray.length !== 1) {
        throw new Error("Invalid MIME type");
    }
    return new Uint8Array([...mimeTypeArray, ...data]);
}

function extractMIMEType(data: Uint8Array): [FileMIMEType, Uint8Array] {
    console.log("extractMIMEType", data[0], InverseFileMIMETypeMap[data[0] as number])
    const mimeType = InverseFileMIMETypeMap[data[0] as number];
    if (!mimeType) {
        throw new Error(`Invalid MIME type: ${data[0]}`);
    }
    return [mimeType as FileMIMEType, data.slice(1)];
}

export { attachMIMEType, extractMIMEType }
