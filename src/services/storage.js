import { SAMPLE_COMMUNITY_CIRCUITS } from '../data/partsRegistry'

export function saveProject(data) {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `circuit-${data.preset}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function loadProjectFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function initCommunityLibrary() {
  if (!localStorage.getItem('communityCircuits')) {
    localStorage.setItem('communityCircuits', JSON.stringify(SAMPLE_COMMUNITY_CIRCUITS))
  }
}

export function getCommunityCircuits() {
  return JSON.parse(localStorage.getItem('communityCircuits') || '[]')
}

export function saveCommunityCircuits(circuits) {
  localStorage.setItem('communityCircuits', JSON.stringify(circuits))
}

export function getMyCircuits() {
  return JSON.parse(localStorage.getItem('myCircuits') || '[]')
}

export function saveMyCircuits(circuits) {
  localStorage.setItem('myCircuits', JSON.stringify(circuits))
}
