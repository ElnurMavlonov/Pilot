export function encodeCircuitState(state) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))))
}

export function decodeCircuitState(encoded) {
  return JSON.parse(decodeURIComponent(escape(atob(encoded))))
}

export function buildShareUrl(state) {
  const encoded = encodeCircuitState(state)
  return `${location.origin}${location.pathname}?c=${encoded}`
}

export function getSharedStateFromUrl() {
  const params = new URLSearchParams(location.search)
  const encoded = params.get('c')
  if (!encoded) return null
  try {
    return decodeCircuitState(encoded)
  } catch {
    return null
  }
}
