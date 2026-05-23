import * as THREE from 'three'

export function buildButton(x = 2.5, z = 1.8) {
  const btn = new THREE.Group()
  btn.position.set(x, 0.13, z)

  const casing = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.2, 0.45),
    new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.7 })
  )
  casing.position.y = 0.1
  btn.add(casing)

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.15, 12),
    new THREE.MeshStandardMaterial({ color: "#f43f5e", roughness: 0.2 })
  )
  cap.position.y = 0.25
  btn.add(cap)

  return btn
}
