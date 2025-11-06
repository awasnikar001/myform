import { BadRequestException, UseGuards } from '@nestjs/common'

import { GraphqlRequest, GraphqlResponse } from '@decorator'
import { LoginInput } from '@graphql'
import { DeviceIdGuard } from '@guard'
import { date, helper } from '@heyform-inc/utils'
import { UserActivityKindEnum } from '@model'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { AuthService, MailService, UserService } from '@service'
import { ClientInfo, GqlClient, Logger, comparePassword } from '@utils'

@Resolver()
@UseGuards(DeviceIdGuard)
export class LoginResolver {
  private readonly logger = new Logger('Auth')

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly mailService: MailService
  ) {}

  @Query(returns => Boolean)
  async login(
    @GqlClient() client: ClientInfo,
    @GraphqlRequest() req: any,
    @GraphqlResponse() res: any,
    @Args('input') input: LoginInput
  ): Promise<boolean> {
    const logContext = {
      email: input.email,
      ip: client.ip,
      deviceId: client.deviceId,
      userAgent: `${client.userAgent?.browser?.name} on ${client.userAgent?.os?.name}`
    }

    this.logger.logWithContext('Login attempt started', logContext)

    const user = await this.userService.findByEmail(input.email)

    if (helper.isEmpty(user)) {
      this.logger.warnWithContext('Login failed: user not found', logContext)
      throw new BadRequestException('The password does not match')
    }

    const key = `limit:login:${user.id}`

    try {
      await this.authService.attemptsCheck(key, async () => {
        if (helper.isEmpty(user.password)) {
          this.logger.warnWithContext('Login failed: user has no password set', {
            ...logContext,
            userId: user.id
          })
          throw new BadRequestException('The password does not match')
        }

        const verified = await comparePassword(input.password, user.password)

        if (!verified) {
          this.logger.warnWithContext('Login failed: password mismatch', {
            ...logContext,
            userId: user.id
          })
          throw new BadRequestException('The password does not match')
        }
      })
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      this.logger.errorWithContext('Login failed: rate limit or other error', error, {
        ...logContext,
        userId: user.id
      })
      throw error
    }

    const devices = await this.authService.devices(user.id)
    const isNewDevice = helper.isValid(devices) && !devices.includes(client.deviceId)

    if (isNewDevice) {
      this.logger.logWithContext('New device detected for user', {
        ...logContext,
        userId: user.id,
        deviceModel: logContext.userAgent
      })

      this.mailService.userSecurityAlert(user.email, {
        deviceModel: logContext.userAgent,
        ip: client.ip,
        loginAt: date().format('YYYY-MM-DD HH:mm:ss')
      })
    }

    this.authService.createUserActivity({
      kind: UserActivityKindEnum.LOGIN,
      userId: user.id,
      ...client
    })

    await this.authService.login({
      res,
      userId: user.id,
      deviceId: client.deviceId
    })

    this.logger.logWithContext('User logged in successfully', {
      ...logContext,
      userId: user.id,
      isNewDevice
    })

    return true
  }
}
