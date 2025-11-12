import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'

import { ChangelogService } from '@service'

@Controller()
export class ChangelogController {
  constructor(private readonly changelogService: ChangelogService) {}

  @Get('/api/changelog/latest')
  @HttpCode(HttpStatus.OK)
  async getLatestRelease() {
    const result = await this.changelogService.getLatestRelease()

    // Return null gracefully if rate limited or error occurred
    return result || null
  }

  @Get('/api/changelogs')
  @HttpCode(HttpStatus.OK)
  async changelogs() {
    const result = await this.changelogService.getAllReleases()

    // Return empty array gracefully if rate limited or error occurred
    return result || []
  }
}
