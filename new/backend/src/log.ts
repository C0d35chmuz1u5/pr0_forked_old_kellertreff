import { pino, type LoggerOptions } from "pino";

const level = process.env.LOG_LEVEL ?? "info";
const nodeEnv = process.env.NODE_ENV ?? "development";

const loggingConfigs = {
  development: {
    level,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
      },
    },
  },
  test: {
    level,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: false,
        ignore: "pid,hostname",
      },
    },
  },
  production: {
    level,
  },
} as Record<string, LoggerOptions>;

const loggingConfig = loggingConfigs[nodeEnv];

export default pino(loggingConfig);
