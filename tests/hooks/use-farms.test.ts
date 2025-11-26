import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useFarms, useCreateFarm, useFarm } from '@/lib/hooks/use-farms'
import type { Farm, NewFarm } from '@/types'

// Mock farm data
const mockFarm: Farm = {
  id: '1',
  userId: 'user-1',
  name: 'Test Farm',
  location: 'Ouagadougou',
  country: 'burkina_faso',
  totalHectares: 10.5,
  description: 'A test farm',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const mockFarms: Farm[] = [
  mockFarm,
  {
    id: '2',
    userId: 'user-1',
    name: 'Second Farm',
    location: 'Bamako',
    country: 'mali',
    totalHectares: 15.0,
    description: 'Another test farm',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
]

describe('useFarms', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches farms successfully', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockFarms,
    })
    global.fetch = mockFetch

    const { result } = renderHook(() => useFarms())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBe(null)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockFarms)
    expect(result.current.error).toBe(null)
    expect(mockFetch).toHaveBeenCalledWith('/api/farms')
  })

  it('handles fetch error', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    })
    global.fetch = mockFetch

    const { result } = renderHook(() => useFarms())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toContain('Internal Server Error')
  })

  it('can refetch data', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFarms,
    })
    global.fetch = mockFetch

    const { result } = renderHook(() => useFarms())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    await result.current.refetch()

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })
})

describe('useFarm', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches single farm by ID', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockFarm,
    })
    global.fetch = mockFetch

    const { result } = renderHook(() => useFarm('1'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockFarm)
    expect(mockFetch).toHaveBeenCalledWith('/api/farms/1')
  })

  it('does not fetch when ID is null', async () => {
    const mockFetch = vi.fn()
    global.fetch = mockFetch

    const { result } = renderHook(() => useFarm(null))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})

describe('useCreateFarm', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a farm successfully', async () => {
    const newFarm: NewFarm = {
      userId: 'user-1',
      name: 'New Farm',
      location: 'Niamey',
      country: 'niger',
      totalHectares: 20.0,
      description: 'A new test farm',
    }

    const createdFarm: Farm = {
      ...newFarm,
      id: '3',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => createdFarm,
    })
    global.fetch = mockFetch

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useCreateFarm(onSuccess))

    expect(result.current.isLoading).toBe(false)
    expect(result.current.data).toBe(null)

    await result.current.mutate(newFarm)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(createdFarm)
    expect(result.current.error).toBe(null)
    expect(onSuccess).toHaveBeenCalledWith(createdFarm)
    expect(mockFetch).toHaveBeenCalledWith('/api/farms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newFarm),
    })
  })

  it('handles create farm error', async () => {
    const newFarm: NewFarm = {
      userId: 'user-1',
      name: 'New Farm',
      location: 'Niamey',
      country: 'niger',
      totalHectares: 20.0,
    }

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid farm data' }),
    })
    global.fetch = mockFetch

    const { result } = renderHook(() => useCreateFarm(undefined))

    await act(async () => {
      await result.current.mutate(newFarm)
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toContain('Invalid farm data')
  })

  it('can reset mutation state', async () => {
    const newFarm: NewFarm = {
      userId: 'user-1',
      name: 'New Farm',
      location: 'Niamey',
      country: 'niger',
      totalHectares: 20.0,
    }

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Error' }),
    })
    global.fetch = mockFetch

    const { result } = renderHook(() => useCreateFarm())

    await act(async () => {
      await result.current.mutate(newFarm)
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).not.toBe(null)

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBe(null)
    expect(result.current.data).toBe(null)
  })
})
