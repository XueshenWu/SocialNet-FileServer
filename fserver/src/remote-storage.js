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
exports.RemoteStorage = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const local_cache_1 = __importDefault(require("./local-cache"));
const lib_storage_1 = require("@aws-sdk/lib-storage");
const logger_1 = require("./logger");
class RemoteStorage {
    close() {
        this.localCache.close();
        logger_1.logger.info("RemoteStorage closed");
    }
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: "ca-central-1"
        });
        this.localCache = new local_cache_1.default();
        this.localCache.connect();
        logger_1.logger.info("RemoteStorage initialized");
    }
    addObject(bucket, key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const upload = new lib_storage_1.Upload({
                client: this.client,
                params: {
                    Bucket: bucket,
                    Key: key,
                    Body: data,
                },
            });
            try {
                const res = (yield upload.done()).$metadata.httpStatusCode === 200;
                if (res) {
                    this.localCache.set(key, data);
                }
                return res;
            }
            catch (err) {
                console.error(err);
                return false;
            }
        });
    }
    getObject(bucket, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const cached = yield this.localCache.get(key);
            if (cached) {
                logger_1.logger.info(`Cache hit for ${key}`);
                return cached;
            }
            logger_1.logger.info(`Cache miss for ${key}`);
            const command = new client_s3_1.GetObjectCommand({
                Bucket: bucket,
                Key: key
            });
            try {
                const res = yield this.client.send(command);
                const body = res.Body;
                if (body) {
                    const data = yield body.transformToByteArray();
                    this.localCache.set(key, data);
                    return data;
                }
                return undefined;
            }
            catch (err) {
                console.error(err);
                return undefined;
            }
        });
    }
    deleteObject(bucket, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: bucket,
                Key: key
            });
            try {
                const res = (yield this.client.send(command)).$metadata.httpStatusCode === 204;
                if (res) {
                    this.localCache.delete(key);
                }
                return res;
            }
            catch (err) {
                console.error(err);
                return false;
            }
        });
    }
}
exports.RemoteStorage = RemoteStorage;
