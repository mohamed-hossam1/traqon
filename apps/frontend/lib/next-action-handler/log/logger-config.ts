import "server-only";

import pino from "pino";
import type { ErrorCode } from "../error/errors";

export const ERROR_LOG_LEVEL: Record<ErrorCode, "warn" | "error"> = {
  BAD_REQUEST: "warn",
  UNAUTHORIZED: "warn",
  FORBIDDEN: "warn",
  NOT_FOUND: "warn",
  CONFLICT: "warn",
  UNPROCESSABLE_ENTITY: "warn",
  RATE_LIMITED: "warn",
  INTERNAL_SERVER_ERROR: "error",
};

const logPrettyEnv = process.env.LOG_PRETTY?.toLowerCase();
const isDevelopment = process.env.NODE_ENV === "development";
const usePretty =
  logPrettyEnv === "true" ||
  logPrettyEnv === "1" ||
  (isDevelopment && logPrettyEnv !== "false") ||
  (typeof process !== "undefined" && process.stdout?.isTTY && logPrettyEnv !== "false");

const baseOptions: pino.LoggerOptions = {
  base: null,
  level: process.env.LOG_LEVEL ?? "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
  },
};

const LEVEL_COLORS: Record<number, string> = {
  10: "\x1b[90mTRACE\x1b[0m",
  20: "\x1b[34mDEBUG\x1b[0m",
  30: "\x1b[32mINFO\x1b[0m",
  40: "\x1b[33mWARN\x1b[0m",
  50: "\x1b[31mERROR\x1b[0m",
  60: "\x1b[35mFATAL\x1b[0m",
};

function createPrettyStream() {
  return {
    write(raw: string) {
      try {
        const log = JSON.parse(raw);
        const timeStr = log.time ? new Date(log.time).toISOString().replace("T", " ").replace("Z", "") : "";
        const levelStr = LEVEL_COLORS[log.level] ?? "LOG";
        const message = log.msg || "";
        console.log(`[${timeStr}] ${levelStr}: ${message}`);
        if (log.stack) {
          console.error(log.stack);
        }
      } catch {
        console.log(raw.trim());
      }
    },
  };
}

export const logger = usePretty
  ? pino(baseOptions, createPrettyStream())
  : pino(baseOptions);

