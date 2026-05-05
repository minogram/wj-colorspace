import { useEffect, useMemo, useState } from 'react'
import { labToHex, labToRgbStr } from '../utils/colorUtils.js'

export default function OfflineExperiencePanel({
  isMobile = false,
  isOnline,
  restoredFromLastView,
  selectedColor,
  filteredCount,
  totalCount,
  activeToneCount,
  activeHueCount,
  hasSearch,
  onResetView,
  onClearSelection,
}) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setDismissed(false)
    }
  }, [isOnline])

  const summary = useMemo(() => {
    const parts = []

    if (restoredFromLastView) {
      parts.push('마지막으로 보던 화면 상태를 복원했습니다.')
    }

    if (selectedColor) {
      parts.push(`${selectedColor.code} 색상을 계속 확인할 수 있습니다.`)
    }

    if (hasSearch || activeToneCount < 12 || activeHueCount > 0) {
      parts.push('검색과 필터도 그대로 유지됩니다.')
    }

    if (parts.length === 0) {
      parts.push('캐시된 앱 셸로 최근 화면을 계속 탐색할 수 있습니다.')
    }

    return parts.join(' ')
  }, [activeHueCount, activeToneCount, hasSearch, restoredFromLastView, selectedColor])

  const preview = useMemo(() => {
    if (!selectedColor) return null

    return {
      swatch: labToRgbStr(selectedColor.l, selectedColor.a, selectedColor.b),
      hex: labToHex(selectedColor.l, selectedColor.a, selectedColor.b),
      name: selectedColor.nameKo || selectedColor.nameEn,
      commonName: selectedColor.commonKo || selectedColor.commonEn,
    }
  }, [selectedColor])

  if (isOnline || dismissed) return null

  return (
    <div
      style={{
        position: 'fixed',
        left: isMobile ? 12 : 20,
        right: isMobile ? 12 : 'auto',
        bottom: isMobile ? 74 : 20,
        width: isMobile ? 'auto' : 364,
        zIndex: 118,
        borderRadius: 26,
        padding: isMobile ? '16px 16px 14px' : '18px 18px 16px',
        background: 'linear-gradient(180deg, rgba(31,22,10,0.95) 0%, rgba(11,17,26,0.95) 100%)',
        border: '1px solid rgba(251,191,36,0.22)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.35)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(245,158,11,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fcd34d', fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
          OFF
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, color: '#fcd34d', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Offline Mode</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', marginTop: 3 }}>Last View Restored</div>
          <p style={{ marginTop: 7, fontSize: 14, lineHeight: 1.6, color: '#e2e8f0' }}>{summary}</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="dismiss offline panel"
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', width: 24, height: 24, cursor: 'pointer', fontSize: 18, lineHeight: 1, flexShrink: 0 }}
        >
          ×
        </button>
      </div>

      {preview && (
        <div style={styles.previewCard}>
          <div style={{ ...styles.previewSwatch, background: preview.swatch }} />
          <div style={styles.previewBody}>
            <div style={styles.previewCode}>{selectedColor.code}</div>
            <div style={styles.previewName}>{preview.name}</div>
            {preview.commonName && <div style={styles.previewCommon}>{preview.commonName}</div>}
          </div>
          <div style={styles.previewMeta}>
            <div style={styles.previewMetaLabel}>HEX</div>
            <div style={styles.previewMetaValue}>{preview.hex}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        <StatChip label="Visible" value={`${filteredCount}/${totalCount}`} />
        <StatChip label="Tones" value={String(activeToneCount)} />
        <StatChip label="Hue focus" value={activeHueCount > 0 ? String(activeHueCount) : 'All'} />
        <StatChip label="Selected" value={selectedColor?.code ?? 'None'} accent />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <button onClick={() => setDismissed(true)} style={{ ...buttonBase, background: '#fcd34d', color: '#101828' }}>
          계속 보기
        </button>
        <button onClick={onResetView} style={{ ...buttonBase, background: 'rgba(255,255,255,0.06)', color: '#e2e8f0' }}>
          Reset view
        </button>
        {selectedColor && (
          <button onClick={onClearSelection} style={{ ...buttonBase, background: 'rgba(255,255,255,0.06)', color: '#e2e8f0' }}>
            선택 해제
          </button>
        )}
      </div>
    </div>
  )
}

function StatChip({ label, value, accent = false }) {
  return (
      <div style={{ padding: '8px 10px', borderRadius: 16, background: accent ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${accent ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.08)'}` }}>
      <div style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 13, color: '#f8fafc', fontWeight: 700, marginTop: 4 }}>{value}</div>
    </div>
  )
}

const buttonBase = {
  height: 36,
  padding: '0 14px',
  borderRadius: 999,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 13,
  fontWeight: 700,
}

const styles = {
  previewCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    padding: '12px 12px 11px',
    borderRadius: 18,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  previewSwatch: {
    width: 56,
    height: 56,
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.16)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
    flexShrink: 0,
  },
  previewBody: {
    minWidth: 0,
    flex: 1,
  },
  previewCode: {
    fontSize: 12,
    color: '#fcd34d',
    fontFamily: 'monospace',
    letterSpacing: '0.1em',
  },
  previewName: {
    marginTop: 4,
    fontSize: 16,
    color: '#f8fafc',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  previewCommon: {
    marginTop: 4,
    fontSize: 12,
    color: '#cbd5e1',
  },
  previewMeta: {
    textAlign: 'right',
    flexShrink: 0,
  },
  previewMetaLabel: {
    fontSize: 11,
    color: '#94a3b8',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  previewMetaValue: {
    marginTop: 4,
    fontSize: 12,
    color: '#f8fafc',
    fontFamily: 'monospace',
  },
}