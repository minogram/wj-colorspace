import { useMemo } from 'react'
import { labToRgbStr, labToHex, TONE_INFO, getTone } from '../utils/colorUtils.js'

export default function ColorDetailPanel({ color, lang, onClose, onHighlight, isMobile }) {
  const rgbStr = useMemo(() => labToRgbStr(color.l, color.a, color.b), [color])
  const hex = useMemo(() => labToHex(color.l, color.a, color.b), [color])
  const tone = getTone(color.code)
  const toneInfo = TONE_INFO[tone]

  const nameKo = color.nameKo
  const nameEn = color.nameEn
  const displayName = lang === 'ko' ? nameKo : nameEn

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text).catch(() => {})
  }

  const panelStyle = isMobile
    ? {
        position: 'fixed',
        bottom: 60,
        left: 0,
        right: 0,
        maxHeight: '60vh',
        borderRadius: '16px 16px 0 0',
        background: 'rgba(13,21,37,0.98)',
        border: 'none',
        borderTop: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 -12px 40px rgba(0,0,0,0.7)',
        zIndex: 48,
        overflowY: 'auto',
      }
    : styles.panel

  return (
    <div style={panelStyle}>
      {/* Swatch Area */}
      <div style={{ ...styles.swatchBig, background: rgbStr }}>
        <button style={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      {/* Info */}
      <div style={styles.info}>
        <div style={styles.codeRow}>
          <span style={styles.codeTag}>{color.code}</span>
          {toneInfo && (
            <span style={{ ...styles.tonePill, color: toneInfo.color, borderColor: `${toneInfo.color}44`, background: `${toneInfo.color}18` }}>
              {lang === 'ko' ? toneInfo.label : toneInfo.labelEn}
            </span>
          )}
        </div>
        <div style={styles.colorName}>{displayName}</div>
        {color.commonKo && (
          <div style={styles.commonName}>
            {lang === 'ko' ? color.commonKo : color.commonEn}
          </div>
        )}

        <div style={styles.divider} />

        {/* Color Values */}
        <div style={styles.valuesGrid}>
          <ValueItem
            label="먼셀기호"
            value={color.munsell || '-'}
            mono
            onCopy={() => copyToClipboard(color.munsell)}
          />
          <ValueItem
            label="HEX"
            value={hex}
            mono
            onCopy={() => copyToClipboard(hex)}
          />
          <ValueItem
            label="L* (밝기)"
            value={color.l?.toFixed(3)}
            mono
          />
          <ValueItem
            label="a* (녹-적)"
            value={color.a?.toFixed(3)}
            mono
          />
          <ValueItem
            label="b* (청-황)"
            value={color.b?.toFixed(3)}
            mono
          />
        </div>

        <div style={styles.divider} />

        {/* CIE Lab bar visualization */}
        <div style={styles.barSection}>
          <div style={styles.barLabel}>L* 밝기</div>
          <div style={styles.barTrack}>
            <div style={{ ...styles.barFill, width: `${color.l}%`, background: 'linear-gradient(90deg,#1e293b,#f1f5f9)' }} />
          </div>
          <span style={styles.barValue}>{color.l?.toFixed(1)}</span>
        </div>
        <div style={styles.barSection}>
          <div style={styles.barLabel}>a* 녹←→적</div>
          <div style={styles.barTrack}>
            <div style={{ ...styles.barFill, width: `${((color.a + 128) / 256) * 100}%`, background: 'linear-gradient(90deg,#22c55e,#ef4444)' }} />
          </div>
          <span style={styles.barValue}>{color.a?.toFixed(1)}</span>
        </div>
        <div style={styles.barSection}>
          <div style={styles.barLabel}>b* 청←→황</div>
          <div style={styles.barTrack}>
            <div style={{ ...styles.barFill, width: `${((color.b + 128) / 256) * 100}%`, background: 'linear-gradient(90deg,#3b82f6,#eab308)' }} />
          </div>
          <span style={styles.barValue}>{color.b?.toFixed(1)}</span>
        </div>

        <div style={styles.divider} />

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.actionBtn} onClick={() => copyToClipboard(hex)} title="HEX 복사">
            📋 HEX 복사
          </button>
          <button style={styles.actionBtn} onClick={() => copyToClipboard(rgbStr)} title="RGB 복사">
            📋 RGB 복사
          </button>
          <button style={{ ...styles.actionBtn, ...styles.highlightBtn }} onClick={onHighlight} title="같은 색상계열 하이라이트">
            ✦ 계열 강조
          </button>
        </div>
      </div>
    </div>
  )
}

function ValueItem({ label, value, mono, onCopy }) {
  return (
    <div style={styles.valueWrap}>
      <div style={styles.valueLabel}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ ...styles.valueText, fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</div>
        {onCopy && (
          <button style={styles.copyBtn} onClick={onCopy} title="복사">⎘</button>
        )}
      </div>
    </div>
  )
}

const styles = {
  panel: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 260,
    background: 'rgba(13,21,37,0.96)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 14,
    overflow: 'hidden',
    boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
    backdropFilter: 'blur(16px)',
    zIndex: 30,
    maxHeight: 'calc(100vh - 120px)',
    overflowY: 'auto',
  },
  swatchBig: {
    height: 80,
    position: 'relative',
    flexShrink: 0,
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 6,
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'white',
    fontSize: 10,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
  },
  info: {
    padding: '14px 16px',
  },
  codeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  codeTag: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#6366f1',
    fontWeight: 700,
    letterSpacing: '0.06em',
  },
  tonePill: {
    fontSize: 10,
    padding: '1px 7px',
    borderRadius: 20,
    border: '1px solid',
    fontWeight: 500,
  },
  colorName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '-0.02em',
    lineHeight: 1.3,
  },
  commonName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.06)',
    margin: '12px 0',
  },
  valuesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  valueWrap: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  valueLabel: {
    fontSize: 11,
    color: '#475569',
    flexShrink: 0,
  },
  valueText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'right',
  },
  copyBtn: {
    background: 'none',
    border: 'none',
    color: '#475569',
    cursor: 'pointer',
    fontSize: 12,
    padding: '0 2px',
    lineHeight: 1,
  },
  barSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 9,
    color: '#334155',
    width: 60,
    flexShrink: 0,
    letterSpacing: '0.02em',
  },
  barTrack: {
    flex: 1,
    height: 5,
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
    transition: 'width 0.3s ease',
  },
  barValue: {
    fontSize: 9,
    color: '#475569',
    fontFamily: 'monospace',
    width: 36,
    textAlign: 'right',
    flexShrink: 0,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionBtn: {
    flex: 1,
    minWidth: 90,
    padding: '7px 8px',
    borderRadius: 7,
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'inherit',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#94a3b8',
    transition: 'all 0.15s',
    textAlign: 'center',
  },
  highlightBtn: {
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.3)',
    color: '#a5b4fc',
    flexBasis: '100%',
  },
}
