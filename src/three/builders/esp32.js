import * as THREE from 'three'

export function buildESP32(x = 0, z = 0) {
  const board = new THREE.Group()
  board.position.set(x, 0, z)

  const pcbMat = new THREE.MeshStandardMaterial({ color: "#1a3a2a", roughness: 0.5 })
  board.add(new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 4.2), pcbMat))

  const ant = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 1.0), pcbMat)
  ant.position.set(0, 0, -2.6)
  board.add(ant)

  const silver = new THREE.MeshStandardMaterial({ color: "#94a3b8", metalness: 0.9, roughness: 0.1 })
  const shield = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 1.6), silver)
  shield.position.set(0, 0.19, -0.5)
  board.add(shield)

  const darkMat = new THREE.MeshStandardMaterial({ color: "#0f172a" })
  const rail1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 3.4), darkMat)
  rail1.position.set(-1.3, 0.15, 0.2)
  const rail2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 3.4), darkMat)
  rail2.position.set(1.3, 0.15, 0.2)
  board.add(rail1, rail2)

  return board
}
