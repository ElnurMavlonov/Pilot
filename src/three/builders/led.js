import * as THREE from 'three'

export function buildLED(x = 2.5, z = -0.8, variant = 'red') {
  const led = new THREE.Group()
  led.position.set(x, 0, z)

  const colorMap = { red: "#ef4444", green: "#22c55e", blue: "#3b82f6" }
  const ledColor = colorMap[variant] || colorMap.red

  const ledMat = new THREE.MeshStandardMaterial({
    color: ledColor,
    emissive: "#000000",
    transparent: true,
    opacity: 0.9,
    roughness: 0.1
  })

  const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 16), ledMat)
  dome.position.y = 1.0
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), ledMat)
  tip.position.y = 1.2
  led.add(dome, tip)

  const metal = new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.9 })
  const pinGeom = new THREE.CylinderGeometry(0.02, 0.02, 1.0, 8)
  const pin1 = new THREE.Mesh(pinGeom, metal)
  pin1.position.set(-0.15, 0.5, 0)
  const pin2 = new THREE.Mesh(pinGeom, metal)
  pin2.position.set(0.15, 0.5, 0)
  led.add(pin1, pin2)

  const glow = new THREE.PointLight(ledColor, 0, 5)
  glow.position.set(0, 1.3, 0)
  led.add(glow)

  return led
}
