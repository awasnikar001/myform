import got from 'got'
import { OptionsOfTextResponseBody } from 'got/dist/source/types'

const SEARCH_PHOTO_API_URL = 'https://api.pexels.com/v1/search'

interface PhotoSrc {
  original: string
  large2x: string
  large: string
  medium: string
  small: string
  portrait: string
  landscape: string
  tiny: string
}

export interface PX_Photo {
  id: number
  width: number
  height: number
  url: string
  photographer: string
  photographer_url: string
  photographer_id: number
  avg_color: string
  src: PhotoSrc
  liked: boolean
  alt: string
}

export interface PX_PhotoResult {
  photos: PX_Photo[]
  page: number
  per_page: number
  total_results: number
  next_page?: string
  prev_page?: string
}

export interface PexelsConfig {
  apiKey: string
}

export class Pexels {
  private readonly apiKey: string

  constructor(config: PexelsConfig) {
    this.apiKey = config.apiKey
  }

  static init(config: PexelsConfig): Pexels {
    return new Pexels(config)
  }

  async search(query: string, page = 1, perPage = 24): Promise<PX_PhotoResult> {
    return this.request(SEARCH_PHOTO_API_URL, {
      // see https://www.pexels.com/api/documentation/#photos-search
      searchParams: {
        query,
        page,
        per_page: perPage
      }
    })
  }

  request(url: string, options?: OptionsOfTextResponseBody): Promise<any> {
    return got(url, {
      ...options,
      method: options?.method || 'GET',
      headers: {
        ...options?.headers,
        Authorization: this.apiKey
      },
      timeout: 30_000
    }).json()
  }
}
