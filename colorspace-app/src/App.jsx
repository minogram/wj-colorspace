import { Suspense, lazy, useState, useMemo, useCallback, useEffect } from 'react'
import { colorData } from './colorData.js'
import { getTone, getHue, TONE_INFO } from './utils/colorUtils.js'
import { useIsMobile } from './hooks/useIsMobile.js'
import OfflineExperiencePanel from './components/OfflineExperiencePanel.jsx'
import PwaInstallCard from './components/PwaInstallCard.jsx'

const ALL_TONES = Object.keys(TONE_INFO)
const VIEW_STATE_KEY = 'wj-colorspace:view-state'
const ColorScene3D = lazy(() => import('./components/ColorScene3D.jsx'))
const SidePanel = lazy(() => import('./components/SidePanel.jsx'))
const ColorDetailPanel = lazy(() => import('./components/ColorDetailPanel.jsx'))

function readStoredViewState() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(VIEW_STATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)

    return {
      selectedColorId: typeof parsed.selectedColorId === 'number' ? parsed.selectedColorId : null,
      searchQuery: typeof parsed.searchQuery === 'string' ? parsed.searchQuery : '',
      activeTones: Array.isArray(parsed.activeTones) ? parsed.activeTones.filter(tone => ALL_TONES.includes(tone)) : null,
      activeHues: Array.isArray(parsed.activeHues) ? parsed.activeHues.filter(Boolean) : null,
      autoRotate: Boolean(parsed.autoRotate),
      showAxes: parsed.showAxes !== false,
      showGrid: parsed.showGrid !== false,
      lang: parsed.lang === 'en' ? 'en' : 'ko',
      sidebarOpen: parsed.sidebarOpen !== false,
    }
  } catch {
    return null
  }
}

function restoreSelectedColor(selectedColorId) {
  if (typeof selectedColorId !== 'number') return null
  return colorData.find(color => color.id === selectedColorId) ?? null
}

export default function App() {
  const isMobile = useIsMobile()
  const [initialViewState] = useState(() => readStoredViewState())

  const [selectedColor, setSelectedColor] = useState(() => restoreSelectedColor(initialViewState?.selectedColorId))
  const [hoveredColor, setHoveredColor] = useState(null)
  const [searchQuery, setSearchQuery] = useState(() => initialViewState?.searchQuery ?? '')
  const [activeTones, setActiveTones] = useState(() => {
    if (initialViewState?.activeTones?.length) {
      return new Set(initialViewState.activeTones)
    }

    return new Set(ALL_TONES)
  })
  const [activeHues, setActiveHues] = useState(() => {
    if (initialViewState?.activeHues?.length) {
      return new Set(initialViewState.activeHues)
    }

    return null
  })
  const [autoRotate, setAutoRotate] = useState(() => initialViewState?.autoRotate ?? false)
  const [showAxes, setShowAxes] = useState(() => initialViewState?.showAxes ?? true)
  const [showGrid, setShowGrid] = useState(() => initialViewState?.showGrid ?? true)
  const [lang, setLang] = useState(() => initialViewState?.lang ?? 'ko')
  const [sidebarOpen, setSidebarOpen] = useState(() => initialViewState?.sidebarOpen ?? true)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.navigator.onLine
  })
  const [restoredFromLastView] = useState(() => Boolean(initialViewState))

  useEffect(() => {
    const handleConnectionChange = () => {
      setIsOnline(window.navigator.onLine)
    }

    window.addEventListener('online', handleConnectionChange)
    window.addEventListener('offline', handleConnectionChange)

    return () => {
      window.removeEventListener('online', handleConnectionChange)
      window.removeEventListener('offline', handleConnectionChange)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(VIEW_STATE_KEY, JSON.stringify({
      selectedColorId: selectedColor?.id ?? null,
      searchQuery,
      activeTones: Array.from(activeTones),
      activeHues: activeHues ? Array.from(activeHues) : null,
      autoRotate,
      showAxes,
      showGrid,
      lang,
      sidebarOpen,
    }))
  }, [selectedColor, searchQuery, activeTones, activeHues, autoRotate, showAxes, showGrid, lang, sidebarOpen])

  const filteredData = useMemo(() => {
    return colorData.filter(c => {
      const tone = getTone(c.code)
      if (!activeTones.has(tone)) return false
      if (activeHues && activeHues.size > 0) {
        const hue = getHue(c.code)
        if (!activeHues.has(hue)) return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        return (
          c.code?.toLowerCase().includes(q) ||
          c.nameKo?.toLowerCase().includes(q) ||
          c.nameEn?.toLowerCase().includes(q) ||
          c.commonKo?.toLowerCase().includes(q) ||
          c.commonEn?.toLowerCase().includes(q) ||
          c.munsell?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [searchQuery, activeTones, activeHues])

  const handleSelect = useCallback((color) => {
    setSelectedColor(prev => prev?.id === color?.id ? null : color)
    if (isMobile) setMobileDrawerOpen(false)
  }, [isMobile])

  const toggleTone = useCallback((tone) => {
    setActiveTones(prev => {
      const next = new Set(prev)
      if (next.has(tone)) {
        if (next.size === 1) return prev
        next.delete(tone)
      } else {
        next.add(tone)
      }
      return next
    })
  }, [])

  const toggleAllTones = useCallback(() => {
    setActiveTones(prev =>
      prev.size === ALL_TONES.length ? new Set([ALL_TONES[0]]) : new Set(ALL_TONES)
    )
  }, [])

  const toggleHueHighlight = useCallback((color) => {
    setSelectedColor(color)
    const hue = getHue(color.code)
    setActiveHues(prev => {
      if (prev?.size === 1 && prev.has(hue)) {
        return null
      }

      return new Set([hue])
    })
  }, [])

  const isSelectedHueHighlighted = useMemo(() => {
    if (!selectedColor || !activeHues || activeHues.size !== 1) return false
    return activeHues.has(getHue(selectedColor.code))
  }, [selectedColor, activeHues])

  const resetView = useCallback(() => {
    setSelectedColor(null)
    setSearchQuery('')
    setActiveTones(new Set(ALL_TONES))
    setActiveHues(null)
    setAutoRotate(false)
    setShowAxes(true)
    setShowGrid(true)
  }, [])

  /* ── MOBILE LAYOUT ── */
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <PwaInstallCard isMobile selectedColor={selectedColor} />
        <OfflineExperiencePanel
          isMobile
          isOnline={isOnline}
          restoredFromLastView={restoredFromLastView}
          selectedColor={selectedColor}
          filteredCount={filteredData.length}
          totalCount={colorData.length}
          activeToneCount={activeTones.size}
          activeHueCount={activeHues?.size ?? 0}
          hasSearch={Boolean(searchQuery.trim())}
          onResetView={resetView}
          onClearSelection={() => setSelectedColor(null)}
        />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Suspense fallback={<SceneFallback isMobile />}>
            <ColorScene3D
              data={filteredData}
              allData={colorData}
              selected={selectedColor}
              hovered={hoveredColor}
              onSelect={handleSelect}
              onHover={setHoveredColor}
              autoRotate={autoRotate}
              showAxes={showAxes}
              showGrid={showGrid}
              lang={lang}
              isMobile
            />
          </Suspense>
          <div style={mStyles.topBar}>
            <div style={{ pointerEvents: 'none' }}>
              <div style={mStyles.title}>CIELAB 컬러스페이스</div>
              <div style={mStyles.subtitle}>{filteredData.length} / {colorData.length} 색상</div>
            </div>
            <div style={mStyles.topControls}>
              <MobileToggle active={autoRotate} onClick={() => setAutoRotate(v => !v)}>&#8635;</MobileToggle>
              <MobileToggle active={showAxes} onClick={() => setShowAxes(v => !v)}>&#8862;</MobileToggle>
              {activeHues && (
                <MobileToggle active onClick={() => setActiveHues(null)} title="계열강조 해제">
                  ✦
                </MobileToggle>
              )}
              <MobileToggle active={lang === 'en'} onClick={() => setLang(v => v === 'ko' ? 'en' : 'ko')}>
                {lang === 'ko' ? 'KO' : 'EN'}
              </MobileToggle>
            </div>
          </div>
          {selectedColor && (
            <Suspense fallback={null}>
              <ColorDetailPanel
                color={selectedColor}
                lang={lang}
                isMobile
                onClose={() => setSelectedColor(null)}
                onHighlight={() => toggleHueHighlight(selectedColor)}
                isHighlightActive={isSelectedHueHighlighted}
              />
            </Suspense>
          )}
          {/* ── Copyright (mobile) ── */}
          <div style={mStyles.copyright}>
            <div>Copyright 2026 WJ International</div>
            <div>samchun68@naver.com</div>
            <div>Open Fashion Alliance</div>
            <div>uttu.me</div>
          </div>
        </div>

        <div style={mStyles.bottomNav}>
          <button
            style={Object.assign({}, mStyles.navBtn, !mobileDrawerOpen ? mStyles.navBtnActive : {})}
            onClick={() => setMobileDrawerOpen(false)}
          >
            <span style={mStyles.navIcon}>3D</span>
            <span style={mStyles.navLabel}>3D 뷰</span>
          </button>
          <button
            style={Object.assign({}, mStyles.navBtn, mobileDrawerOpen ? mStyles.navBtnActive : {})}
            onClick={() => setMobileDrawerOpen(v => !v)}
          >
            <span style={mStyles.navIcon}>&#9776;</span>
            <span style={mStyles.navLabel}>색상 목록</span>
          </button>
        </div>

        {mobileDrawerOpen && (
          <>
            <div style={mStyles.backdrop} onClick={() => setMobileDrawerOpen(false)} />
            <div style={mStyles.drawer}>
              <div style={mStyles.drawerHandle} />
              <Suspense fallback={<PanelFallback isMobile />}>
                <SidePanel
                  data={filteredData}
                  allData={colorData}
                  selected={selectedColor}
                  activeTones={activeTones}
                  searchQuery={searchQuery}
                  lang={lang}
                  isMobile
                  onSearchChange={setSearchQuery}
                  onToneToggle={toggleTone}
                  onToggleAll={toggleAllTones}
                  onSelectColor={handleSelect}
                />
              </Suspense>
            </div>
          </>
        )}
      </div>
    )
  }

  /* ── DESKTOP LAYOUT ── */
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <PwaInstallCard selectedColor={selectedColor} />
      <OfflineExperiencePanel
        isOnline={isOnline}
        restoredFromLastView={restoredFromLastView}
        selectedColor={selectedColor}
        filteredCount={filteredData.length}
        totalCount={colorData.length}
        activeToneCount={activeTones.size}
        activeHueCount={activeHues?.size ?? 0}
        hasSearch={Boolean(searchQuery.trim())}
        onResetView={resetView}
        onClearSelection={() => setSelectedColor(null)}
      />
      {/* ── 3D Canvas (keep visible center aligned when overlays are open) ── */}
      <div
        style={{
          position: 'relative',
          width: sidebarOpen ? 'max(0px, calc(100vw - 320px))' : '100vw',
          height: '100vh',
          flexShrink: 0,
        }}
      >
        <Suspense fallback={<SceneFallback />}>
          <ColorScene3D
            data={filteredData}
            allData={colorData}
            selected={selectedColor}
            hovered={hoveredColor}
            onSelect={handleSelect}
            onHover={setHoveredColor}
            autoRotate={autoRotate}
            showAxes={showAxes}
            showGrid={showGrid}
            lang={lang}
          />
        </Suspense>

        {/* ── Top Bar ── */}
        <div style={styles.topBar}>
          <div style={styles.titleWrap}>
            <h1 style={styles.title}>CIELAB 컬러스페이스</h1>
            <p style={styles.subtitle}>
              {filteredData.length} / {colorData.length} 색상 · L* a* b* 3D 시각화
            </p>
          </div>

          <div style={styles.controls}>
            <ToggleBtn active={autoRotate} onClick={() => setAutoRotate(v => !v)} title="자동 회전">
              ↻
            </ToggleBtn>
            <ToggleBtn active={showAxes} onClick={() => setShowAxes(v => !v)} title="축 표시">
              ⊞
            </ToggleBtn>
            <ToggleBtn active={showGrid} onClick={() => setShowGrid(v => !v)} title="그리드 표시">
              ⊟
            </ToggleBtn>
            {activeHues && (
              <ToggleBtn active onClick={() => setActiveHues(null)} title="계열강조 해제">
                ✦
              </ToggleBtn>
            )}
            <ToggleBtn active={lang === 'en'} onClick={() => setLang(v => v === 'ko' ? 'en' : 'ko')} title="언어 전환">
              {lang === 'ko' ? 'KO' : 'EN'}
            </ToggleBtn>
          </div>

          <button
            style={{ ...styles.sidebarToggle }}
            onClick={() => setSidebarOpen(v => !v)}
            title={sidebarOpen ? '패널 닫기' : '패널 열기'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* ── Axis Legend ── */}
        <div style={styles.axisLegend}>
          <LegendItem color="#f1f5f9" label="Y축: L* (밝기)" />
          <LegendItem color="#f87171" label="X+ a* → Red" secondColor="#4ade80" secondLabel="X− → Green" />
          <LegendItem color="#facc15" label="Z+ b* → Yellow" secondColor="#60a5fa" secondLabel="Z− → Blue" />
          <div style={styles.hint}>드래그: 회전 · 휠: 줌 · 클릭: 선택</div>
        </div>

        {/* ── Copyright ── */}
        <div style={styles.copyright}>
          <div>Copyright 2026 WJ International</div>
          <div>samchun68@naver.com</div>
          <div>Open Fashion Alliance</div>
          <div>uttu.me</div>
        </div>

        {/* ── Color Detail Panel (bottom-right) ── */}
        {selectedColor && (
          <Suspense fallback={null}>
            <ColorDetailPanel
              color={selectedColor}
              lang={lang}
              onClose={() => setSelectedColor(null)}
              onHighlight={() => toggleHueHighlight(selectedColor)}
              isHighlightActive={isSelectedHueHighlighted}
            />
          </Suspense>
        )}
      </div>

      {/* ── Side Panel (fixed overlay on right) ── */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed', top: 0, right: 0, width: 320, height: '100vh',
          zIndex: 50, boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
        }}>
          <Suspense fallback={<PanelFallback />}>
            <SidePanel
              data={filteredData}
              allData={colorData}
              selected={selectedColor}
              activeTones={activeTones}
              searchQuery={searchQuery}
              lang={lang}
              onSearchChange={setSearchQuery}
              onToneToggle={toggleTone}
              onToggleAll={toggleAllTones}
              onSelectColor={handleSelect}
              onClose={() => setSidebarOpen(false)}
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}

function SceneFallback({ isMobile = false }) {
  return (
    <div style={{ ...fallbackStyles.scene, paddingBottom: isMobile ? 60 : 0 }}>
      <div style={fallbackStyles.glow} />
      <div style={fallbackStyles.label}>Loading 3D Scene</div>
    </div>
  )
}

function PanelFallback({ isMobile = false }) {
  return (
    <div style={{ ...fallbackStyles.panel, width: '100%', height: isMobile ? '100%' : '100vh' }}>
      <div style={fallbackStyles.panelHeader} />
      <div style={fallbackStyles.panelSearch} />
      <div style={fallbackStyles.panelGrid}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} style={fallbackStyles.panelChip} />
        ))}
      </div>
      <div style={fallbackStyles.panelList}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} style={fallbackStyles.panelRow} />
        ))}
      </div>
    </div>
  )
}

function ToggleBtn({ active, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        ...styles.iconBtn,
        background: active ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${active ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)'}`,
        color: active ? '#a5b4fc' : '#cbd5e1',
      }}
    >
      {children}
    </button>
  )
}

function LegendItem({ color, label, secondColor, secondLabel }) {
  if (secondColor) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 12, height: 2, background: secondColor, borderRadius: 1 }} />
        <div style={{ width: 12, height: 2, background: color, borderRadius: 1 }} />
        <span style={{ fontSize: 12, color: '#cbd5e1', letterSpacing: '0.03em' }}>
          <span style={{ color: secondColor }}>{secondLabel.split('→')[1]?.trim()}</span>
          {' ← '}
          <span style={{ color: '#e2e8f0' }}>{label.split(' ')[1]}</span>
          {' → '}
          <span style={{ color }}>{label.split('→')[1]?.trim()}</span>
        </span>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 24, height: 2, background: color, borderRadius: 1 }} />
      <span style={{ fontSize: 12, color: '#cbd5e1', letterSpacing: '0.04em' }}>{label}</span>
    </div>
  )
}

function MobileToggle({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 40, height: 40, borderRadius: 10,
        background: active ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)',
        border: '1px solid ' + (active ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.12)'),
        color: active ? '#a5b4fc' : '#cbd5e1',
        fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  )
}

const styles = {
  topBar: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    pointerEvents: 'none',
    zIndex: 10,
  },
  titleWrap: {
    pointerEvents: 'none',
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    letterSpacing: '0.02em',
  },
  controls: {
    display: 'flex',
    gap: 6,
    pointerEvents: 'auto',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: 300,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
  },
  clearBtn: {
    height: 36,
    padding: '0 12px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'inherit',
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.4)',
    color: '#fca5a5',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  sidebarToggle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#cbd5e1',
    fontSize: 14,
    pointerEvents: 'auto',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
  },
  axisLegend: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    pointerEvents: 'none',
    zIndex: 10,
  },
  hint: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 4,
    letterSpacing: '0.04em',
  },
  copyright: {
    position: 'absolute',
    bottom: 20,
    right: 22,
    textAlign: 'right',
    fontSize: 12,
    lineHeight: 1.6,
    color: 'rgba(203,213,225,0.82)',
    letterSpacing: '0.03em',
    pointerEvents: 'none',
    zIndex: 10,
    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
  },
}

const mStyles = {
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 14px',
    background: 'linear-gradient(to bottom, rgba(10,15,30,0.92) 0%, rgba(10,15,30,0) 100%)',
    pointerEvents: 'none', zIndex: 10,
  },
  title: {
    fontSize: 17, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 12, color: '#94a3b8', marginTop: 2,
  },
  topControls: {
    display: 'flex', gap: 6, pointerEvents: 'auto',
  },
  bottomNav: {
    display: 'flex', height: 60, flexShrink: 0, zIndex: 50,
    background: 'rgba(10,15,30,0.98)',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  },
  navBtn: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 3, padding: '4px 0',
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#94a3b8', fontFamily: 'inherit', transition: 'color 0.15s',
    WebkitTapHighlightColor: 'transparent',
  },
  navBtnActive: { color: '#818cf8' },
  navIcon: { fontSize: 18, lineHeight: 1, fontWeight: 700 },
  navLabel: { fontSize: 12, letterSpacing: '0.04em' },
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    zIndex: 40, backdropFilter: 'blur(3px)',
  },
  drawer: {
    position: 'fixed', left: 0, right: 0, bottom: 60,
    height: '72vh', minHeight: 300,
    background: '#0d1525',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -16px 48px rgba(0,0,0,0.6)',
    zIndex: 45,
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  drawerHandle: {
    width: 36, height: 4, borderRadius: 2,
    background: 'rgba(255,255,255,0.15)',
    margin: '10px auto 0', flexShrink: 0,
  },
  copyright: {
    position: 'absolute',
    bottom: 68,
    left: 14,
    fontSize: 11,
    lineHeight: 1.6,
    color: 'rgba(203,213,225,0.78)',
    letterSpacing: '0.03em',
    pointerEvents: 'none',
    zIndex: 10,
    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
  },
}

const fallbackStyles = {
  scene: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at 50% 40%, rgba(14,165,233,0.12), transparent 40%), linear-gradient(180deg, #07111d 0%, #0a0f1e 100%)',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.32) 0%, rgba(14,165,233,0.14) 32%, rgba(10,15,30,0) 72%)',
    filter: 'blur(8px)',
  },
  label: {
    position: 'relative',
    padding: '10px 14px',
    borderRadius: 999,
    border: '1px solid rgba(125,211,252,0.2)',
    background: 'rgba(7,17,29,0.7)',
    color: '#cbd5e1',
    fontSize: 12,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    backdropFilter: 'blur(10px)',
  },
  panel: {
    background: 'rgba(10,15,28,0.97)',
    borderLeft: '1px solid rgba(255,255,255,0.1)',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  panelHeader: {
    height: 22,
    width: '40%',
    borderRadius: 10,
    background: 'rgba(255,255,255,0.08)',
  },
  panelSearch: {
    height: 38,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.06)',
  },
  panelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 6,
  },
  panelChip: {
    height: 28,
    borderRadius: 8,
    background: 'rgba(255,255,255,0.06)',
  },
  panelList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  panelRow: {
    height: 44,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.05)',
  },
}
