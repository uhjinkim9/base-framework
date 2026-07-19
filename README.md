# Monolithic Base Template

NestJS, Next.js App Router, PostgreSQL, React Query를 사용하는 사이드 프로젝트용 모놀리식 베이스 템플릿입니다.

## 구성

- `server`: 하나의 NestJS API 프로세스, TypeORM, PostgreSQL, JWT 인증
- `client`: Next.js App Router, React Query, 공통 인증/레이아웃 구조
- 루트 npm workspace에서 두 애플리케이션을 함께 관리합니다.

## 시작하기

1. `server/.env.example`을 `server/.env.development`로 복사합니다.
2. `client/.env.example`을 `client/.env.local`로 복사합니다.
3. PostgreSQL 데이터베이스와 RSA JWT 개인 키 `server/keys/private.pem`을 준비합니다.
4. 루트에서 `npm install` 후 `npm start`를 실행합니다.

기본 포트는 프론트엔드 `5000`, API `8000`, PostgreSQL `5432`입니다.

## 템플릿화 방향

인증, 공통 UI, API 상태 확인 대시보드를 코어로 유지합니다. `server/modules` 및 `client/src/app/(with-header)` 아래의 기존 업무 도메인은 다음 정리 단계에서 제거하거나 프로젝트별 기능으로 교체합니다. 메시지 브로커 같은 외부 마이크로서비스 의존성은 코어 인증 흐름에 포함하지 않습니다.

## 주요 명령

- `npm start`: 프론트엔드와 API 개발 서버 실행
- `npm run build`: API와 프론트엔드 빌드
- `npm run build:server`: API만 빌드
- `npm run build:client`: 프론트엔드만 빌드
