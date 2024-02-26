import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
    region: "ca-central-1",
});

export const main = async () => {
  const command = new GetObjectCommand({
    Bucket: "campass",
    Key: "hello-s3.txt",
  });

  try {
    const response = await client.send(command);
    // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
    const str = await response.Body?.transformToString();
    console.log(str);
  } catch (err) {
    console.error(err);
  }
};


main()


