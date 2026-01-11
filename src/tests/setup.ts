import { config } from '@vue/test-utils'
import { beforeAll } from 'vitest'

// Configure Vue Test Utils globally
config.global.stubs = {
  teleport: true,
}

// Ensure DOM is available
beforeAll(() => {
  if (typeof globalThis.document === 'undefined') {
    // This should not happen with happy-dom, but just in case
    console.warn('DOM not available in test environment')
  }
})
