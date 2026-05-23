import * as THREE from 'three'

export function buildTransistor(x = 3.4, z = -0.8, variant = 'NPN') {
  const g = new THREE.Group()
  g.position.set(x, 0, z)
  const metal = new THREE.MeshStandardMaterial({ color: "#cbd5e1", metalness: 0.9, roughness: 0.1 })

  const bodyColor = variant === 'PNP' ? '#1e3a5f' : '#0f172a'
  const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.7 })

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.42, 16, 1, false, 0, Math.PI), bodyMat)
  body.position.y = 0.51
  const flat = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.42, 16, 1, false, Math.PI, Math.PI), bodyMat)
  flat.position.y = 0.51
  g.add(body, flat)

  const bandColor = variant === 'PNP' ? '#22d3ee' : '#4ade80'
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.205, 0.205, 0.06, 16),
    new THREE.MeshBasicMaterial({ color: bandColor })
  )
  band.position.y = 0.69
  g.add(band)

  const leadGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8)
  ;[-0.18, 0, 0.18].forEach(px => {
    const l = new THREE.Mesh(leadGeom, metal)
    l.position.set(px, 0.22, 0)
    g.add(l)
  })
  return g
}
