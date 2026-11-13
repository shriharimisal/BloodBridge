// Simulates network latency for mock services. Remove when real APIs are connected.
export const delay = (data, ms = 400) => new Promise((resolve) => setTimeout(() => resolve(data), ms))
