import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { BUILDERS } from './builders'

export class SceneManager {
  constructor(container) {
    this.container = container
    this.scene = new THREE.Scene()
    this.camera = null
    this.renderer = null
    this.controls = null
    this.meshGroup = null
    this.customMeshes = {}
    this.activeWireMeshes = []
    this.placedComponents = []
    this.selectedComponent = null
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    this.draggedPartData = null
    this.dragComponent = null
    this.dragHasMoved = false
    this.pointerDownPos = { x: 0, y: 0 }
    this.isFreeBuildMode = false
    this._animId = null

    this.onComponentPlaced = null
    this.onComponentSelected = null
    this.onComponentDeselected = null
    this.onComponentDeleted = null
    this.onContextMenu = null
  }

  init() {
    this.scene.background = new THREE.Color("#e8edf2")

    this.camera = new THREE.PerspectiveCamera(
      45, this.container.clientWidth / this.container.clientHeight, 0.1, 100
    )
    this.camera.position.set(0, 12, 12)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05
    this.controls.minDistance = 3
    this.controls.maxDistance = 20

    this.scene.add(new THREE.AmbientLight("#ffffff", 0.75))
    const spot = new THREE.DirectionalLight("#ffffff", 0.85)
    spot.position.set(5, 12, 5)
    spot.castShadow = true
    spot.shadow.mapSize.width = 1024
    spot.shadow.mapSize.height = 1024
    this.scene.add(spot)

    const pointGlow = new THREE.PointLight("#e0e8ff", 0.2, 15)
    pointGlow.position.set(-3, 2, -3)
    this.scene.add(pointGlow)

    const grid = new THREE.GridHelper(30, 30, "#b8c4d0", "#cdd5df")
    grid.position.y = -0.05
    this.scene.add(grid)

    this.meshGroup = new THREE.Group()
    this.scene.add(this.meshGroup)

    this._buildPresetMeshes()
    this._setupInteractions()

    window.addEventListener("resize", this._onResize)
    this._renderLoop()
  }

  _buildPresetMeshes() {
    const add = (key, builder, ...args) => {
      const mesh = builder(...args)
      this.meshGroup.add(mesh)
      this.customMeshes[key] = mesh
    }
    add("board", BUILDERS.arduino, -2.5, 0)
    add("breadboard", BUILDERS.breadboard, 2.5, 0)
    add("led", BUILDERS.led, 2.5, -0.8, 'red')
    add("resistor", BUILDERS.resistor, 3.4, -0.8, '220')
    add("buzzer", BUILDERS.buzzer, 2.5, 0.8)
    add("button", BUILDERS.button, 2.5, 1.8)
    add("ldr", BUILDERS.ldr, 2.5, -1.8)
    add("capacitor_electro", BUILDERS.capacitor, 3.4, 0.2, 'electrolytic')
    add("capacitor_ceramic", BUILDERS.capacitor, 3.4, 1.2, 'ceramic')
    add("potentiometer", BUILDERS.potentiometer, 3.4, -1.8)
    add("thermistor", BUILDERS.thermistor, 3.4, -2.8)
    add("npn", BUILDERS.transistor, 4.5, 0, 'NPN')
    add("pnp", BUILDERS.transistor, 4.5, 1.0, 'PNP')
  }

  _setupInteractions() {
    const canvas = this.renderer.domElement

    this.container.addEventListener('dragover', e => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
      this.container.classList.add('drag-over')
    })
    this.container.addEventListener('dragleave', e => {
      if (!this.container.contains(e.relatedTarget)) {
        this.container.classList.remove('drag-over')
      }
    })
    this.container.addEventListener('drop', e => {
      e.preventDefault()
      this.container.classList.remove('drag-over')
      if (!this.draggedPartData) return
      const pos = this.getDropWorldPosition(e)
      if (!pos) return
      const snapped = this.snapToGrid(pos.x, pos.z)
      this.onComponentPlaced?.(this.draggedPartData.type, this.draggedPartData.variant, snapped.x, snapped.z)
      this.draggedPartData = null
    })

    canvas.addEventListener('pointerdown', this._onPointerDown)
    canvas.addEventListener('pointermove', this._onPointerMove)
    canvas.addEventListener('pointerup', this._onPointerUp)
    canvas.addEventListener('contextmenu', this._onContextMenu)
  }

  _onPointerDown = (e) => {
    if (!this.isFreeBuildMode || e.button !== 0) return
    const hit = this.raycastPlacedComponents(e)
    if (!hit) return
    e.stopPropagation()
    this.renderer.domElement.setPointerCapture(e.pointerId)
    this.dragComponent = hit
    this.dragHasMoved = false
    this.pointerDownPos = { x: e.clientX, y: e.clientY }
    this.controls.enabled = false
  }

  _onPointerMove = (e) => {
    if (this.dragComponent) {
      const dx = e.clientX - this.pointerDownPos.x
      const dz = e.clientY - this.pointerDownPos.y
      if (!this.dragHasMoved && (dx * dx + dz * dz) > 25) {
        this.dragHasMoved = true
        this.selectComponent(this.dragComponent)
        this.renderer.domElement.style.cursor = 'grabbing'
      }
      if (!this.dragHasMoved) return
      const pos = this.getDropWorldPosition(e)
      if (pos) {
        this.dragComponent.position.x = pos.x
        this.dragComponent.position.z = pos.z
      }
      return
    }
    if (!this.isFreeBuildMode) return
    this.renderer.domElement.style.cursor = this.raycastPlacedComponents(e) ? 'grab' : ''
  }

  _onPointerUp = (e) => {
    if (e.button !== 0) return
    if (this.dragComponent) {
      this.controls.enabled = true
      this.renderer.domElement.style.cursor = 'grab'
      if (this.dragHasMoved) {
        const s = this.snapToGrid(this.dragComponent.position.x, this.dragComponent.position.z)
        this.dragComponent.position.x = s.x
        this.dragComponent.position.z = s.z
        this.onComponentSelected?.(this.dragComponent.userData.instanceId, true)
      } else {
        const already = this.selectedComponent === this.dragComponent
        if (already) {
          this.deselectComponent()
        } else {
          this.selectComponent(this.dragComponent)
        }
      }
      this.dragComponent = null
      this.dragHasMoved = false
    } else if (this.isFreeBuildMode) {
      const hit = this.raycastPlacedComponents(e)
      if (hit) {
        this.selectComponent(hit)
      } else {
        this.deselectComponent()
      }
    }
  }

  _onContextMenu = (e) => {
    e.preventDefault()
    if (!this.isFreeBuildMode) return
    const hit = this.raycastPlacedComponents(e)
    if (!hit) return
    this.selectComponent(hit)
    this.onContextMenu?.(e.clientX, e.clientY, hit.userData)
  }

  _onResize = () => {
    if (!this.container || !this.camera || !this.renderer) return
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  triggerResize() {
    this._onResize()
  }

  _renderLoop = () => {
    this._animId = requestAnimationFrame(this._renderLoop)
    this.controls.update()
    if (this.customMeshes["board"]) {
      this.customMeshes["board"].position.y = Math.sin(performance.now() * 0.0015) * 0.05
    }
    if (this.customMeshes["breadboard"]) {
      this.customMeshes["breadboard"].position.y = Math.sin(performance.now() * 0.0015) * 0.05
    }
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    if (this._animId) cancelAnimationFrame(this._animId)
    window.removeEventListener("resize", this._onResize)
    this.renderer?.dispose()
    this.controls?.dispose()
    if (this.renderer?.domElement?.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
    }
  }

  // --- Public API ---

  glideCamera(target, look) {
    const start = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z }
    const startTime = performance.now()
    const duration = 900
    const controls = this.controls
    const camera = this.camera

    const animate = (time) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2

      camera.position.set(
        start.x + (target.x - start.x) * ease,
        start.y + (target.y - start.y) * ease,
        start.z + (target.z - start.z) * ease
      )
      controls.target.set(
        look.x * ease + controls.target.x * (1 - ease),
        look.y * ease + controls.target.y * (1 - ease),
        look.z * ease + controls.target.z * (1 - ease)
      )
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }

  rebuildWires(wiresData) {
    this.activeWireMeshes.forEach(wire => this.scene.remove(wire))
    this.activeWireMeshes = []
    wiresData.forEach(wire => {
      const vectorList = wire.path.map(p => new THREE.Vector3(p[0], p[1], p[2]))
      const path = new THREE.CatmullRomCurve3(vectorList)
      const geom = new THREE.TubeGeometry(path, 32, 0.06, 8, false)
      const mat = new THREE.MeshStandardMaterial({ color: wire.color, roughness: 0.6, metalness: 0.1 })
      const tube = new THREE.Mesh(geom, mat)
      tube.name = wire.type
      this.scene.add(tube)
      this.activeWireMeshes.push(tube)
    })
  }

  updateVisibilities(visibleList) {
    Object.keys(this.customMeshes).forEach(key => {
      this.customMeshes[key].visible = visibleList.includes(key)
    })
    this.activeWireMeshes.forEach(wire => {
      wire.visible = visibleList.includes(wire.name)
    })
  }

  createComponent(type, variant, x, z, instanceId) {
    const builder = BUILDERS[type]
    if (!builder) return null
    const group = type === 'led' || type === 'resistor' || type === 'capacitor' || type === 'transistor'
      ? builder(x, z, variant)
      : builder(x, z)
    group.userData = { instanceId, type, variant: variant || null, isFreePlaced: true }
    this.scene.add(group)
    this.placedComponents.push(group)
    return group
  }

  removeComponent(instanceId) {
    const idx = this.placedComponents.findIndex(g => g.userData.instanceId === instanceId)
    if (idx === -1) return
    const g = this.placedComponents[idx]
    if (g === this.selectedComponent) this.selectedComponent = null
    this.scene.remove(g)
    this.placedComponents.splice(idx, 1)
  }

  selectComponent(group) {
    this.deselectComponent()
    this.selectedComponent = group
    group.traverse(c => {
      if (c.isMesh && c.material && c.material.emissive) {
        c.userData._origEmissive = c.material.emissive.getHex()
        c.userData._origEmissiveIntensity = c.material.emissiveIntensity || 0
        c.material.emissive.setHex(0x334155)
        c.material.emissiveIntensity = 0.45
      }
    })
    this.onComponentSelected?.(group.userData.instanceId, false)
  }

  deselectComponent() {
    if (!this.selectedComponent) return
    this.selectedComponent.traverse(c => {
      if (c.isMesh && c.material && c.userData._origEmissive !== undefined) {
        c.material.emissive.setHex(c.userData._origEmissive)
        c.material.emissiveIntensity = c.userData._origEmissiveIntensity
      }
    })
    this.selectedComponent = null
    this.onComponentDeselected?.()
  }

  setLEDOutput(state) {
    const led = this.customMeshes["led"]
    if (!led) return
    const material = led.children[0].material
    const light = led.children[4]
    material.emissive.setHex(state ? 0xef4444 : 0x000000)
    light.intensity = state ? 1.8 : 0
  }

  setBuzzerOutput(state, freq) {
    const buzzer = this.customMeshes["buzzer"]
    if (!buzzer) return
    buzzer.position.y = state ? 0.05 : 0
    this.renderer.setClearColor(new THREE.Color(state ? "#fef3c7" : "#e8edf2"), 1.0)
  }

  resetOutputs() {
    this.setLEDOutput(false)
    this.setBuzzerOutput(false)
    this.renderer.setClearColor(new THREE.Color("#e8edf2"), 1.0)
  }

  setLDRRotation(level) {
    const ldr = this.customMeshes["ldr"]
    if (ldr) ldr.rotation.y = (level / 100) * Math.PI
  }

  setButtonPress(isPressed) {
    const btn = this.customMeshes["button"]
    if (btn) btn.children[1].position.y = isPressed ? 0.18 : 0.25
  }

  enterFreeBuildMode() {
    this.isFreeBuildMode = true
    Object.values(this.customMeshes).forEach(m => { if (m) m.visible = false })
    this.activeWireMeshes.forEach(w => { w.visible = false })
    this.placedComponents.forEach(g => { g.visible = true })
    this.glideCamera({ x: 0, y: 15, z: 8 }, { x: 0, y: 0, z: 0 })
  }

  enterPresetMode() {
    this.isFreeBuildMode = false
    this.placedComponents.forEach(g => { g.visible = false })
    this.deselectComponent()
  }

  getDropWorldPosition(e) {
    const rect = this.container.getBoundingClientRect()
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1
    const ray = new THREE.Raycaster()
    ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera)
    const target = new THREE.Vector3()
    return ray.ray.intersectPlane(this.groundPlane, target) ? target : null
  }

  raycastPlacedComponents(e) {
    if (!this.placedComponents.length) return null
    const rect = this.renderer.domElement.getBoundingClientRect()
    const ray = new THREE.Raycaster()
    ray.setFromCamera(new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    ), this.camera)
    const allMeshes = []
    this.placedComponents.forEach(g => g.traverse(c => { if (c.isMesh) allMeshes.push(c) }))
    const hits = ray.intersectObjects(allMeshes, false)
    if (!hits.length) return null
    let obj = hits[0].object
    while (obj.parent && !obj.userData.isFreePlaced) obj = obj.parent
    return obj.userData.isFreePlaced ? obj : null
  }

  snapToGrid(x, z, g = 0.5) {
    return { x: Math.round(x / g) * g, z: Math.round(z / g) * g }
  }

  getPlacedComponentsSnapshot() {
    return this.placedComponents.map(g => ({
      type: g.userData.type,
      variant: g.userData.variant || null,
      x: parseFloat(g.position.x.toFixed(3)),
      z: parseFloat(g.position.z.toFixed(3)),
      instanceId: g.userData.instanceId,
    }))
  }

  clearPlacedComponents() {
    this.placedComponents.forEach(g => this.scene.remove(g))
    this.placedComponents = []
    this.selectedComponent = null
  }
}
