import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException
} from '@nestjs/common'

import { helper } from '@heyform-inc/utils'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Logger } from '@utils'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: Error, host: ArgumentsHost): void {
    let gqlCtx: any
    let ctx: any
    let request: any

    try {
      gqlCtx = GqlExecutionContext.create(host as any)
      ctx = gqlCtx.getContext()
      request = ctx?.req || host.switchToHttp().getRequest()
    } catch (error) {
      // If we can't get context, fall back to HTTP
      request = host.switchToHttp().getRequest()
      ctx = {}
    }

    // Extract request context for logging (safely)
    const logContext: Record<string, any> = {}

    try {
      logContext.method = request?.method
      logContext.url = request?.url || request?.body?.operationName
      logContext.ip = request?.ip || request?.connection?.remoteAddress
      logContext.userAgent = request?.headers?.['user-agent']

      // Extract user info if available
      if (request?.user) {
        logContext.userId = request.user.id
      }

      // Extract GraphQL operation info if available
      if (request?.body?.operationName) {
        logContext.operation = request.body.operationName
        logContext.variables = request.body.variables
          ? Object.keys(request.body.variables).join(', ')
          : undefined
      }
    } catch (error) {
      // If context extraction fails, just log the exception
      this.logger.error('Failed to extract request context', error)
    }

    // Check if this is a GraphQL request
    if (helper.isValid(ctx?.res)) {
      // GraphQL context - log but re-throw original exception (GraphQL handles errors via formatError)
      if (!(exception instanceof HttpException)) {
        this.logger.errorWithContext(
          'Unhandled exception in GraphQL context',
          exception,
          logContext
        )
        // Re-throw original exception so GraphQL can handle it
        throw exception
      } else {
        // Log HTTP exceptions in GraphQL context
        const status = exception.getStatus()
        if (status >= 500) {
          this.logger.errorWithContext('Server error in GraphQL', exception, {
            ...logContext,
            statusCode: status
          })
        } else if (status >= 400) {
          this.logger.warnWithContext(`Client error in GraphQL: ${exception.message}`, {
            ...logContext,
            statusCode: status
          })
        }
        // Re-throw original exception so GraphQL can handle it
        throw exception
      }
    } else {
      // HTTP context - handle normally
      try {
        const res = host.switchToHttp().getResponse()

        let httpException = exception as HttpException

        if (!(exception instanceof HttpException)) {
          httpException = new InternalServerErrorException(exception.message)

          this.logger.errorWithContext('Unhandled exception in HTTP context', exception, logContext)
        } else {
          // Log HTTP exceptions
          const status = httpException.getStatus()
          if (status >= 500) {
            this.logger.errorWithContext('Server error in HTTP request', exception, {
              ...logContext,
              statusCode: status
            })
          }
        }

        if (res.get('content-type') === 'text/event-stream') {
          const response = httpException.getResponse()
          let message = response as string

          if (helper.isObject(response)) {
            message = (response as any).message[0]
          }

          res.sse(`data: [ERROR] ${message}\n\n`)
          return res.end()
        }

        res.status(httpException.getStatus()).json(httpException.getResponse())
      } catch (error) {
        // Fallback if HTTP response handling fails
        this.logger.error('Failed to handle HTTP exception', error)
      }
    }
  }
}
