const prefix = 'bloodbridge.demo.'

export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(`${prefix}${key}`)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(`${prefix}${key}`, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
