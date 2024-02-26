import * as redis from "redis"

import { logger } from "./logger";

export default class LocalCache {


    private readonly redisClient = redis.createClient({
        url: process.env.REDIS_URL ?? "redis://localhost:6379",
        database: Number.isNaN(Number(process.env.REDIS_DB)) ? 0 : Number(process.env.REDIS_DB),
       

    });

    private readonly EXPIRE_TIME: number = Number.isNaN(Number(process.env.EXPIRE_TIME)) ? 60 : Number(process.env.EXPIRE_TIME)

    async close() {
        this.redisClient.quit()
        logger.info("LocalCache closed")
    }


    async connect() {

        this.redisClient.on("error", function (error) {
            console.error(error);
        })
        
        await this.redisClient.connect()
        await this.redisClient.configSet("maxmemory", process.env.REDIS_MAX_MEMORY ?? "100mb")
       
        logger.info("LocalCache initialized")

    }

    constructor() {
        this.redisClient = redis.createClient(
            {

                url: process.env.REDIS_URL,
                database: Number(process.env.REDIS_DB),

            })
    }
    async set(key: string, value: Uint8Array): Promise<boolean> {
        try {
            
            await this.redisClient.set(key, Buffer.from(value), {
                EX: Number(this.EXPIRE_TIME)
            })
            return true
        } catch (e) {
            console.error(e)
            return false
        }

    }

    async get(key: string): Promise<undefined | Uint8Array> {
        const value = await this.redisClient.get(redis.commandOptions({
            returnBuffers: true
        }), key)

        this.redisClient.expire(key, this.EXPIRE_TIME)

        
        if (value) {
          
            return value;
        } else {
            return undefined
        }

    }

    async delete(key: string): Promise<boolean> {
        try {
            await this.redisClient.del(key)
            return true
        } catch (e) {
            console.error(e)
            return false
        }

    }
}

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
