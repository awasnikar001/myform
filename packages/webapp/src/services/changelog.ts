import axios from 'axios'

import { ChangelogType } from '@/types'

export class ChangelogService {
  static async latest(): Promise<ChangelogType | null> {
    try {
      const response = await axios.get('/api/changelog/latest')
      return response.data || null
    } catch (error) {
      // Silently handle errors (rate limits, network issues, etc.)
      // The component will handle null gracefully
      console.warn('Failed to fetch latest changelog:', error)
      return null
    }
  }

  static async list(): Promise<ChangelogType[]> {
    try {
      const response = await axios.get('/api/changelogs')
      return response.data || []
    } catch (error) {
      // Silently handle errors (rate limits, network issues, etc.)
      // Return empty array as fallback
      console.warn('Failed to fetch changelogs:', error)
      return []
    }
  }
}
