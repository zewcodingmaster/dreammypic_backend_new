import { config } from "dotenv";
const Razorpay = require("razorpay");

config();

const ENVs = {
  clientId: "clientId",
  clientSecret: "clientSecret",
  // development_webhook: "development_webhook",
  // production_webhook: "production_webhook",
  runpod_api: "runpod_api",
  runpod_secret_key: "runpod_secret_key",
  Environment: "Environment",
  PORT: "PORT",
  development_runpod_webhook: "development_runpod_webhook",
  production_runpod_webhook: "production_runpod_webhook",
  razorpay_key_id: "razorpay_key_id",
  razorpay_key_secret: "razorpay_key_secret",
  imageGenerationrateRate: "imageGenerationrateRate",
  additionalImageGenerationRate: "additionalImageGenerationRate",
} as const;

const getEnv = (envs: keyof typeof ENVs) => {
  const env_variable = process.env?.[envs];

  if (!env_variable) throw new Error("No environment variable");

  return env_variable;
};

const enviornment = getEnv("Environment");

const isDevelopment = enviornment === "DEVELOPMENT",
  isProduction = enviornment === "PRODUCTION";

const razorpay = new Razorpay({
  key_id: getEnv("razorpay_key_id"),
  key_secret: getEnv("razorpay_key_secret"),
});

const runpodKeyWords = {
  run: "run",
  status: "status"
} as const

const getRunpodApi = (runpodKeys: keyof typeof runpodKeyWords) => {
  switch (runpodKeys) {
    case runpodKeyWords.run:
      return getEnv("runpod_api") + runpodKeyWords.run;
    case runpodKeyWords.status:
      return getEnv("runpod_api") + runpodKeyWords.status;
    default:
      throw new Error("Invalid Runpod API key");
  }
}


export const constants = {
  isDevelopment,
  isProduction,
  clientId: getEnv("clientId"),
  clientSecret: getEnv("clientSecret"),
  // development_webhook: getEnv("development_webhook"),
  // production_webhook: getEnv("production_webhook"),
  // runpod_api_run="https://api.runpod.ai/v2/sfcnwuz57vrx1h/run"

  runpod_api_run: getRunpodApi("run"),
  runpod_api_status: getRunpodApi("status"),
  runpod_secret_key: getEnv("runpod_secret_key"),
  port: parseInt(getEnv("PORT")),
  ok_response: "OK",
  development_runpod_webhook: getEnv("development_runpod_webhook"),
  production_runpod_webhook: getEnv("production_runpod_webhook"),
  razorpay_key_id: getEnv("razorpay_key_id"),
  razorpay_key_secret: getEnv("razorpay_key_secret"),
  runpod_request_completion_status: "COMPLETED",
  razorpay,
  imageGenerationrateRate: parseInt(getEnv("imageGenerationrateRate")),
  additionalImageGeneration: parseInt(getEnv("additionalImageGenerationRate")),
  enviornment,
};
