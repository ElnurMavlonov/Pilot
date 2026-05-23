import * as THREE from 'three'

export function buildResistor(x = 3.4, z = -0.8, variant = '220') {
  const r = new THREE.Group()
  r.position.set(x, 0.4, z)

  const bodyGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.45, 12)
  bodyGeom.rotateZ(Math.PI / 2)
  const body = new THREE.Mesh(bodyGeom, new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.6 }))
  r.add(body)

  const stripeGeom = new THREE.CylinderGeometry(0.13, 0.13, 0.04, 12)
  stripeGeom.rotateZ(Math.PI / 2)
  const bandSchemes = {
    '220': ["#ef4444", "#ef4444", "#78350f"],
    '1k':  ["#78350f", "#000000", "#ef4444"],
    '10k': ["#78350f", "#000000", "#f97316"]
  }
  const bands = bandSchemes[variant] || bandSchemes['220']
  const positions = [-0.12, 0, 0.12]
  bands.forEach((color, i) => {
    const s = new THREE.Mesh(stripeGeom.clone(), new THREE.MeshBasicMaterial({ color }))
    s.position.x = positions[i]
    r.add(s)
  })

  const metal = new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.9 })
  const leadGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8)
  const l1 = new THREE.Mesh(leadGeom, metal); l1.position.set(-0.22, -0.2, 0)
  const l2 = new THREE.Mesh(leadGeom, metal); l2.position.set(0.22, -0.2, 0)
  r.add(l1, l2)

  return r
}
