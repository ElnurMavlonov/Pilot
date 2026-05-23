import * as THREE from 'three'

export function buildPotentiometer(x = 3.4, z = -0.8) {
  const g = new THREE.Group()
  g.position.set(x, 0, z)
  const metal = new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.9, roughness: 0.1 })

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.42, 0.55),
    new THREE.MeshStandardMaterial({ color: "#1d4ed8", roughness: 0.6 })
  )
  body.position.y = 0.41
  g.add(body)

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 12), metal)
  shaft.position.y = 0.73
  g.add(shaft)

  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: "#334155", roughness: 0.4 })
  )
  knob.position.y = 0.87
  g.add(knob)

  const leadGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8)
  ;[-0.18, 0, 0.18].forEach(px => {
    const l = new THREE.Mesh(leadGeom, metal)
    l.position.set(px, 0.2, 0)
    g.add(l)
  })
  return g
}
