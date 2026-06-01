export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private static instance: Logger
  private enabled: boolean = true
  private minLevel: LogLevel = 'info'
  private readonly levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  configure(enabled: boolean, minLevel: LogLevel = 'info') {
    this.enabled = enabled
    this.minLevel = minLevel
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false
    return this.levelPriority[level] >= this.levelPriority[this.minLevel]
  }

  private log(level: LogLevel, module: string, message: string, data?: unknown) {
    if (!this.shouldLog(level)) return

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${module}]`

    switch (level) {
      case 'debug':
        console.debug(prefix, message, data)
        break
      case 'info':
        console.info(prefix, message, data)
        break
      case 'warn':
        console.warn(prefix, message, data)
        break
      case 'error':
        console.error(prefix, message, data)
        break
    }
  }

  debug(module: string, message: string, data?: unknown) {
    this.log('debug', module, message, data)
  }

  info(module: string, message: string, data?: unknown) {
    this.log('info', module, message, data)
  }

  warn(module: string, message: string, data?: unknown) {
    this.log('warn', module, message, data)
  }

  error(module: string, message: string, data?: unknown) {
    this.log('error', module, message, data)
  }
}

export const logger = Logger.getInstance()