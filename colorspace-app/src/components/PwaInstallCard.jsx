import { useEffect, useMemo, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

function isStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export default function PwaInstallCard({ isMobile = false, selectedColor = null }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false
    return isStandaloneMode()
  })
  const [isIos, setIsIos] = useState(() => {
    if (typeof window === 'undefined') return false
    return isIosDevice()
  })
  const appIconSrc = `${import.meta.env.BASE_URL}apple-touch-icon-180.png`

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setCanInstall(false)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    setIsIos(isIosDevice())

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const canShowInstall = !isInstalled && (canInstall || isIos)

  const status = useMemo(() => {
    if (needRefresh) {
      return {
        title: 'Update Ready',
        body: '새 배포가 준비됐습니다. 업데이트를 누르면 최신 캐시로 교체됩니다.',
        tone: 'violet',
        actionLabel: 'Update now',
      }
    }

    if (canShowInstall) {
      return {
        title: 'Install App',
        body: canInstall
          ? '앱처럼 실행하고 마지막으로 보던 컬러 상태를 더 빠르게 이어볼 수 있습니다.'
          : 'iPhone에서는 Safari 공유 메뉴에서 홈 화면에 추가를 누르면 앱처럼 설치됩니다.',
        tone: 'emerald',
        actionLabel: canInstall ? 'Install' : null,
        helper: canInstall ? null : 'Safari → 공유 버튼 → 홈 화면에 추가',
      }
    }

    if (offlineReady) {
      return {
        title: 'Offline Ready',
        body: '핵심 리소스가 캐시되어 네트워크 없이도 최근 화면을 계속 탐색할 수 있습니다.',
        tone: 'sky',
        actionLabel: '닫기',
      }
    }

    return null
  }, [canInstall, canShowInstall, isIos, needRefresh, offlineReady])

  if (!status) return null

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice?.outcome === 'accepted') {
      setCanInstall(false)
      setDeferredPrompt(null)
    }
  }

  const dismiss = () => {
    if (needRefresh) {
      setNeedRefresh(false)
      return
    }

    if (offlineReady) {
      setOfflineReady(false)
      return
    }

    if (canShowInstall) {
      setCanInstall(false)
    }
  }

  const tone = tones[status.tone]

  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? 64 : 86,
        right: isMobile ? 12 : 20,
        left: isMobile ? 12 : 'auto',
        width: isMobile ? 'auto' : 360,
        zIndex: 120,
        borderRadius: 24,
        padding: isMobile ? '14px 14px 13px' : '16px 16px 15px',
        background: tone.background,
        border: `1px solid ${tone.border}`,
        boxShadow: '0 24px 48px rgba(0,0,0,0.34)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 52,
            height: 52,
            flexShrink: 0,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${tone.border}`,
            overflow: 'hidden',
          }}
        >
          <img src={appIconSrc} alt="WJ Colorspace icon" style={{ width: 38, height: 38, borderRadius: 12 }} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11, color: tone.kicker, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            PWA
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#f8fafc', marginTop: 3 }}>{status.title}</div>
          <p style={{ fontSize: 12, lineHeight: 1.5, color: '#cbd5e1', marginTop: 6 }}>{status.body}</p>
          {selectedColor && !needRefresh && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '5px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: 11 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: tone.accent, boxShadow: `0 0 0 4px ${tone.badge}` }} />
              Continue {selectedColor.code}
            </div>
          )}
          {status.helper && (
            <div style={{ marginTop: 8, fontSize: 11, color: '#cbd5e1', lineHeight: 1.5 }}>
              {status.helper}
            </div>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="dismiss pwa notice"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            width: 24,
            height: 24,
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        {canShowInstall && canInstall && (
          <button onClick={handleInstall} style={{ ...buttonBase, background: tone.accent, color: '#08111f' }}>
            {status.actionLabel}
          </button>
        )}
        {needRefresh && (
          <button onClick={() => updateServiceWorker(true)} style={{ ...buttonBase, background: tone.accent, color: '#08111f' }}>
            {status.actionLabel}
          </button>
        )}
        {(offlineReady || isIos || canInstall) && (
          <button onClick={dismiss} style={{ ...buttonBase, background: 'rgba(255,255,255,0.06)', color: '#e2e8f0' }}>
            {offlineReady ? '닫기' : '나중에'}
          </button>
        )}
      </div>
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
  fontSize: 12,
  fontWeight: 700,
}

const tones = {
  emerald: {
    background: 'linear-gradient(180deg, rgba(5,28,25,0.94) 0%, rgba(8,17,28,0.95) 100%)',
    border: 'rgba(52,211,153,0.28)',
    badge: 'rgba(16,185,129,0.16)',
    accent: '#6ee7b7',
    kicker: '#6ee7b7',
  },
  violet: {
    background: 'linear-gradient(180deg, rgba(25,17,42,0.95) 0%, rgba(8,17,28,0.95) 100%)',
    border: 'rgba(167,139,250,0.3)',
    badge: 'rgba(139,92,246,0.16)',
    accent: '#c4b5fd',
    kicker: '#c4b5fd',
  },
  sky: {
    background: 'linear-gradient(180deg, rgba(10,24,42,0.95) 0%, rgba(8,17,28,0.95) 100%)',
    border: 'rgba(56,189,248,0.28)',
    badge: 'rgba(14,165,233,0.16)',
    accent: '#7dd3fc',
    kicker: '#7dd3fc',
  },
}