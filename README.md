# CIELAB 컬러스페이스 3D

> **🌐 라이브 사이트:** [https://minogram.github.io/wj-colorspace/](https://minogram.github.io/wj-colorspace/)

WJ International 색상 데이터 130종을 CIELAB(L\* a\* b\*) 3D 공간으로 시각화한 인터랙티브 웹 애플리케이션입니다.

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| **3D 시각화** | L\*(밝기) · a\*(녹-적) · b\*(청-황) 축으로 색상 구체 배치 |
| **인터랙션** | 드래그 회전 · 휠 줌 · 클릭으로 색상 상세 조회 |
| **자동 회전** | 상단 토글 버튼으로 ON/OFF |
| **색조 필터** | vv · dp · dk · dl · sf · lt · pl · wh 등 13개 톤 필터링 |
| **검색** | 색명(한/영) · 약호 · 먼셀기호로 실시간 검색 |
| **색상 상세** | HEX · RGB 클립보드 복사, Lab 값 시각화 |
| **언어 전환** | 한국어 / 영어 |
| **모바일 지원** | 바텀 드로어 UI, 탭 네비게이션 |

---

## 기술 스택

- **React 19** + **Vite 7**
- **Three.js** + **@react-three/fiber** + **@react-three/drei**
- **Pretendard** 폰트 (CDN)
- 색상 데이터: `컬러테이블.xlsx` (130색, CIE Lab 좌표)

---

## 로컬 개발

```bash
cd colorspace-app
npm install
npm run dev
# → http://localhost:5173
```

## 빌드

```bash
cd colorspace-app
npm run build
# → colorspace-app/dist/
```

---

## 배포 (GitHub Pages)

`main` 브랜치에 push하면 GitHub Actions가 자동으로 빌드하여 GitHub Pages에 배포합니다.

워크플로우 파일: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

---

Copyright 2026 WJ International · samchun68@naver.com
