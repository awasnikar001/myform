import { BadRequestException, Injectable } from '@nestjs/common'

import { helper } from '@heyform-inc/utils'
import { GqlModuleOptions, GqlOptionsFactory } from '@nestjs/graphql'

@Injectable()
export class GraphqlService implements GqlOptionsFactory {
  async createGqlOptions(): Promise<GqlModuleOptions> {
    return {
      // Removed schemaDirectives - the lower directive was registered but never used
      // LowerCaseScalar is used instead for lowercase string handling
      autoSchemaFile: true,
      formatError: e => {
        // Handle BadRequestException (replaces UserInputError)
        if (e.extensions?.exception instanceof BadRequestException) {
          return {
            code: e.extensions.code || 'BAD_REQUEST',
            message: e.message
          }
        }

        const response = e.extensions?.exception?.response
        let code = e.extensions?.code
        let message = e.message as string

        if (helper.isValid(response)) {
          if (helper.isValid(response.code)) {
            code = response.code
          } else if (helper.isValid(response.error)) {
            code = response.error.replace(/\s+/g, '_').toUpperCase()
          }

          if (helper.isValid(response.message)) {
            message = helper.isArray(response.message) ? response.message[0] : response.message
          }
        }

        if (e.extensions?.exception?.response) {
          delete e.extensions.exception.response
        }

        return {
          code,
          message: e.message,
          ...(e.extensions?.exception || {}),
          ...{ message }
        }
      },
      formatResponse: response => {
        return response
      },
      context: ({ req, res }) => ({ req, res }),
      cors: {
        credentials: true,
        origin: true
      },
      uploads: false
    } as GqlModuleOptions
  }
}
