"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis = __importStar(require("redis"));
const logger_1 = require("./logger");
class LocalCache {
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.redisClient.quit();
            logger_1.logger.info("LocalCache closed");
        });
    }
    connect() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.redisClient.on("error", function (error) {
                console.error(error);
            });
            yield this.redisClient.connect();
            yield this.redisClient.configSet("maxmemory", (_a = process.env.REDIS_MAX_MEMORY) !== null && _a !== void 0 ? _a : "100mb");
            logger_1.logger.info("LocalCache initialized");
        });
    }
    constructor() {
        var _a;
        this.redisClient = redis.createClient({
            url: (_a = process.env.REDIS_URL) !== null && _a !== void 0 ? _a : "redis://localhost:6379",
            database: Number.isNaN(Number(process.env.REDIS_DB)) ? 0 : Number(process.env.REDIS_DB),
        });
        this.EXPIRE_TIME = Number.isNaN(Number(process.env.EXPIRE_TIME)) ? 60 : Number(process.env.EXPIRE_TIME);
        this.redisClient = redis.createClient({
            url: process.env.REDIS_URL,
            database: Number(process.env.REDIS_DB),
        });
    }
    set(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redisClient.set(key, Buffer.from(value), {
                    EX: Number(this.EXPIRE_TIME)
                });
                return true;
            }
            catch (e) {
                console.error(e);
                return false;
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.redisClient.get(redis.commandOptions({
                returnBuffers: true
            }), key);
            this.redisClient.expire(key, this.EXPIRE_TIME);
            if (value) {
                return value;
            }
            else {
                return undefined;
            }
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.redisClient.del(key);
                return true;
            }
            catch (e) {
                console.error(e);
                return false;
            }
        });
    }
}
exports.default = LocalCache;
// const localCache = new LocalCache()
// const test = async () => {
//     await localCache.connect()
//     const res = await localCache.set("test", new Uint8Array([1, 2, 3, 4, 5]))
//     console.log(res)
//     const res2 = await localCache.get("test")
//     console.log(res2)
//     await new Promise((resolve) => setTimeout(resolve, 6000))
//     const res3 = await localCache.get("test")
//     console.log(res3)
//     localCache.delete("test")
//     const res4 = await localCache.delete("test")
//     console.log(res4)
//     const res5 = await localCache.get("test")
//     console.log(res5)
// }
// test().finally(async () => await localCache.close())
