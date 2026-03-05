import { useMemo } from 'react'
import { labToRgbStr, getTone, getHue, TONE_INFO } from '../utils/colorUtils.js'

const ALL_HUES = ['R', 'YR', 'Y', 'GY', 'G', 'BG', 'B', 'PB', 'P', 'RP']

export default function SidePanel({
  data, allData, selected, activeTones, searchQuery, lang,
  onSearchChange, onToneToggle, onToggleAll, onSelectColor, onClose,
}) {
  const toneList = Object.entries(TONE_INFO)

  const groupedByHue = useMemo(() => {
    const map = {}
    data.forEach(c => {
      const hue = getHue(c.code)
      if (!map[hue]) map[hue] = []
      map[hue].push(c)
    })
    return map
  }, [data])

  const totalVisible = data.length
  const isAllActive = activeTones.size === toneList.length

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>색상 목록</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={styles.countBadge}>{totalVisible}</div>
          {onClose && (
            <button onClick={onClose} style={styles.closeBtn} title="닫기">✕</button>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="색명, 약호, 먼셀기호 검색..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          style={styles.searchInput}
        />
        {searchQuery && (
          <button style={styles.clearSearch} onClick={() => onSearchChange('')}>✕</button>
        )}
      </div>

      {/* Tone Filter */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>색조 (Tone)</span>
          <button style={styles.toggleAllBtn} onClick={onToggleAll}>
            {isAllActive ? '전체 해제' : '전체 선택'}
          </button>
        </div>
        <div style={styles.toneGrid}>
          {toneList.map(([key, info]) => {
            const active = activeTones.has(key)
            const count = allData.filter(c => getTone(c.code) === key).length
            return (
              <button
                key={key}
                onClick={() => onToneToggle(key)}
                style={{
                  ...styles.toneBtn,
                  background: active ? `${info.color}22` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? info.color + '66' : 'rgba(255,255,255,0.1)'}`,
                  color: active ? info.color : '#94a3b8',
                  opacity: active ? 1 : 0.75,
                }}
                title={`${info.label} (${info.labelEn})`}
              >
                <span style={styles.toneDot(info.color, active)} />
                <span style={styles.toneKey}>{key}</span>
                <span style={styles.toneCount}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Color List */}
      <div style={styles.listWrap}>
        {ALL_HUES.map(hue => {
          const items = groupedByHue[hue]
          if (!items || items.length === 0) return null
          return (
            <div key={hue}>
              <div style={styles.hueHeader}>
                <span>{hue}</span>
                <span style={styles.hueCount}>{items.length}</span>
              </div>
              {items.map(c => (
                <ColorRow
                  key={c.id}
                  color={c}
                  isSelected={selected?.id === c.id}
                  lang={lang}
                  onSelect={onSelectColor}
                />
              ))}
            </div>
          )
        })}
        {data.length === 0 && (
          <div style={styles.empty}>검색 결과가 없습니다</div>
        )}
      </div>
    </div>
  )
}

function ColorRow({ color, isSelected, lang, onSelect }) {
  const name = lang === 'ko' ? color.nameKo : color.nameEn
  const rgbStr = labToRgbStr(color.l, color.a, color.b)

  return (
    <button
      onClick={() => onSelect(color)}
      style={{
        ...styles.colorRow,
        background: isSelected ? 'rgba(99,102,241,0.12)' : 'transparent',
        borderLeft: `2px solid ${isSelected ? '#6366f1' : 'transparent'}`,
      }}
    >
      <div style={{ ...styles.rowSwatch, background: rgbStr }} />
      <div style={styles.rowText}>
        <div style={styles.rowName}>{name}</div>
        <div style={styles.rowCode}>{color.code}</div>
      </div>
      <div style={styles.rowLab}>L*{color.l?.toFixed(0)}</div>
    </button>
  )
}

const styles = {
  panel: {
    width: '100%',
    height: '100%',
    background: 'rgba(10,15,28,0.97)',
    borderLeft: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  header: {
    padding: '16px 16px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#e2e8f0',
    letterSpacing: '-0.01em',
  },
  countBadge: {
    fontSize: 11,
    color: '#6366f1',
    background: 'rgba(99,102,241,0.15)',
    padding: '2px 8px',
    borderRadius: 20,
    fontWeight: 600,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#94a3b8',
    fontSize: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  searchWrap: {
    margin: '12px 12px 0',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    fontSize: 12,
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '8px 32px 8px 32px',
    fontSize: 12,
    color: '#e2e8f0',
    fontFamily: 'inherit',
    outline: 'none',
  },
  clearSearch: {
    position: 'absolute',
    right: 8,
    background: 'none',
    border: 'none',
    color: '#475569',
    cursor: 'pointer',
    fontSize: 12,
    padding: 2,
  },
  section: {
    padding: '12px 12px 0',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 600,
  },
  toggleAllBtn: {
    fontSize: 10,
    color: '#6366f1',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: 0,
  },
  toneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 4,
  },
  toneBtn: {
    borderRadius: 6,
    padding: '5px 6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
  },
  toneDot: (color, active) => ({
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: active ? color : 'transparent',
    border: `1px solid ${color}`,
    flexShrink: 0,
  }),
  toneKey: {
    fontSize: 10,
    fontWeight: 600,
    flex: 1,
    fontFamily: 'monospace',
  },
  toneCount: {
    fontSize: 9,
    opacity: 0.6,
  },
  listWrap: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
    marginTop: 8,
  },
  hueHeader: {
    fontSize: 10,
    color: '#64748b',
    padding: '8px 16px 3px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hueCount: {
    fontSize: 10,
    color: '#475569',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '1px 6px',
    fontWeight: 600,
    letterSpacing: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  colorRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '7px 14px',
    cursor: 'pointer',
    border: 'none',
    borderLeft: '2px solid transparent',
    transition: 'background 0.1s',
    fontFamily: 'inherit',
    textAlign: 'left',
    background: 'none',
  },
  rowSwatch: {
    width: 24,
    height: 24,
    borderRadius: 6,
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.15)',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    fontSize: 12,
    color: '#e2e8f0',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rowCode: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'monospace',
    marginTop: 1,
  },
  rowLab: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: 'monospace',
    flexShrink: 0,
  },
  empty: {
    padding: '32px 16px',
    textAlign: 'center',
    color: '#334155',
    fontSize: 12,
  },
}
