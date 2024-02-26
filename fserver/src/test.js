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
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client = new client_s3_1.S3Client({
    region: "ca-central-1",
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const command = new client_s3_1.GetObjectCommand({
        Bucket: "campass",
        Key: "hello-s3.txt",
    });
    try {
        const response = yield client.send(command);
        // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
        const str = yield ((_a = response.Body) === null || _a === void 0 ? void 0 : _a.transformToString());
        console.log(str);
    }
    catch (err) {
        console.error(err);
    }
});
exports.main = main;
(0, exports.main)();
