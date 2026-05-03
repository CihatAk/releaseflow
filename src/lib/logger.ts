type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context } = entry;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    const formatted = this.formatLog(entry);

    if (this.isDevelopment) {
      console.log(formatted);
    } else {
      // In production, you might want to send to a logging service
      console.log(formatted);
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  // API-specific logging
  apiRequest(method: string, path: string, duration?: number) {
    this.info(`API Request`, { method, path, duration });
  }

  apiError(method: string, path: string, error: string) {
    this.error(`API Error`, { method, path, error });
  }

  dbOperation(operation: string, table: string, duration?: number) {
    this.debug(`DB Operation`, { operation, table, duration });
  }
}

export const logger = new Logger();
