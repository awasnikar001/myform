import { Logger } from '@nestjs/common'

import { Auth } from '@decorator'
import { PEXELS_API_KEY } from '@environments'
import { PexelsImageType, PexelsSearchInput } from '@graphql'
import { helper } from '@heyform-inc/utils'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { Pexels } from '@utils'
import { randomNumber } from '@utils'

@Resolver()
@Auth()
export class PexelsSearchResolver {
  private readonly logger = new Logger(PexelsSearchResolver.name)

  @Query(returns => [PexelsImageType])
  async pexelsSearch(@Args('input') input: PexelsSearchInput): Promise<PexelsImageType[]> {
    try {
      let page = input.page || 1
      let query = input.keyword

      if (helper.isEmpty(query)) {
        query = 'professional business'
        page = randomNumber(1, 50) // Pexels typically has fewer pages than Unsplash
      }

      if (helper.isEmpty(PEXELS_API_KEY)) {
        this.logger.warn('PEXELS_API_KEY is not set')
        return []
      }

      const pexels = Pexels.init({
        apiKey: PEXELS_API_KEY
      })

      this.logger.log(`Searching Pexels for: ${query}, page: ${page}`)
      const result = await pexels.search(query, page, 24)

      if (!result || !result.photos || !Array.isArray(result.photos)) {
        this.logger.error('Invalid Pexels API response', JSON.stringify(result))
        return []
      }

      return result.photos.map(photo => ({
        id: String(photo.id),
        url: photo.src.large2x, // High quality image
        thumbUrl: photo.src.medium, // Thumbnail
        downloadUrl: photo.url, // Original URL
        author: photo.photographer,
        authorUrl: photo.photographer_url
      }))
    } catch (error) {
      this.logger.error('Error searching Pexels', error)
      throw error
    }
  }
}
