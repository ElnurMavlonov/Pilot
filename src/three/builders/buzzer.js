import * as THREE from 'three'

export function buildPiezoBuzzer(x = 2.5, z = 0.8) {
  const buzzer = new THREE.Group()
  buzzer.position.set(x, 0, z)

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.6, 24),
    new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.8 })
  )
  body.position.y = 0.5
  buzzer.add(body)

  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16),
    new THREE.MeshBasicMaterial({ color: "#020617" })
  )
  inner.position.y = 0.8
  buzzer.add(inner)

  return buzzer
}
