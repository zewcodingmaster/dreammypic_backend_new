import { S3 } from "@aws-sdk/client-s3";
import { Provider } from "@nestjs/common";

export const S3Provider: Provider = {
  provide: "S3",
  useFactory: () => {
    return new S3({
      region: "ap-south-1",
      credentials: {
        accessKeyId: "AKIAQLSIVL42YEA4RJQ2",
        secretAccessKey: "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",
      },
    });
  },
};
