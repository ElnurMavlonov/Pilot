import * as THREE from 'three'

export function buildArduinoBoard(x = -2.5, z = 0) {
  const board = new THREE.Group()
  board.position.set(x, 0, z)

  const pcbGeom = new THREE.BoxGeometry(4.2, 0.1, 5.8)
  const pcbMat = new THREE.MeshStandardMaterial({ color: "#1e3a5f", roughness: 0.5 })
  board.add(new THREE.Mesh(pcbGeom, pcbMat))

  const silver = new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.9, roughness: 0.1 })
  const darkMat = new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.8 })

  const usb = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 1.4), silver)
  usb.position.set(-1.4, 0.25, -2.4)
  board.add(usb)

  const jack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 1.2), darkMat)
  jack.position.set(1.4, 0.3, -2.5)
  board.add(jack)

  const mcu = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 1.8), darkMat)
  mcu.position.set(0.6, 0.08, 0.6)
  board.add(mcu)

  const pinRailGeom = new THREE.BoxGeometry(0.25, 0.35, 3.2)
  const rail1 = new THREE.Mesh(pinRailGeom, darkMat)
  rail1.position.set(-1.8, 0.18, -0.6)
  const rail2 = new THREE.Mesh(pinRailGeom, darkMat)
  rail2.position.set(1.8, 0.18, -0.6)
  board.add(rail1, rail2)

  return board
}
