import express from 'express';
import { RemoteStorage } from './remote-storage';
import bodyParser from 'body-parser';
import { extractMIMEType, attachMIMEType } from './mimeutil';
import { FileMIMEType } from './mimeutil';
import { Readable } from 'stream';

import cors from 'cors';


const app = express()
app.use(cors());

import { logger } from './logger';


const remoteStorage: RemoteStorage = new RemoteStorage();




app.post("/", (req, res)=>{
    res.status(200).end();
})


app.get('/:bucket/:key', async (req: express.Request, res: express.Response) => {

    logger.info(`GET ${req.params.bucket}/${req.params.key}`);

    const bucket = req.params.bucket;
    const key = req.params.key;
    const record = await remoteStorage.getObject(bucket, key);
    if (record) {


        const [contentType, data] = extractMIMEType(record);
        res.setHeader('Content-Type', contentType);

        const stream = new Readable();
        stream.push(data);
        stream.push(null);
        stream.pipe(res);
     
        return;


    } else {
        res.status(404).send('Not Found');
    }



});


app.post('/:bucket/:key', express.raw({
    type: () => true,
    limit: '10mb'

}), async (req: express.Request, res: express.Response) => {

    logger.info(`POST ${req.params.bucket}/${req.params.key}`);
    const bucket = req.params.bucket;
    const key = req.params.key;
    const data = new Uint8Array(req.body);
    const contentType = req.get('Content-Type') || '';
    const record = attachMIMEType(data, contentType as FileMIMEType);


    // res.end();
    const result = await remoteStorage.addObject(bucket, key, record);
    if (result) {
        res.send('OK');
    } else {
        res.status(500).send('Error');
    }

});


app.delete('/:bucket/:key', async (req: express.Request, res: express.Response) => {

    logger.info(`DELETE ${req.params.bucket}/${req.params.key}`);
    const bucket = req.params.bucket;
    const key = req.params.key;
    const result = await remoteStorage.deleteObject(bucket, key);
    if (result) {
        res.send('OK');
    } else {
        res.status(500).send('Error');
    }
});




const server = app.listen(9876, () => {
   logger.info('Server started at http://localhost:9876');
});


server.on('close', () => {
    logger.info('Server closed');
    remoteStorage.close();
})

server.on('error', (err) => {
    logger.error(err);
    remoteStorage.close();
})



process.on("SIGINT", ()=>{
    
    server.close();
})