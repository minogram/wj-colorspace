import { useState, useMemo, useCallback } from 'react'
import { colorData } from './colorData.js'
import { getTone, getHue, TONE_INFO } from './utils/colorUtils.js'
import { useIsMobile } from './hooks/useIsMobile.js'
import ColorScene3D from './components/ColorScene3D.jsx'
import SidePanel from './components/SidePanel.jsx'
import ColorDetailPanel from './components/ColorDetailPanel.jsx'

const ALL_TONES = Object.keys(TONE_INFO)

export default function App() {
  const isMobile = useIsMobile()

  const [selectedColor, setSelectedColor] = useState(null)
  const [hoveredColor, setHoveredColor] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTones, setActiveTones] = useState(new Set(ALL_TONES))
  const [activeHues, setActiveHues] = useState(null)
  const [autoRotate, setAutoRotate] = useState(false)
  const [showAxes, setShowAxes] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [lang, setLang] = useState('ko')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

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

  const selectOnly = useCallback((color) => {
    setSelectedColor(color)
    const hue = getHue(color.code)
    setActiveHues(new Set([hue]))
  }, [])

  /* ── MOBILE LAYOUT ── */
  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
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
          <div style={mStyles.topBar}>
            <div style={{ pointerEvents: 'none' }}>
              <div style={mStyles.title}>CIELAB 컬러스페이스</div>
              <div style={mStyles.subtitle}>{filteredData.length} / {colorData.length} 색상</div>
            </div>
            <div style={mStyles.topControls}>
              <MobileToggle active={autoRotate} onClick={() => setAutoRotate(v => !v)}>&#8635;</MobileToggle>
              <MobileToggle active={showAxes} onClick={() => setShowAxes(v => !v)}>&#8862;</MobileToggle>
              <MobileToggle active={lang === 'en'} onClick={() => setLang(v => v === 'ko' ? 'en' : 'ko')}>
                {lang === 'ko' ? 'KO' : 'EN'}
              </MobileToggle>
            </div>
          </div>
          {selectedColor && (
            <ColorDetailPanel
              color={selectedColor}
              lang={lang}
              isMobile
              onClose={() => setSelectedColor(null)}
              onHighlight={() => selectOnly(selectedColor)}
            />
          )}
          {/* ── Copyright (mobile) ── */}
          <div style={mStyles.copyright}>
            <div>Copyright 2026 WJ International</div>
            <div>samchun68@naver.com</div>
            <div>uttu.me</div>
            <div>Open Fashion Alliance</div>
          </div>
          {activeHues && !selectedColor && (
            <button style={mStyles.clearBadge} onClick={() => setActiveHues(null)}>
              계열 강조 해제
            </button>
          )}
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
            </div>
          </>
        )}
      </div>
    )
  }

  /* ── DESKTOP LAYOUT ── */
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* ── 3D Canvas (always full width) ── */}
      <div style={{ flex: 1, position: 'relative' }}>
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
            <ToggleBtn active={lang === 'en'} onClick={() => setLang(v => v === 'ko' ? 'en' : 'ko')} title="언어 전환">
              {lang === 'ko' ? 'KO' : 'EN'}
            </ToggleBtn>
            {activeHues && (
              <button style={styles.clearBtn} onClick={() => setActiveHues(null)}>
                하이라이트 해제
              </button>
            )}
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
          <div>uttu.me</div>
          <div>Open Fashion Alliance</div>
        </div>

        {/* ── Color Detail Panel (bottom-right) ── */}
        {selectedColor && (
          <ColorDetailPanel
            color={selectedColor}
            lang={lang}
            onClose={() => setSelectedColor(null)}
            onHighlight={() => selectOnly(selectedColor)}
          />
        )}
      </div>

      {/* ── Side Panel (fixed overlay on right) ── */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed', top: 0, right: 0, width: 320, height: '100vh',
          zIndex: 50, boxShadow: '-8px 0 32px rgba(0,0,0,0.6)',
        }}>
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
        </div>
      )}
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
        color: active ? '#a5b4fc' : '#94a3b8',
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
        <span style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.03em' }}>
          <span style={{ color: secondColor }}>{secondLabel.split('→')[1]?.trim()}</span>
          {' ← '}
          <span style={{ color: '#94a3b8' }}>{label.split(' ')[1]}</span>
          {' → '}
          <span style={{ color }}>{label.split('→')[1]?.trim()}</span>
        </span>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 24, height: 2, background: color, borderRadius: 1 }} />
      <span style={{ fontSize: 11, color: '#64748b', letterSpacing: '0.04em' }}>{label}</span>
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
        color: active ? '#a5b4fc' : '#94a3b8',
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
    fontSize: 22,
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 12,
    color: '#475569',
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
    fontSize: 12,
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
    color: '#94a3b8',
    fontSize: 12,
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
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    letterSpacing: '0.04em',
  },
  copyright: {
    position: 'absolute',
    bottom: 20,
    right: 22,
    textAlign: 'right',
    fontSize: 11,
    lineHeight: 1.6,
    color: 'rgba(148,163,184,0.65)',
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
    fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 11, color: '#475569', marginTop: 2,
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
    color: '#475569', fontFamily: 'inherit', transition: 'color 0.15s',
    WebkitTapHighlightColor: 'transparent',
  },
  navBtnActive: { color: '#818cf8' },
  navIcon: { fontSize: 18, lineHeight: 1, fontWeight: 700 },
  navLabel: { fontSize: 10, letterSpacing: '0.04em' },
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
    fontSize: 10,
    lineHeight: 1.6,
    color: 'rgba(148,163,184,0.55)',
    letterSpacing: '0.03em',
    pointerEvents: 'none',
    zIndex: 10,
    textShadow: '0 1px 4px rgba(0,0,0,0.8)',
  },
  clearBadge: {
    position: 'absolute', top: 68, left: '50%', transform: 'translateX(-50%)',
    padding: '6px 14px', borderRadius: 20, fontSize: 11,
    background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
    color: '#fca5a5', cursor: 'pointer', fontFamily: 'inherit',
    zIndex: 10, pointerEvents: 'auto', whiteSpace: 'nowrap',
    WebkitTapHighlightColor: 'transparent',
  },
}
