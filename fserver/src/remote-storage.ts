import { S3Client, PutObjectCommand, GetObjectCommand,DeleteObjectCommand  } from "@aws-sdk/client-s3";
import LocalCache from "./local-cache";

import {Upload} from "@aws-sdk/lib-storage"

import { logger } from "./logger";

export class RemoteStorage {
    private readonly client = new S3Client({
        region: "ca-central-1"
    });



    close(){
        this.localCache.close()
        logger.info("RemoteStorage closed")
    }
    private localCache = new LocalCache();

    constructor(){
        this.localCache.connect()
        logger.info("RemoteStorage initialized")
    }

    public async addObject(bucket: string, key: string, data: Uint8Array): Promise<boolean> {
      
        const upload = new Upload({
            client: this.client,
            params: {
                Bucket: bucket,
                Key: key,
                Body: data,
            },
        });
        try {
            const res = (await upload.done()).$metadata.httpStatusCode === 200;
            
            if(res){
                this.localCache.set(key, data );
            }
            return res;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    public async getObject(bucket: string, key: string): Promise<Uint8Array| undefined> {
        

        const cached = await this.localCache.get(key);
        if (cached) {
            logger.info(`Cache hit for ${key}`);
            return cached;
        }
        logger.info(`Cache miss for ${key}`);
        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });

        try {
            const res = await this.client.send(command);
            const body = res.Body;
            
            if (body) {
                const data =  await body.transformToByteArray();
                this.localCache.set(key, data);
                return data
            }
            return undefined;
        } catch (err) {
            console.error(err);
            return undefined;
        }
    }


    public async deleteObject(bucket: string, key: string): Promise<boolean> {
        const command = new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
        });

        try {
            const res = (await this.client.send(command)).$metadata.httpStatusCode === 204;
            if(res){
                this.localCache.delete(key);
            }
            return res;
        } catch (err) {
            console.error(err);
            return false;
        }
      
    }
}