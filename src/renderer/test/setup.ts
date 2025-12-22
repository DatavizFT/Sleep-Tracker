import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock pour window.electronAPI
const mockElectronAPI = {
  sleep: {
    getAll: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue({ success: true }),
    update: vi.fn().mockResolvedValue({ success: true }),
    delete: vi.fn().mockResolvedValue({ success: true }),
    getByDateRange: vi.fn().mockResolvedValue([]),
  },
  mood: {
    getAll: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue({ success: true }),
    update: vi.fn().mockResolvedValue({ success: true }),
    delete: vi.fn().mockResolvedValue({ success: true }),
  },
  agenda: {
    getAll: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue({ success: true }),
    update: vi.fn().mockResolvedValue({ success: true }),
    delete: vi.fn().mockResolvedValue({ success: true }),
  },
}

// @ts-expect-error - Mock global
globalThis.window = {
  ...globalThis.window,
  electronAPI: mockElectronAPI,
}

// Reset mocks avant chaque test
beforeEach(() => {
  vi.clearAllMocks()
})
