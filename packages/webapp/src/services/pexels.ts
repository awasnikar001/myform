import { apollo } from '@/utils'

import { PEXELS_SEARCH_GQL } from '@/consts'

export class PexelsService {
  static async search(keyword?: string) {
    try {
      const result = await apollo.query({
        query: PEXELS_SEARCH_GQL,
        variables: {
          input: {
            keyword
          }
        },
        fetchPolicy: 'network-only'
      })

      // Debug logging
      console.log('PexelsService.search result:', result)

      // apollo.query already extracts the data via responseInterceptor
      // So result is already the array from pexelsSearch query
      if (Array.isArray(result)) {
        return result
      }

      // Fallback: if result is an object, try to extract pexelsSearch
      if (result && typeof result === 'object') {
        if ('pexelsSearch' in result && Array.isArray(result.pexelsSearch)) {
          return result.pexelsSearch
        }
        // If it's the data object directly
        const keys = Object.keys(result)
        if (keys.length > 0 && Array.isArray(result[keys[0]])) {
          return result[keys[0]]
        }
      }

      console.warn('PexelsService.search: Unexpected result format', result)
      return []
    } catch (error) {
      console.error('PexelsService.search error:', error)
      throw error
    }
  }
}
