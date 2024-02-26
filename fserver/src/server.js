"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const remote_storage_1 = require("./remote-storage");
const mimeutil_1 = require("./mimeutil");
const stream_1 = require("stream");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const logger_1 = require("./logger");
const remoteStorage = new remote_storage_1.RemoteStorage();
app.post("/", (req, res) => {
    res.status(200).end();
});
app.get('/:bucket/:key', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info(`GET ${req.params.bucket}/${req.params.key}`);
    const bucket = req.params.bucket;
    const key = req.params.key;
    const record = yield remoteStorage.getObject(bucket, key);
    if (record) {
        const [contentType, data] = (0, mimeutil_1.extractMIMEType)(record);
        res.setHeader('Content-Type', contentType);
        const stream = new stream_1.Readable();
        stream.push(data);
        stream.push(null);
        stream.pipe(res);
        return;
    }
    else {
        res.status(404).send('Not Found');
    }
}));
app.post('/:bucket/:key', express_1.default.raw({
    type: () => true,
    limit: '10mb'
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info(`POST ${req.params.bucket}/${req.params.key}`);
    const bucket = req.params.bucket;
    const key = req.params.key;
    const data = new Uint8Array(req.body);
    const contentType = req.get('Content-Type') || '';
    const record = (0, mimeutil_1.attachMIMEType)(data, contentType);
    // res.end();
    const result = yield remoteStorage.addObject(bucket, key, record);
    if (result) {
        res.send('OK');
    }
    else {
        res.status(500).send('Error');
    }
}));
app.delete('/:bucket/:key', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.logger.info(`DELETE ${req.params.bucket}/${req.params.key}`);
    const bucket = req.params.bucket;
    const key = req.params.key;
    const result = yield remoteStorage.deleteObject(bucket, key);
    if (result) {
        res.send('OK');
    }
    else {
        res.status(500).send('Error');
    }
}));
const server = app.listen(9876, () => {
    logger_1.logger.info('Server started at http://localhost:9876');
});
server.on('close', () => {
    logger_1.logger.info('Server closed');
    remoteStorage.close();
});
server.on('error', (err) => {
    logger_1.logger.error(err);
    remoteStorage.close();
});
process.on("SIGINT", () => {
    server.close();
});
