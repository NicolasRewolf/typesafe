import "server-only";

import { TypeSafeClient } from "@typesafe-ai/sdk";

let client: TypeSafeClient | null = null;

export function typesafeClient(): TypeSafeClient {
  if (!process.env.TYPESAFE_API_KEY) throw new Error("missing-judge");
  client ??= new TypeSafeClient({
    apiKey: process.env.TYPESAFE_API_KEY,
    defaultModel: "jev-latest",
    timeout: 30_000,
    logLevel: "warn",
  });
  return client;
}
