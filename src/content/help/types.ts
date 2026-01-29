/**
 * Help Content Types
 * Type definitions for the help system
 */

export interface HelpContent {
  title: string
  description: string
  examples?: Array<{
    label: string
    code?: string
    explanation: string
  }>
  relatedTopics?: string[]
}
