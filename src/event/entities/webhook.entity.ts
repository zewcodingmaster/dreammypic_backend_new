import { S3 } from "@aws-sdk/client-s3";
import { Provider } from "@nestjs/common";

export const S3Provider: Provider = {
  provide: "S3",
  useFactory: () => {
    return new S3({
      region: "ap-south-1",
      credentials: {
        accessKeyId: "AKIA5FW535OQPFCR4R6U",
        secretAccessKey: "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",
      },
    });
  },
};
