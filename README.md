# Monolithic Base Template

NestJS, Next.js App Router, PostgreSQL, React Query를 사용하는 사이드 프로젝트용 모놀리식 베이스 템플릿입니다.

## 구성

- `server`: 하나의 NestJS API 프로세스, TypeORM, PostgreSQL, JWT 인증
- `client`: Next.js App Router, React Query, 공통 인증/레이아웃 구조
- 루트 npm workspace에서 두 애플리케이션을 함께 관리합니다.

### 백엔드 모듈 구조

모든 백엔드 기능은 `server/src`의 단일 NestJS 애플리케이션에서 실행됩니다.

```text
server/src
├─ common/             공통 DTO, 응답, 인터셉터와 유틸리티
├─ config/             PostgreSQL 및 애플리케이션 설정
└─ modules/
   ├─ auth/            사용자, 역할, JWT 인증
   ├─ menu/            메뉴 및 설정 코드
   ├─ plan/            일정, 반복 일정, 할 일
   ├─ file/            첨부 파일 업로드와 다운로드
   └─ board/           게시판, 게시글, 댓글
```

각 기능은 자체 controller, service, DTO, entity를 소유합니다. 기능 간 통신은 HTTP나 메시지 브로커 대신 NestJS module export와 dependency injection을 사용합니다.

게시판 모듈은 `/board` 아래에 게시판, 게시글, 댓글 API를 제공합니다. 프론트엔드의 기존 action-style API 호출은 후속 단계에서 이 REST API와 React Query hook으로 교체합니다.

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
