import { useRef, useState, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Text, Line } from '@react-three/drei'
import * as THREE from 'three'
import { labToRgb, labToRgbStr, getTone } from '../utils/colorUtils.js'

// ── Individual Color Sphere ──────────────────────────────────────
function ColorSphere({ item, isSelected, isHovered, onSelect, onHover, scale = 1 }) {
  const meshRef = useRef()
  const [localHover, setLocalHover] = useState(false)

  const [r, g, b] = useMemo(() => labToRgb(item.l, item.a, item.b), [item.l, item.a, item.b])
  const color = useMemo(() => new THREE.Color(r, g, b), [r, g, b])

  const targetScale = isSelected ? 2.2 : (isHovered || localHover) ? 1.7 : 1.0
  const currentScale = useRef(1.0)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    currentScale.current += (targetScale - currentScale.current) * Math.min(1, delta * 12)
    const s = currentScale.current * scale
    meshRef.current.scale.setScalar(s)

    // pulse for selected
    if (isSelected) {
      const pulse = 1 + Math.sin(Date.now() * 0.003) * 0.08
      meshRef.current.scale.setScalar(s * pulse)
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[item.a, item.l - 50, item.b]}
      onClick={(e) => { e.stopPropagation(); onSelect(item) }}
      onPointerEnter={(e) => { e.stopPropagation(); setLocalHover(true); onHover(item) }}
      onPointerLeave={(e) => { e.stopPropagation(); setLocalHover(false); onHover(null) }}
    >
      <sphereGeometry args={[2.4, 32, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.88}
        metalness={0}
        emissive={color}
        emissiveIntensity={isSelected ? 0.22 : isHovered || localHover ? 0.14 : 0.04}
      />
    </mesh>
  )
}

// ── Axis Lines & Labels ──────────────────────────────────────────
function AxisSystem({ show }) {
  if (!show) return null
  const len = 110
  const offset = -50 // L* centering: L* range 0-100, centered at 50

  return (
    <group>
      {/* L* axis (Y) - Red */}
      <Line points={[[0, -len + offset, 0], [0, len + offset, 0]]} color="#ef4444" lineWidth={1.5} opacity={0.6} transparent />
      <Text position={[0, len + offset + 10, 0]} fontSize={5} color="#ef4444" anchorX="center" font={undefined}>L*</Text>
      <Text position={[0, -len + offset - 10, 0]} fontSize={3.5} color="#ef4444" anchorX="center" font={undefined}>0</Text>
      <Text position={[0, len + offset + 2, 0]} fontSize={3.5} color="#ef4444" anchorX="center" font={undefined}>100</Text>

      {/* a* axis (X) - Green */}
      <Line points={[[-len, 0, 0], [len, 0, 0]]} color="#22c55e" lineWidth={1.5} opacity={0.6} transparent />
      <Text position={[len + 10, 0, 0]} fontSize={5} color="#22c55e" anchorX="center" font={undefined}>a*</Text>
      <Text position={[-len - 8, 0, 0]} fontSize={3.5} color="#22c55e" anchorX="center" font={undefined}>G</Text>
      <Text position={[len + 8, 0, 3]} fontSize={3.5} color="#22c55e" anchorX="center" font={undefined}>R</Text>

      {/* b* axis (Z) - Blue */}
      <Line points={[[0, 0, -len], [0, 0, len]]} color="#3b82f6" lineWidth={1.5} opacity={0.6} transparent />
      <Text position={[0, 0, len + 10]} fontSize={5} color="#3b82f6" anchorX="center" font={undefined}>b*</Text>
      <Text position={[0, 0, -len - 8]} fontSize={3.5} color="#3b82f6" anchorX="center" font={undefined}>B</Text>
      <Text position={[0, 0, len + 8]} fontSize={3.5} color="#3b82f6" anchorX="center" font={undefined}>Y</Text>

      {/* Center cross lines (faint) */}
      <Line points={[[-len, 0, 0], [len, 0, 0]]} color="#1e293b" lineWidth={0.5} opacity={0.3} transparent />
      <Line points={[[0, 0, -len], [0, 0, len]]} color="#1e293b" lineWidth={0.5} opacity={0.3} transparent />
    </group>
  )
}

// ── Grid ────────────────────────────────────────────────────────
function GridPlane({ show }) {
  if (!show) return null
  return (
    <gridHelper args={[240, 24, '#0f172a', '#1e293b']} position={[0, -50, 0]} />
  )
}

// ── Hover Tooltip (3D space) ─────────────────────────────────────
function HoverLabel({ item, lang }) {
  if (!item) return null
  const name = lang === 'ko' ? item.nameKo : item.nameEn
  return (
    <group position={[item.a, item.l - 50 + 8, item.b]}>
      <Text
        fontSize={4}
        color="white"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.5}
        outlineColor="black"
        font={undefined}
      >
        {item.code}
      </Text>
    </group>
  )
}

// ── Scene Content ────────────────────────────────────────────────
function SceneContent({
  data, selected, hovered, onSelect, onHover, autoRotate, showAxes, showGrid, lang
}) {
  const orbitRef = useRef()

  useFrame(() => {
    if (orbitRef.current) {
      orbitRef.current.autoRotate = autoRotate
    }
  })

  return (
    <>
      <color attach="background" args={['#0a0f1e']} />
      <fog attach="fog" args={['#0a0f1e', 300, 700]} />

      <ambientLight intensity={1.1} />
      <directionalLight position={[150, 250, 150]} intensity={0.55} />
      <directionalLight position={[-150, -100, -150]} intensity={0.2} color="#4f46e5" />
      <pointLight position={[0, 100, 0]} intensity={0.25} color="#6366f1" distance={300} />

      <OrbitControls
        ref={orbitRef}
        enableDamping
        dampingFactor={0.06}
        autoRotateSpeed={0.6}
        minDistance={30}
        maxDistance={600}
      />

      <AxisSystem show={showAxes} />
      <GridPlane show={showGrid} />

      {data.map(item => (
        <ColorSphere
          key={item.id}
          item={item}
          isSelected={selected?.id === item.id}
          isHovered={hovered?.id === item.id}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}

      <HoverLabel item={hovered} lang={lang} />
    </>
  )
}

// ── HTML Tooltip Overlay ─────────────────────────────────────────
function TooltipOverlay({ color, lang }) {
  if (!color) return null

  const name = lang === 'ko' ? color.nameKo : color.nameEn
  const commonName = lang === 'ko' ? color.commonKo : color.commonEn
  const rgbStr = labToRgbStr(color.l, color.a, color.b)

  return (
    <div style={tooltipStyles.wrap}>
      <div style={tooltipStyles.swatch(rgbStr)} />
      <div style={tooltipStyles.body}>
        <div style={tooltipStyles.code}>{color.code}</div>
        <div style={tooltipStyles.name}>{name}</div>
        {commonName && <div style={tooltipStyles.common}>{commonName}</div>}
        <div style={tooltipStyles.lab}>
          <span>L* {color.l?.toFixed(2)}</span>
          <span>a* {color.a?.toFixed(2)}</span>
          <span>b* {color.b?.toFixed(2)}</span>
        </div>
        {color.munsell && <div style={tooltipStyles.munsell}>{color.munsell}</div>}
      </div>
    </div>
  )
}

const tooltipStyles = {
  wrap: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'rgba(15,23,42,0.92)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '12px 16px',
    backdropFilter: 'blur(12px)',
    pointerEvents: 'none',
    zIndex: 20,
    minWidth: 200,
    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
  },
  swatch: (bg) => ({
    width: 44,
    height: 44,
    borderRadius: 8,
    background: bg,
    border: '1px solid rgba(255,255,255,0.15)',
    flexShrink: 0,
  }),
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#6366f1',
    letterSpacing: '0.08em',
    fontWeight: 600,
  },
  name: {
    fontSize: 14,
    color: '#f1f5f9',
    fontWeight: 600,
  },
  common: {
    fontSize: 11,
    color: '#64748b',
  },
  lab: {
    display: 'flex',
    gap: 8,
    fontSize: 10,
    color: '#475569',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  munsell: {
    fontSize: 10,
    color: '#334155',
    fontFamily: 'monospace',
  },
}

// ── Main Export ──────────────────────────────────────────────────
export default function ColorScene3D({
  data, allData, selected, hovered, onSelect, onHover,
  autoRotate, showAxes, showGrid, lang,
}) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [120, 80, 160], fov: 55, near: 1, far: 1500 }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        style={{ width: '100%', height: '100%' }}
      >
        <SceneContent
          data={data}
          selected={selected}
          hovered={hovered}
          onSelect={onSelect}
          onHover={onHover}
          autoRotate={autoRotate}
          showAxes={showAxes}
          showGrid={showGrid}
          lang={lang}
        />
      </Canvas>
      <TooltipOverlay color={hovered || selected} lang={lang} />
    </div>
  )
}
