"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMIMEType = exports.attachMIMEType = void 0;
const FileMIMETypeMap = {
    '': 0,
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
};
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
];
function attachMIMEType(data, contentType) {
    console.log("attachMIMEType", contentType, FileMIMETypeMap[contentType]);
    const mimeType = FileMIMETypeMap[contentType];
    const mimeTypeArray = new Uint8Array([mimeType]);
    if (mimeTypeArray.length !== 1) {
        throw new Error("Invalid MIME type");
    }
    return new Uint8Array([...mimeTypeArray, ...data]);
}
exports.attachMIMEType = attachMIMEType;
function extractMIMEType(data) {
    console.log("extractMIMEType", data[0], InverseFileMIMETypeMap[data[0]]);
    const mimeType = InverseFileMIMETypeMap[data[0]];
    if (!mimeType) {
        throw new Error(`Invalid MIME type: ${data[0]}`);
    }
    return [mimeType, data.slice(1)];
}
exports.extractMIMEType = extractMIMEType;
