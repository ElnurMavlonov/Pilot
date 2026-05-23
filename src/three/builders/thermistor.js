import * as THREE from 'three'

export function buildThermistor(x = 3.4, z = -0.8) {
  const g = new THREE.Group()
  g.position.set(x, 0, z)
  const metal = new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.9, roughness: 0.1 })

  const bead = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 16),
    new THREE.MeshStandardMaterial({ color: "#292524", roughness: 0.8 })
  )
  bead.position.y = 0.48
  g.add(bead)

  const leadGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8)
  const l1 = new THREE.Mesh(leadGeom, metal); l1.position.set(-0.09, 0.25, 0)
  const l2 = new THREE.Mesh(leadGeom, metal); l2.position.set(0.09, 0.25, 0)
  g.add(l1, l2)
  return g
}
