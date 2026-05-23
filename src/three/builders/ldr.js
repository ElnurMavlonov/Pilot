import * as THREE from 'three'

export function buildLDR(x = 2.5, z = -1.8) {
  const ldr = new THREE.Group()
  ldr.position.set(x, 0.2, z)

  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16),
    new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 0.5 })
  )
  head.position.y = 0.4
  ldr.add(head)

  const line = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.02, 0.03),
    new THREE.MeshBasicMaterial({ color: "#f97316" })
  )
  line.position.set(0, 0.45, 0)
  ldr.add(line)

  const metal = new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.9 })
  const leadGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8)
  const pin1 = new THREE.Mesh(leadGeom, metal); pin1.position.set(-0.1, 0.2, 0)
  const pin2 = new THREE.Mesh(leadGeom, metal); pin2.position.set(0.1, 0.2, 0)
  ldr.add(pin1, pin2)

  return ldr
}
