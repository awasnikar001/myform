import { Injectable, Logger } from '@nestjs/common'
import got from 'got'

import { RedisService } from './redis.service'

interface GitHubRelease {
  id: number
  tag_name: string
  name: string
  body: string
  html_url: string
  published_at: string
}

const GITHUB_API_URL = 'https://api.github.com/repos/heyform/heyform/releases'
const CACHE_KEY_LATEST = 'changelog:latest'
const CACHE_KEY_ALL = 'changelog:all'
const CACHE_DURATION = '1h' // Cache for 1 hour to reduce API calls

@Injectable()
export class ChangelogService {
  private readonly logger = new Logger(ChangelogService.name)

  constructor(private readonly redisService: RedisService) {}

  async getLatestRelease() {
    try {
      // Try to get from cache first (cache is optional)
      try {
        const cached = await this.redisService.get(CACHE_KEY_LATEST)
        if (cached) {
          return JSON.parse(cached)
        }
      } catch (cacheError) {
        // Cache unavailable, continue with API call
        this.logger.debug('Cache unavailable, fetching from API')
      }

      // Fetch from GitHub API
      const result = await got
        .get(`${GITHUB_API_URL}/latest`, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Heyform-Changelog'
          },
          timeout: {
            request: 5000 // 5 second timeout
          }
        })
        .json<GitHubRelease>()

      const response = {
        id: result.id,
        publishedAt: result.published_at
      }

      // Cache the result (cache is optional)
      try {
        await this.redisService.set({
          key: CACHE_KEY_LATEST,
          value: JSON.stringify(response),
          duration: CACHE_DURATION
        })
      } catch (cacheError) {
        // Cache write failed, but continue
        this.logger.debug('Failed to cache result, continuing')
      }

      return response
    } catch (error: any) {
      // Handle rate limit errors gracefully
      if (error.response?.statusCode === 403 || error.message?.includes('rate limit')) {
        this.logger.warn('GitHub API rate limit exceeded, returning cached data or null')

        // Try to return cached data even if expired
        try {
          const cached = await this.redisService.get(CACHE_KEY_LATEST)
          if (cached) {
            return JSON.parse(cached)
          }
        } catch (cacheError) {
          // Cache unavailable
        }

        // Return null if no cache available (frontend should handle this gracefully)
        return null
      }

      // Log other errors but don't crash
      this.logger.error(`Failed to fetch latest release: ${error.message}`, error.stack)

      // Try to return cached data as fallback
      try {
        const cached = await this.redisService.get(CACHE_KEY_LATEST)
        if (cached) {
          return JSON.parse(cached)
        }
      } catch (cacheError) {
        // Cache unavailable
      }

      // Return null if no cache available
      return null
    }
  }

  async getAllReleases() {
    try {
      // Try to get from cache first (cache is optional)
      try {
        const cached = await this.redisService.get(CACHE_KEY_ALL)
        if (cached) {
          return JSON.parse(cached)
        }
      } catch (cacheError) {
        // Cache unavailable, continue with API call
        this.logger.debug('Cache unavailable, fetching from API')
      }

      // Fetch from GitHub API
      const result = await got
        .get(GITHUB_API_URL, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': 'Heyform-Changelog'
          },
          timeout: {
            request: 5000 // 5 second timeout
          }
        })
        .json<GitHubRelease[]>()

      const response = result.map(r => ({
        id: r.id,
        title: r.name || r.tag_name,
        content: r.body || '',
        publishedAt: r.published_at
      }))

      // Cache the result (cache is optional)
      try {
        await this.redisService.set({
          key: CACHE_KEY_ALL,
          value: JSON.stringify(response),
          duration: CACHE_DURATION
        })
      } catch (cacheError) {
        // Cache write failed, but continue
        this.logger.debug('Failed to cache result, continuing')
      }

      return response
    } catch (error: any) {
      // Handle rate limit errors gracefully
      if (error.response?.statusCode === 403 || error.message?.includes('rate limit')) {
        this.logger.warn('GitHub API rate limit exceeded, returning cached data or empty array')

        // Try to return cached data even if expired
        try {
          const cached = await this.redisService.get(CACHE_KEY_ALL)
          if (cached) {
            return JSON.parse(cached)
          }
        } catch (cacheError) {
          // Cache unavailable
        }

        // Return empty array if no cache available
        return []
      }

      // Log other errors but don't crash
      this.logger.error(`Failed to fetch all releases: ${error.message}`, error.stack)

      // Try to return cached data as fallback
      try {
        const cached = await this.redisService.get(CACHE_KEY_ALL)
        if (cached) {
          return JSON.parse(cached)
        }
      } catch (cacheError) {
        // Cache unavailable
      }

      // Return empty array if no cache available
      return []
    }
  }
}
