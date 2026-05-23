import * as THREE from 'three'

export function buildBreadboard(x = 2.5, z = 0) {
  const breadboard = new THREE.Group()
  breadboard.position.set(x, 0, z)

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.25, 8.5),
    new THREE.MeshStandardMaterial({ color: "#fafafa", roughness: 0.9 })
  )
  breadboard.add(base)

  const holeGeom = new THREE.BoxGeometry(0.06, 0.02, 0.06)
  const holeMat = new THREE.MeshBasicMaterial({ color: "#475569" })
  const holes = new THREE.Group()

  for (let zz = -3.8; zz <= 3.8; zz += 0.3) {
    for (let xx = -1.2; xx <= -0.4; xx += 0.2) {
      const h = new THREE.Mesh(holeGeom, holeMat)
      h.position.set(xx, 0.13, zz)
      holes.add(h)
    }
    for (let xx = 0.4; xx <= 1.2; xx += 0.2) {
      const h = new THREE.Mesh(holeGeom, holeMat)
      h.position.set(xx, 0.13, zz)
      holes.add(h)
    }
  }
  breadboard.add(holes)

  const railGeom = new THREE.BoxGeometry(0.04, 0.01, 7.6)
  const redRail = new THREE.Mesh(railGeom, new THREE.MeshBasicMaterial({ color: "#ef4444" }))
  redRail.position.set(1.5, 0.13, 0)
  const blueRail = new THREE.Mesh(railGeom, new THREE.MeshBasicMaterial({ color: "#3b82f6" }))
  blueRail.position.set(1.6, 0.13, 0)
  breadboard.add(redRail, blueRail)

  return breadboard
}
