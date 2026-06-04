type LogMeta = Record<string, unknown>;

function format(level: string, msg: string, meta?: LogMeta): string {
  const time = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${time} [${level}] ${msg}${metaStr}`;
}

export const logger = {
  info(msg: string, meta?: LogMeta): void {
    console.log(format('info', msg, meta));
  },
  warn(msg: string, meta?: LogMeta): void {
    console.warn(format('warn', msg, meta));
  },
  error(msg: string, err?: unknown, meta?: LogMeta): void {
    const errMeta: LogMeta = { ...meta };
    if (err instanceof Error) {
      errMeta.error = err.message;
      errMeta.stack = err.stack;
    } else if (err !== undefined) {
      errMeta.error = String(err);
    }
    console.error(format('error', msg, errMeta));
  },
  child(scope: string) {
    return {
      info: (msg: string, meta?: LogMeta) => logger.info(`[${scope}] ${msg}`, meta),
      warn: (msg: string, meta?: LogMeta) => logger.warn(`[${scope}] ${msg}`, meta),
      error: (msg: string, err?: unknown, meta?: LogMeta) =>
        logger.error(`[${scope}] ${msg}`, err, meta),
    };
  },
};
