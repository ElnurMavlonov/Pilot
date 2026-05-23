import * as THREE from 'three'

export function buildCapacitor(x = 3.4, z = -0.8, variant = 'electrolytic') {
  const g = new THREE.Group()
  g.position.set(x, 0, z)
  const metal = new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.9, roughness: 0.1 })

  if (variant === 'electrolytic') {
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.7, 16),
      new THREE.MeshStandardMaterial({ color: "#1e3a5f", roughness: 0.5 })
    )
    body.position.y = 0.65
    g.add(body)

    const stripe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.185, 0.185, 0.12, 16),
      new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 0.6 })
    )
    stripe.position.y = 0.97
    g.add(stripe)

    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: "#94a3b8", metalness: 0.7 })
    )
    top.position.y = 1.04
    g.add(top)

    const leadGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8)
    const l1 = new THREE.Mesh(leadGeom, metal); l1.position.set(-0.08, 0.22, 0)
    const l2 = new THREE.Mesh(leadGeom, metal); l2.position.set(0.08, 0.22, 0)
    g.add(l1, l2)
  } else {
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: "#b45309", roughness: 0.7 })
    )
    disc.position.y = 0.42
    g.add(disc)

    const leadGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8)
    const l1 = new THREE.Mesh(leadGeom, metal); l1.position.set(-0.1, 0.22, 0)
    const l2 = new THREE.Mesh(leadGeom, metal); l2.position.set(0.1, 0.22, 0)
    g.add(l1, l2)
  }
  return g
}
