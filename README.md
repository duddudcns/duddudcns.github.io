# 🎮 미니게임천국 (Minigame Heaven)

추억의 미니게임천국을 웹으로 재현한 프로젝트입니다.

## 🕹️ 게임 목록

### 테트리스 (Tetris)
- 클래식 퍼즐 게임
- 10줄마다 레벨업
- 레벨업 애니메이션

### 달려달려 (Run Run)
- 원숭이가 언덕을 달리며 별을 수집
- 원버튼 점프 (더블점프 가능)
- 피버 모드 시스템

### 놓아놓아 (Swing)
- 스파이더맨 스타일 줄타기
- 45도 각도로 줄 발사
- 진자 물리 엔진 적용
- 타이밍 맞춰 줄을 놓고 날아가기

### FPS 슈팅 (FPS Shooting)
- Three.js 기반 3D 슈팅 게임
- 현실적인 물리 엔진 (벽 충돌, 슬라이딩, 점프)
- 적 AI와의 전투 (추적, 사격)
- 다양한 지형과 플랫폼 액션

### 벽돌깨기 (Breakout)
- 클래식 아케이드 벽돌깨기
- 패들 반사 각도 기반 컨트롤
- 레벨 진행/생명 시스템

## 🎯 조작법

| 게임 | 조작 |
|------|------|
| 테트리스 | ←→: 이동, ↑: 회전, ↓: 빠른 낙하 |
| 달려달려 | 아무키/클릭: 점프 |
| 놓아놓아 | 클릭: 줄 쏘기/놓기 |
| FPS 슈팅 | WASD: 이동, 마우스: 조준/발사, R: 재장전, Space: 점프, Shift: 달리기 |
| 벽돌깨기 | ←→/A,D: 이동, Space/클릭: 발사 |

## 🔐 로그인/랭킹 (Firebase)

- Google 로그인: Firebase Auth
- 게임별 최고점: Firestore
- 홈에서 게임별 TOP 랭킹 조회

설정 방법:
1. Firebase 프로젝트 생성 후 Google 로그인(Auth) 활성화
2. Firestore 생성
3. `js/firebaseConfig.js`에 웹 앱 설정값 입력
4. `firestore.rules` 내용을 Firestore Rules에 적용

## 🚀 플레이

[https://duddudcns.github.io](https://duddudcns.github.io)

---
Made with ❤️ for nostalgia
