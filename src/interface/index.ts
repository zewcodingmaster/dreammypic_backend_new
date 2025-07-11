export interface Runpod_Image_generation_request_response {
  id: string;
  status: "IN_QUEUE";
}

export interface RunpodResponseType {
  delayTime: number;
  executionTime: number;
  id: string;
  input: {
    image1: string;
    image2?: string;
    image3?: string;
    image4?: string;
    prompt: string;
  };
  output: {
    output: string;
    seed_output: string;
  };
  status: string;
  webhook: string;
}
