/**
 * Smart endpoint discovery for profile/user endpoints.
 * Tries common patterns and caches the discovered endpoint.
 */

let discoveredProfileEndpoint: string | null = null

export async function discoverProfileEndpoint(axiosInstance: any): Promise<string> {
  // Return cached endpoint if already discovered
  if (discoveredProfileEndpoint) {
    console.debug(`[Endpoint Probe] Using cached endpoint: ${discoveredProfileEndpoint}`)
    return discoveredProfileEndpoint
  }

  console.debug(`[Endpoint Probe] Starting discovery...`)

  // List of common profile endpoint patterns (in order of preference)
  const endpoints = [
    "/auth/me",
    "/auth/profile",
    "/auth/user",
    "/users/me",
    "/users/profile",
    "/user/me",
    "/user/profile",
    "/profile",
    "/me",
  ]

  for (const endpoint of endpoints) {
    try {
      console.debug(`[Endpoint Probe] Trying ${endpoint}...`)
      // Try a HEAD request first (lightweight), fall back to GET
      const response = await axiosInstance.get(endpoint, {
        validateStatus: (status: number) => status < 500, // Accept any 2xx/3xx/4xx
      })

      console.debug(`[Endpoint Probe] ${endpoint} → ${response.status}`)

      // If we get 200 or 401 (auth required), consider it found
      if (response.status === 200 || response.status === 401) {
        discoveredProfileEndpoint = endpoint
        console.log(`✓ [Endpoint Probe] Discovered profile endpoint: ${endpoint}`)
        return endpoint
      }
    } catch (error: any) {
      console.debug(`[Endpoint Probe] ${endpoint} failed:`, error?.message || error)
      // Continue to next endpoint on error
      continue
    }
  }

  // Default to /auth/me if nothing found (since we know that's the route now)
  console.warn(`⚠ [Endpoint Probe] Could not auto-discover profile endpoint, falling back to /auth/me`)
  discoveredProfileEndpoint = "/auth/me"
  return discoveredProfileEndpoint
}

// Export function to reset discovery (useful for testing)
export function resetDiscovery() {
  discoveredProfileEndpoint = null
  console.debug(`[Endpoint Probe] Discovery cache cleared`)
}
