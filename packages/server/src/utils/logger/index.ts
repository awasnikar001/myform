import { Logger as L } from '@nestjs/common'

import { helper } from '@heyform-inc/utils'

export class Logger extends L {
  static info(message: any, context?: string): void {
    L.log(message, context)
  }

  static trace(message: any, trace?: string, context?: string): void {
    L.error(message, trace, context)
  }

  static fatal(message: any, trace?: string, context?: string): void {
    L.error(message, trace, context)
  }

  info(message: any, context?: string): void {
    this.log(message, context)
  }

  trace(message: any, trace?: string, context?: string): void {
    this.error(message, trace, context)
  }

  fatal(message: any, trace?: string, context?: string): void {
    this.error(message, trace, context)
  }

  /**
   * Log with context for better debugging
   * @param message Log message
   * @param context Additional context object
   * @param logContext Logger context name
   */
  logWithContext(message: string, context?: Record<string, any>, logContext?: string): void {
    const contextStr =
      helper.isValid(context) && Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : ''
    this.log(`${message}${contextStr}`, logContext)
  }

  /**
   * Log warning with context for better debugging
   * @param message Log message
   * @param context Additional context object
   * @param logContext Logger context name
   */
  warnWithContext(message: string, context?: Record<string, any>, logContext?: string): void {
    const contextStr =
      helper.isValid(context) && Object.keys(context).length > 0
        ? ` ${JSON.stringify(context)}`
        : ''
    this.warn(`${message}${contextStr}`, logContext)
  }

  /**
   * Log error with context
   * @param message Log message
   * @param error Error object or message
   * @param context Additional context object
   * @param logContext Logger context name
   */
  errorWithContext(
    message: string,
    error: any,
    context?: Record<string, any>,
    logContext?: string
  ): void {
    const errorInfo =
      error instanceof Error
        ? {
            message: error.message,
            name: error.name,
            stack: error.stack
          }
        : { message: String(error) }

    const fullContext = {
      ...context,
      error: errorInfo
    }

    const contextStr = JSON.stringify(fullContext)
    const stackTrace = error instanceof Error ? error.stack : undefined

    this.error(`${message} ${contextStr}`, stackTrace, logContext)
  }
}
