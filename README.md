# uCubers Enterprise Platform – 개발 표준 가이드 (for Developers)

본 가이드는 uCubers 엔터프라이즈 플랫폼(Next.js 15 + Express Gateway + NestJS 마이크로서비스) 개발자들이 일관된 품질과 생산성을 유지하도록 하기 위한 **실행 가능한 규칙**을 정의합니다. 프로젝트 지침(포트/구성/런북)을 바탕으로, 실무에서 바로 적용 가능한 체크리스트와 예시를 제공합니다.

---

## 0) 시스템 요약 & 용어

-   **클라이언트(Next.js 15, TS)**: `localhost:5000`
-   **Express Gateway**: `localhost:10000` (JWT 검증, 라우팅)
-   **마이크로서비스 (NestJS)**
    -   `auth:7000`, `menu:7001`, `board:7002`, `draft:7003`, `plan:7004`, `poll:7005`
-   **JWT**: RS256 (공개키: `keys/public.pem`)
-   **개발 환경 변수**
    -   Gateway: `gateway/.env.development`
    -   서비스별: `server/[service]/src/config/env/.env.development`
-   **게이트웨이 부팅 패턴**: PowerShell 스크립트가 `.env.development`를 읽고 `${VAR_NAME}` 템플릿을 치환하여 런타임 YAML 생성 후 게이트웨이 기동

---

## 1) Git 전략

### 1.1 브랜치 모델 (Trunk-Based)

-   기본 브랜치: `main`
-   작업 브랜치: `feat/*`, `fix/*`, `chore/*`, `refactor/*`, `perf/*`, `docs/*`, `test/*`
-   원칙
    -   작은 단위 PR(≤ 300 라인 변경)을 지향
    -   기능 플래그/환경 플래그로 불완전 기능 보호
    -   머지 전 **모든 체크(빌드/테스트/리ント)** 통과 필수

### 1.2 커밋 메시지 (Conventional Commits)

```
<type>(<scope>): <subject>

<body>
<footer>
```

-   type: `feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert`
-   예: `feat(board): add optimistic update for post like button`

### 1.3 PR 규칙

-   제목: `[service|client] type: summary`
-   설명: **배경/변경사항/테스트 방법/리스크/롤백 플랜** 포함
-   리뷰어: 최소 1명, 보안/플랫폼 영향 시 담당자 태그
-   라벨: `service:auth`, `area:gateway`, `type:feat` 등

---

## 2) 코드 스타일 & 품질

### 2.1 공통 (TS/JS)

-   **ESLint + Prettier** 강제, CI에 `eslint --max-warnings=0`
-   **경로 별칭**: 클라이언트 `@/...` 사용, 서버는 모듈별 상대/절대 경로 일관 유지
-   **금지**
    -   any 남발, `// @ts-ignore` 남용, dead code, console.log(서버측)

### 2.2 프론트엔드 (Next.js 15)

-   **상태관리**: 도메인별 Context(`UserContext`, `BoardContext` 등) 사용
-   **API 호출**: 중앙 서비스 `@/util/axios/api-service`의 `requestPost()` 패턴 사용
-   **컴포넌트 설계**
    -   UI(프레젠테이션)와 비즈니스 로직(훅/컨텍스트) 분리
    -   폴더링: `components/src/<domain>/<Component>`
-   **TipTap/FullCalendar** 사용 시 커스텀 플러그인/옵션은 `/util/` 또는 `/lib/`로 분리
-   **라우팅**: 인증 페이지 외에는 `(with-header)/` 레이아웃 사용

### 2.3 서버 (NestJS)

-   **모듈 구조**: `src/` 하위에 모듈/도메인 단위로 구성 (Controller → Service → Repository/Integration)
-   **환경 변수 로딩**: 각 서비스의 `src/config/env/.env.[env]`에서만 로드
-   **예외 처리**: 전역 `HttpExceptionFilter` 사용, 표준 에러 응답 채택(아래 4.2 참조)
-   **검증**: DTO + `class-validator` 의무화 (`ValidationPipe` 글로벌)
-   **로깅**: 요청/응답/에러를 구조화 로깅(pino/winston 택1)

---

## 3) API 설계 표준

### 3.1 REST 규약

-   경로는 리소스 복수형: `/board/posts`, `/menu/items`
-   행위는 메서드로 표현: `GET/POST/PATCH/DELETE`
-   정렬/필터/페이지네이션: `?sort=-createdAt&filter[author]=...&page=1&limit=20`

### 3.2 버전닝

-   게이트웨이 기준 prefix: `/v1/...` (하위 서비스도 동일 버전 계약 유지)

### 3.3 요청/응답 계약(OpenAPI)

-   각 서비스는 Swagger(OpenAPI) 문서 자동 생성 노출(개발 환경 한정)
-   계약 변경 시 **하위호환** 우선, 파괴적 변경은 새 버전으로 공개

### 3.4 표준 응답 형식

```json
{
	"success": true,
	"data": {},
	"error": null,
	"meta": {"requestId": "...", "timestamp": "ISO8601"}
}
```

-   실패 시

```json
{
	"success": false,
	"data": null,
	"error": {"code": "BOARD_404", "message": "Post not found", "details": {}},
	"meta": {"requestId": "...", "timestamp": "ISO8601"}
}
```

---

## 4) 에러 처리 & 로깅

### 4.1 에러 코드 규칙

-   형식: `<SERVICE>_<HTTPSTATUS>[_<SUBJECT>]` 예) `AUTH_401_TOKEN_EXPIRED`
-   공통 매핑 테이블을 `server/shared/error-codes.ts`로 관리(제안)

### 4.2 서버 전역 필터

-   `HttpExceptionFilter`에서 위 **표준 응답 형식**으로 변환
-   `requestId`는 게이트웨이에서 전달된 헤더(`x-request-id`)를 우선 사용

### 4.3 로깅

-   **구조화 로그**: `{ level, service, traceId, method, url, status, latencyMs }`
-   PII/민감정보 로그 금지(토큰, 비밀번호 등)

---

## 5) 인증/권한

-   **JWT(RS256)**: 액세스 토큰은 클라이언트의 `localStorage` 사용(보안 트레이드오프 인지)
-   게이트웨이가 auth 엔드포인트 제외 **모든 요청 검증**
-   서비스 간 호출 시 필요한 경우 Auth 서비스로 역할/권한 확인
-   토큰 갱신/만료 처리 표준화: 401 응답 시 클라이언트 인터셉터에서 재인증 UX 처리

---

## 6) 게이트웨이 규칙 (Express Gateway)

-   설정 템플릿: `gateway/config/gateway.config.template.yml`
-   **PowerShell 부팅 스크립트**(`start-gateway.ps1`)
    -   `.env.development` 로드 → `${VAR_NAME}` 치환 → 런타임 설정 생성 → 기동
-   **엔드포인트 매핑**: `/auth/*`, `/menu/*`, `/board/*`, `/draft/*`, `/plan/*`, `/poll/*`
-   **파일 업로드**: board 서비스에서 처리, 게이트웨이는 multipart 파싱 **비활성화** 유지
-   **CORS**: 기본 `localhost:5000` 허용(개발), 필요 시 화이트리스트 확장

---

## 7) 환경 변수 & 시크릿

-   모든 서비스는 각자 `.env.development`/`.env.production` 보유
-   시크릿/키는 소스 저장소 **커밋 금지**
-   키 로테이션 절차 문서화(예: RS256 키 교체 시점/롤백)
-   환경 변수 네이밍: `SERVICE__FEATURE__OPTION`(더블 언더스코어) 권장

---

## 8) 테스트 & 품질 게이트

-   **단위 테스트**: Jest + `@testing-library/react`(클라이언트), Nest Jest(서버)
-   **계약 테스트**: OpenAPI 스냅샷 검증(버전 변경 감지)
-   **E2E**: Playwright(제안)
-   커버리지 최소 기준: **라인 80%**(서비스별 상이 시 서비스 README 명시)
-   CI 파이프라인: `install → lint → build → test → typecheck`

---

## 9) 성능 & 안정성

-   **API 성능**: p95 응답시간 SLO 정의(서비스별), N+1 방지, 페이지네이션 기본 적용
-   **캐싱**: 게이트웨이/클라이언트 적절한 캐시 헤더, 서버 내부 캐시(필요 시)
-   **타임아웃/재시도**: 내부 HTTP 호출 기본 타임아웃(예: 3s), 지수 백오프 재시도 정책 문서화
-   **회로 차단기**: 중요한 외부 연동에 Circuit Breaker 적용 고려

---

## 10) 보안 체크리스트

-   [ ] HTTPS(프로덕션) 강제
-   [ ] JWT 서명키 권한/보관 분리, 주기적 로테이션
-   [ ] CORS 최소 권한 원칙
-   [ ] 입력값 검증 + DTO 스키마화
-   [ ] 파일 업로드: 확장자/크기/바이러스 스캔 정책
-   [ ] 의존성 취약점 스캔(`npm audit`/Snyk)
-   [ ] 비밀정보 로깅 금지

---

## 11) 로컬 개발 & 스크립트

```bash
# 최초 1회
./start.ps1            # Node 20.9.0 설정
npm install            # 루트 의존성
npm run install-all    # 모든 서비스 의존성

# 전체 기동
npm start              # 모든 서비스 동시 실행

# 개별 기동
npm run start-gateway
npm run start-auth
npm run start-client
# 등등
```

-   정리 스크립트: 각 서비스 `rimraf dist` 후 시작(자동/스크립트)
-   디버깅 도구: `npm run trace-board`, `npm run kill-node-ps`

---

## 12) 배포 & 운영 (요지)

-   PM2: `ecosystem.development.config.js` / `ecosystem.production.config.js`
-   로그 수집: 서비스명/버전/인스턴스 포함 구조화 로그 → 중앙 수집(제안)
-   헬스체크: `/health` 표준화(ready/liveness)

---

## 13) 디렉터리 & 네이밍 규칙

-   클라이언트
    -   `@/types`, `@/util`, `components/src/<domain>/...`
-   서버(서비스별)
    -   `src/` 루트, `config/env/`에 환경 파일, `modules/<domain>` 구조 권장
-   파일 네이밍: `kebab-case.tsx|ts` / DTO/Entity/Service/Controller 명확 표시

---

## 14) PR 체크리스트 (복사해서 사용)

-   [ ] 범위가 작고 독립적이다(≤300 LoC)
-   [ ] 린트/빌드/테스트/타입체크 통과
-   [ ] API 계약(Swagger) 갱신 및 문서 링크 첨부
-   [ ] 마이그레이션/시드/환경변수 변경 시 README/런북 갱신
-   [ ] 보안 영향 검토(CORS/JWT/비밀키/권한)
-   [ ] 롤백 플랜 기재

---

## 15) 부록: 표준 에러/성공 응답 예시 모음

-   **200** 성공

```json
{
	"success": true,
	"data": {"id": 123},
	"error": null,
	"meta": {"requestId": "...", "timestamp": "..."}
}
```

-   **400** 검증 실패

```json
{
	"success": false,
	"data": null,
	"error": {
		"code": "COMMON_400_VALIDATION",
		"message": "Validation failed",
		"details": {"field": "title"}
	},
	"meta": {"requestId": "...", "timestamp": "..."}
}
```

-   **401** 인증 실패

```json
{
	"success": false,
	"data": null,
	"error": {"code": "AUTH_401", "message": "Unauthorized"},
	"meta": {"requestId": "...", "timestamp": "..."}
}
```

-   **404** 미존재

```json
{
	"success": false,
	"data": null,
	"error": {"code": "BOARD_404", "message": "Post not found"},
	"meta": {"requestId": "...", "timestamp": "..."}
}
```

---

### 이 문서는 살아있는 규칙입니다

서비스 추가/스택 변경 시 업데이트하세요.

```
ucubers
├─ client
│  ├─ .env.development
│  ├─ .env.production
│  ├─ .env.stage
│  ├─ .prettierrc
│  ├─ eslint.config.mjs
│  ├─ next-env.d.ts
│  ├─ next.config.ts
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.ico
│  │  ├─ file.svg
│  │  ├─ globe.svg
│  │  ├─ icon
│  │  │  ├─ logout.svg
│  │  │  ├─ menu_burger.svg
│  │  │  └─ warning_diamond.svg
│  │  ├─ ko-kil-dong.png
│  │  ├─ next.svg
│  │  ├─ ucube-symbol-color.png
│  │  ├─ ucube_transparent.png
│  │  ├─ vercel.svg
│  │  └─ window.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ app
│  │  │  ├─ (with-header)
│  │  │  │  ├─ admin
│  │  │  │  │  ├─ layout.module.scss
│  │  │  │  │  ├─ layout.tsx
│  │  │  │  │  └─ [menuId]
│  │  │  │  │     ├─ page.tsx
│  │  │  │  │     └─ [subId]
│  │  │  │  │        └─ page.tsx
│  │  │  │  ├─ community
│  │  │  │  │  ├─ board
│  │  │  │  │  │  ├─ layout.tsx
│  │  │  │  │  │  ├─ page.tsx
│  │  │  │  │  │  └─ [leaf]
│  │  │  │  │  │     ├─ page.tsx
│  │  │  │  │  │     └─ [sideMain]
│  │  │  │  │  │        └─ page.tsx
│  │  │  │  │  ├─ layout.module.scss
│  │  │  │  │  ├─ layout.tsx
│  │  │  │  │  ├─ poll
│  │  │  │  │  │  ├─ layout.tsx
│  │  │  │  │  │  ├─ page.tsx
│  │  │  │  │  │  └─ [menuId]
│  │  │  │  │  │     ├─ page.tsx
│  │  │  │  │  │     └─ [pollIdx]
│  │  │  │  │  │        └─ page.tsx
│  │  │  │  │  └─ reference-room
│  │  │  │  │     ├─ layout.module.scss
│  │  │  │  │     ├─ layout.tsx
│  │  │  │  │     ├─ page.tsx
│  │  │  │  │     └─ [leaf]
│  │  │  │  │        ├─ page.tsx
│  │  │  │  │        └─ [additional]
│  │  │  │  │           └─ page.tsx
│  │  │  │  ├─ docs
│  │  │  │  │  ├─ layout.module.scss
│  │  │  │  │  ├─ layout.tsx
│  │  │  │  │  └─ [sub]
│  │  │  │  │     ├─ page.tsx
│  │  │  │  │     └─ [leaf]
│  │  │  │  │        ├─ layout.module.scss
│  │  │  │  │        ├─ layout.tsx
│  │  │  │  │        ├─ page.tsx
│  │  │  │  │        └─ [sideMain]
│  │  │  │  │           ├─ layout.tsx
│  │  │  │  │           └─ page.tsx
│  │  │  │  ├─ draft
│  │  │  │  │  ├─ DraftSidebar.module.scss
│  │  │  │  │  ├─ DraftSidebar.tsx
│  │  │  │  │  ├─ layout.module.scss
│  │  │  │  │  ├─ layout.tsx
│  │  │  │  │  ├─ page.module.scss
│  │  │  │  │  ├─ page.tsx
│  │  │  │  │  └─ [menuId]
│  │  │  │  │     ├─ page.tsx
│  │  │  │  │     └─ [subId]
│  │  │  │  │        ├─ page.tsx
│  │  │  │  │        └─ [formId]
│  │  │  │  │           └─ page.tsx
│  │  │  │  ├─ home
│  │  │  │  │  ├─ @announcements
│  │  │  │  │  │  ├─ page.module.scss
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  ├─ @attendance
│  │  │  │  │  │  ├─ page.module.scss
│  │  │  │  │  │  └─ page.tsx
│  │  │  │  │  ├─ layout.module.scss
│  │  │  │  │  ├─ layout.tsx
│  │  │  │  │  └─ search
│  │  │  │  │     ├─ page.module.scss
│  │  │  │  │     └─ page.tsx
│  │  │  │  ├─ layout.module.scss
│  │  │  │  ├─ layout.tsx
│  │  │  │  ├─ mail
│  │  │  │  │  ├─ layout.module.scss
│  │  │  │  │  ├─ layout.tsx
│  │  │  │  │  └─ [sub]
│  │  │  │  │     ├─ page.tsx
│  │  │  │  │     └─ [leaf]
│  │  │  │  │        ├─ page.tsx
│  │  │  │  │        └─ [sideMain]
│  │  │  │  │           └─ page.tsx
│  │  │  │  └─ plan
│  │  │  │     └─ calendar
│  │  │  │        ├─ layout.module.scss
│  │  │  │        ├─ layout.tsx
│  │  │  │        ├─ page.tsx
│  │  │  │        └─ [menuId]
│  │  │  │           └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ loading.tsx
│  │  │  ├─ login
│  │  │  │  ├─ layout.tsx
│  │  │  │  ├─ page-login.module.scss
│  │  │  │  └─ page.tsx
│  │  │  └─ page.tsx
│  │  ├─ components
│  │  │  ├─ common
│  │  │  │  ├─ company-related
│  │  │  │  │  ├─ EmailSelect.tsx
│  │  │  │  │  ├─ OrgTreeSelect.tsx
│  │  │  │  │  ├─ OrgTreeView.tsx
│  │  │  │  │  ├─ part
│  │  │  │  │  │  ├─ EmailSelectFilteredResult.tsx
│  │  │  │  │  │  ├─ EmailSelectTreeNode.tsx
│  │  │  │  │  │  ├─ FilteredResult.tsx
│  │  │  │  │  │  └─ TreeNode.tsx
│  │  │  │  │  ├─ ProfileCard.tsx
│  │  │  │  │  ├─ styles
│  │  │  │  │  │  ├─ EmailSelect.module.scss
│  │  │  │  │  │  ├─ OrgTreeSelect.module.scss
│  │  │  │  │  │  ├─ OrgTreeView.module.scss
│  │  │  │  │  │  └─ ProfileCard.module.scss
│  │  │  │  │  └─ types
│  │  │  │  │     └─ organization.type.ts
│  │  │  │  ├─ data-display
│  │  │  │  │  ├─ BarChart.tsx
│  │  │  │  │  ├─ Grid.tsx
│  │  │  │  │  ├─ GridCustomColumn.tsx
│  │  │  │  │  ├─ PieChart.tsx
│  │  │  │  │  └─ styles
│  │  │  │  │     └─ Grid.module.scss
│  │  │  │  ├─ editor
│  │  │  │  │  ├─ addon
│  │  │  │  │  │  ├─ DataElement.tsx
│  │  │  │  │  │  ├─ FontSize.tsx
│  │  │  │  │  │  ├─ FontStyle.tsx
│  │  │  │  │  │  ├─ Heading.tsx
│  │  │  │  │  │  ├─ ParagraphStyle.tsx
│  │  │  │  │  │  ├─ TableAlign.tsx
│  │  │  │  │  │  ├─ TableBGColor.tsx
│  │  │  │  │  │  ├─ TableLayout.tsx
│  │  │  │  │  │  └─ TableRowHeight.tsx
│  │  │  │  │  ├─ etc
│  │  │  │  │  │  ├─ editor-initial-state.ts
│  │  │  │  │  │  ├─ editor.type.ts
│  │  │  │  │  │  ├─ options.ts
│  │  │  │  │  │  └─ tiptap-table-commands.d.ts
│  │  │  │  │  ├─ extension
│  │  │  │  │  │  ├─ div-paragraph.ts
│  │  │  │  │  │  ├─ font-size.ts
│  │  │  │  │  │  ├─ global-class-attr.ts
│  │  │  │  │  │  ├─ image-drag-drop.ts
│  │  │  │  │  │  ├─ inline-data.ts
│  │  │  │  │  │  ├─ remove-hide-selection.ts
│  │  │  │  │  │  ├─ render-element.ts
│  │  │  │  │  │  ├─ resizeable-image.ts
│  │  │  │  │  │  ├─ row-height-cell.ts
│  │  │  │  │  │  ├─ row-resize-extension.ts
│  │  │  │  │  │  ├─ table-align.ts
│  │  │  │  │  │  ├─ table-attrs-to-dom.ts
│  │  │  │  │  │  └─ table-cell-attribute.ts
│  │  │  │  │  ├─ FormEditor.tsx
│  │  │  │  │  ├─ FormParser.tsx
│  │  │  │  │  ├─ parts
│  │  │  │  │  │  ├─ FileDrop.tsx
│  │  │  │  │  │  ├─ FormEditorToolbar.tsx
│  │  │  │  │  │  ├─ ResizableImageComponent.tsx
│  │  │  │  │  │  └─ TextEditorToolbar.tsx
│  │  │  │  │  ├─ styles
│  │  │  │  │  │  ├─ FileDrop.module.scss
│  │  │  │  │  │  ├─ FormEditor.module.scss
│  │  │  │  │  │  ├─ FormParser.module.scss
│  │  │  │  │  │  ├─ ResizeableImageComponent.module.scss
│  │  │  │  │  │  ├─ TextEditor.module.scss
│  │  │  │  │  │  └─ Toolbar.module.scss
│  │  │  │  │  └─ TextEditor.tsx
│  │  │  │  ├─ feedback
│  │  │  │  │  ├─ Alert.tsx
│  │  │  │  │  ├─ etc
│  │  │  │  │  │  └─ alert.type.ts
│  │  │  │  │  ├─ FadeWrapper.tsx
│  │  │  │  │  ├─ LoadingSpinner.tsx
│  │  │  │  │  └─ styles
│  │  │  │  │     ├─ Alert.module.scss
│  │  │  │  │     ├─ FadeWrapper.module.scss
│  │  │  │  │     └─ loading.module.scss
│  │  │  │  ├─ form-properties
│  │  │  │  │  ├─ Button.tsx
│  │  │  │  │  ├─ ButtonBasic.tsx
│  │  │  │  │  ├─ CheckBox.tsx
│  │  │  │  │  ├─ CheckIconBox.tsx
│  │  │  │  │  ├─ DatePicker.tsx
│  │  │  │  │  ├─ DateRangePicker.tsx
│  │  │  │  │  ├─ DateTimePicker.tsx
│  │  │  │  │  ├─ DateTimeRangePicker.tsx
│  │  │  │  │  ├─ Input.tsx
│  │  │  │  │  ├─ InputBasic.tsx
│  │  │  │  │  ├─ InputColor.tsx
│  │  │  │  │  ├─ InputComment.tsx
│  │  │  │  │  ├─ InputSearch.tsx
│  │  │  │  │  ├─ InputTextArea.tsx
│  │  │  │  │  ├─ Radio.tsx
│  │  │  │  │  ├─ ScorePicker.tsx
│  │  │  │  │  ├─ SelectBox.tsx
│  │  │  │  │  ├─ SelectBoxBasic.tsx
│  │  │  │  │  ├─ styles
│  │  │  │  │  │  ├─ Button.module.scss
│  │  │  │  │  │  ├─ ButtonBasic.module.scss
│  │  │  │  │  │  ├─ CheckBox.module.scss
│  │  │  │  │  │  ├─ DateTimeRangePicker.module.scss
│  │  │  │  │  │  ├─ Input.module.scss
│  │  │  │  │  │  ├─ InputBasic.module.scss
│  │  │  │  │  │  ├─ InputColor.module.scss
│  │  │  │  │  │  ├─ InputComment.module.scss
│  │  │  │  │  │  ├─ InputSearch.module.scss
│  │  │  │  │  │  ├─ InputTextArea.module.scss
│  │  │  │  │  │  ├─ Radio.module.scss
│  │  │  │  │  │  ├─ ScorePicker.module.scss
│  │  │  │  │  │  ├─ SelectBox.module.scss
│  │  │  │  │  │  ├─ SelectBoxBasic.module.scss
│  │  │  │  │  │  └─ Toggle.module.scss
│  │  │  │  │  ├─ Toggle.tsx
│  │  │  │  │  ├─ types
│  │  │  │  │  │  └─ grid-props.type.ts
│  │  │  │  │  └─ types.ts
│  │  │  │  ├─ layout
│  │  │  │  │  ├─ BreadCrumb.tsx
│  │  │  │  │  ├─ Card.tsx
│  │  │  │  │  ├─ CommonTabs.tsx
│  │  │  │  │  ├─ ContentCard.tsx
│  │  │  │  │  ├─ Dialog.tsx
│  │  │  │  │  ├─ DropModal.tsx
│  │  │  │  │  ├─ Header.tsx
│  │  │  │  │  ├─ HeaderMenuBar.tsx
│  │  │  │  │  ├─ HeaderText.tsx
│  │  │  │  │  ├─ List.tsx
│  │  │  │  │  ├─ ListContentLine.tsx
│  │  │  │  │  ├─ Modal.tsx
│  │  │  │  │  ├─ NewListContentCard.tsx
│  │  │  │  │  ├─ Pagination.tsx
│  │  │  │  │  ├─ SideBar.tsx
│  │  │  │  │  ├─ SortableList.tsx
│  │  │  │  │  ├─ SpaceInCard.tsx
│  │  │  │  │  ├─ styles
│  │  │  │  │  │  ├─ BreadCrumb.module.scss
│  │  │  │  │  │  ├─ Card.module.scss
│  │  │  │  │  │  ├─ ContentCard.module.scss
│  │  │  │  │  │  ├─ Dialog.module.scss
│  │  │  │  │  │  ├─ DropModal.module.scss
│  │  │  │  │  │  ├─ Header.module.scss
│  │  │  │  │  │  ├─ HeaderMenuBar.module.scss
│  │  │  │  │  │  ├─ HeaderText.module.scss
│  │  │  │  │  │  ├─ List.module.scss
│  │  │  │  │  │  ├─ ListContentLine.module.scss
│  │  │  │  │  │  ├─ Modal.module.scss
│  │  │  │  │  │  ├─ NewListContentCard.module.scss
│  │  │  │  │  │  ├─ Pagination.module.scss
│  │  │  │  │  │  ├─ SideBar.module.scss
│  │  │  │  │  │  ├─ SpaceInCard.module.scss
│  │  │  │  │  │  └─ Tabs.module.scss
│  │  │  │  │  └─ Tabs.tsx
│  │  │  │  ├─ loading
│  │  │  │  ├─ preview
│  │  │  │  │  ├─ ExcelPreview.module.scss
│  │  │  │  │  ├─ ExcelPreview.tsx
│  │  │  │  │  ├─ PdfPreview.tsx
│  │  │  │  │  └─ PptPreview.tsx
│  │  │  │  └─ segment
│  │  │  │     ├─ BackgroundSetter.tsx
│  │  │  │     ├─ ColoredCircle.tsx
│  │  │  │     ├─ CommonButtonGroup.tsx
│  │  │  │     ├─ ContextMenuComponent.tsx
│  │  │  │     ├─ CountingItem.tsx
│  │  │  │     ├─ Divider.tsx
│  │  │  │     ├─ etc
│  │  │  │     │  └─ list-content-card.type.ts
│  │  │  │     ├─ IconImage.tsx
│  │  │  │     ├─ IconNode.tsx
│  │  │  │     ├─ MenuName.tsx
│  │  │  │     ├─ ProfileImage.tsx
│  │  │  │     ├─ StatusItem.tsx
│  │  │  │     ├─ StatusPrefix.tsx
│  │  │  │     ├─ styles
│  │  │  │     │  ├─ ColoredCircle.module.scss
│  │  │  │     │  ├─ CommonButtonGroup.module.scss
│  │  │  │     │  ├─ ContextMenuComponent.module.scss
│  │  │  │     │  ├─ CountingItem.module.scss
│  │  │  │     │  ├─ IconImage.module.scss
│  │  │  │     │  ├─ IconNode.module.scss
│  │  │  │     │  ├─ MenuName.module.scss
│  │  │  │     │  ├─ profileImage.module.scss
│  │  │  │     │  ├─ StatusItem.module.scss
│  │  │  │     │  ├─ StatusPrefix.module.scss
│  │  │  │     │  ├─ SubTitle.module.scss
│  │  │  │     │  ├─ TimePicker.module.scss
│  │  │  │     │  └─ Tooltip.module.scss
│  │  │  │     ├─ SubTitle.tsx
│  │  │  │     ├─ TimePicker.tsx
│  │  │  │     └─ Tooltip.tsx
│  │  │  └─ src
│  │  │     ├─ admin
│  │  │     │  ├─ AddForm.tsx
│  │  │     │  ├─ SystemSideBar.tsx
│  │  │     │  ├─ AdminAssignRole.tsx
│  │  │     │  ├─ AdminBoard.tsx
│  │  │     │  ├─ AdminMenu.tsx
│  │  │     │  ├─ AdminProof.tsx
│  │  │     │  ├─ AdminRole.tsx
│  │  │     │  ├─ AdminSubSideBar.tsx
│  │  │     │  ├─ etc
│  │  │     │  │  ├─ admin-type.ts
│  │  │     │  │  ├─ grid-columns
│  │  │     │  │  │  ├─ each-menu-column.ts
│  │  │     │  │  │  ├─ menu-column.ts
│  │  │     │  │  │  ├─ proof-form-column.ts
│  │  │     │  │  │  ├─ role-column.ts
│  │  │     │  │  │  └─ user-column.ts
│  │  │     │  │  ├─ initial-state.ts
│  │  │     │  │  ├─ tiptap-convert-standard-style.ts
│  │  │     │  │  ├─ url.enum.ts
│  │  │     │  │  └─ validate.ts
│  │  │     │  ├─ modal
│  │  │     │  │  ├─ AddMenu.tsx
│  │  │     │  │  ├─ AddRole.tsx
│  │  │     │  │  └─ AddRoleMenu.tsx
│  │  │     │  └─ styles
│  │  │     │     ├─ AddMenu.module.scss
│  │  │     │     └─ Admin.module.scss
│  │  │     ├─ community
│  │  │     │  ├─ board
│  │  │     │  │  ├─ AddBoard.tsx
│  │  │     │  │  ├─ AddCustomBoard.tsx
│  │  │     │  │  ├─ AddPost.tsx
│  │  │     │  │  ├─ BoardSideBar.tsx
│  │  │     │  │  ├─ Comment.tsx
│  │  │     │  │  ├─ etc
│  │  │     │  │  │  ├─ board.type.ts
│  │  │     │  │  │  └─ validate.ts
│  │  │     │  │  ├─ ListContentCard.tsx
│  │  │     │  │  ├─ PostList.tsx
│  │  │     │  │  ├─ PostSetting.tsx
│  │  │     │  │  ├─ PostView.tsx
│  │  │     │  │  └─ styles
│  │  │     │  │     ├─ AddCustomBoard.module.scss
│  │  │     │  │     ├─ AddPost.module.scss
│  │  │     │  │     ├─ BoardList.module.scss
│  │  │     │  │     ├─ Comment.module.scss
│  │  │     │  │     ├─ ListContentCard.module.scss
│  │  │     │  │     └─ PostView.module.scss
│  │  │     │  └─ poll
│  │  │     │     ├─ AddPoll.tsx
│  │  │     │     ├─ etc
│  │  │     │     │  ├─ poll-result-columns.ts
│  │  │     │     │  ├─ url.enum.ts
│  │  │     │     │  └─ validate.ts
│  │  │     │     ├─ GuidePoll.tsx
│  │  │     │     ├─ ListContentCard.tsx
│  │  │     │     ├─ modal
│  │  │     │     ├─ PollInfo.tsx
│  │  │     │     ├─ PollList.tsx
│  │  │     │     ├─ PreviewPoll.tsx
│  │  │     │     ├─ QuestionNodes.tsx
│  │  │     │     ├─ RespondPoll.tsx
│  │  │     │     ├─ ResultPoll.tsx
│  │  │     │     ├─ side-bar
│  │  │     │     │  └─ PollSideBar.tsx
│  │  │     │     └─ styles
│  │  │     │        ├─ AddPoll.module.scss
│  │  │     │        ├─ ListContentCard.module.scss
│  │  │     │        └─ PollInfo.module.scss
│  │  │     ├─ docs
│  │  │     │  ├─ AddDocDetail.tsx
│  │  │     │  ├─ etc
│  │  │     │  │  ├─ docs.type.ts
│  │  │     │  │  ├─ field-node-map.ts
│  │  │     │  │  ├─ url.enum.ts
│  │  │     │  │  └─ validate.ts
│  │  │     │  ├─ modal
│  │  │     │  │  ├─ AddDoc.tsx
│  │  │     │  │  ├─ AddOpinion.tsx
│  │  │     │  │  ├─ AddRole.tsx
│  │  │     │  │  └─ AddRoleMenu.tsx
│  │  │     │  ├─ ProofList.tsx
│  │  │     │  ├─ ReceivedReq.tsx
│  │  │     │  ├─ side-bar
│  │  │     │  │  └─ DocsSideBar.tsx
│  │  │     │  ├─ StatusDashboard.tsx
│  │  │     │  ├─ styles
│  │  │     │  │  ├─ AddDoc.module.scss
│  │  │     │  │  └─ StatusDashboard.module.scss
│  │  │     │  └─ ViewProof.tsx
│  │  │     ├─ draft
│  │  │     │  ├─ ApprovalLineList.tsx
│  │  │     │  ├─ AttachmentList.tsx
│  │  │     │  ├─ dashboard
│  │  │     │  │  └─ DraftDashboard.tsx
│  │  │     │  ├─ DraftFormCard.tsx
│  │  │     │  ├─ DraftFormList.tsx
│  │  │     │  ├─ DraftWriter.tsx
│  │  │     │  ├─ DraftWriterComponent.tsx
│  │  │     │  ├─ my-document
│  │  │     │  │  ├─ MyDocumentCompleted.tsx
│  │  │     │  │  ├─ MyDocumentProcessing.tsx
│  │  │     │  │  └─ MyDocumentRejected.tsx
│  │  │     │  └─ styles
│  │  │     │     ├─ ApprovalLineList.module.scss
│  │  │     │     ├─ DraftDashboard.module.scss
│  │  │     │     ├─ DraftFormCard.module.scss
│  │  │     │     ├─ DraftFormList.module.scss
│  │  │     │     └─ DraftWriter.module.scss
│  │  │     ├─ home
│  │  │     │  ├─ modal
│  │  │     │  │  └─ PostViewBrief.tsx
│  │  │     │  └─ styles
│  │  │     │     └─ PostViewBrief.module.scss
│  │  │     ├─ mail
│  │  │     │  ├─ AddContact.tsx
│  │  │     │  ├─ ContactList.tsx
│  │  │     │  ├─ ContactListLine.tsx
│  │  │     │  ├─ etc
│  │  │     │  │  ├─ docs.type.ts
│  │  │     │  │  ├─ field-node-map.ts
│  │  │     │  │  ├─ url.enum.ts
│  │  │     │  │  └─ validate.ts
│  │  │     │  ├─ inner
│  │  │     │  │  ├─ ContactHeaderBtnGroup.tsx
│  │  │     │  │  ├─ MailHeaderBtnGroup.tsx
│  │  │     │  │  ├─ SettingAutograph.tsx
│  │  │     │  │  ├─ SettingAutoSort.tsx
│  │  │     │  │  ├─ SettingBasic.tsx
│  │  │     │  │  ├─ SettingFolder.tsx
│  │  │     │  │  └─ SettingForwarding.tsx
│  │  │     │  ├─ MailList.tsx
│  │  │     │  ├─ MailListLine.tsx
│  │  │     │  ├─ MailSetting.tsx
│  │  │     │  ├─ MailView.tsx
│  │  │     │  ├─ side-bar
│  │  │     │  │  ├─ ContactSideBar.tsx
│  │  │     │  │  └─ MailListSideBar.tsx
│  │  │     │  ├─ styles
│  │  │     │  │  ├─ AddContact.module.scss
│  │  │     │  │  ├─ ContactList.module.scss
│  │  │     │  │  ├─ MailList.module.scss
│  │  │     │  │  ├─ MailListLine.module.scss
│  │  │     │  │  ├─ MailSetting.module.scss
│  │  │     │  │  ├─ MailSidebar.module.scss
│  │  │     │  │  ├─ MailView.module.scss
│  │  │     │  │  └─ WriteMail.module.scss
│  │  │     │  └─ WriteMail.tsx
│  │  │     ├─ plan
│  │  │     │  ├─ Calendar.tsx
│  │  │     │  ├─ FullCalendar.tsx
│  │  │     │  ├─ modal
│  │  │     │  │  ├─ AddingCal.tsx
│  │  │     │  │  ├─ AddNewBooking.tsx
│  │  │     │  │  ├─ AddNewDayOff.tsx
│  │  │     │  │  ├─ AddNewSchedule.tsx
│  │  │     │  │  ├─ AddNewTask.tsx
│  │  │     │  │  ├─ PlanAddModal.tsx
│  │  │     │  │  ├─ PlanAddModalHeader.tsx
│  │  │     │  │  └─ PlanViewModal.tsx
│  │  │     │  ├─ CalendarSideBar.tsx
│  │  │     │  ├─ RepeatNodes.tsx
│  │  │     │  └─ styles
│  │  │     │     ├─ FullCalendar.scss
│  │  │     │     ├─ PlanModal.module.scss
│  │  │     │     ├─ CalendarSideBar.module.scss
│  │  │     │     └─ RepeatNodes.module.scss
│  │  │     └─ poll
│  │  ├─ context
│  │  │  ├─ AdminContext.tsx
│  │  │  ├─ AlertContext.tsx
│  │  │  ├─ BoardContext.tsx
│  │  │  ├─ ContextMenu.tsx
│  │  │  ├─ DocsContext.tsx
│  │  │  ├─ DraftContext.tsx
│  │  │  ├─ FormContext.tsx
│  │  │  ├─ MailContext.tsx
│  │  │  ├─ MenuContext.tsx
│  │  │  ├─ PlanContext.tsx
│  │  │  ├─ PollContext.tsx
│  │  │  ├─ PrefixContext.tsx
│  │  │  └─ UserContext.tsx
│  │  ├─ fonts
│  │  │  └─ PretendardVariable.woff2
│  │  ├─ hooks
│  │  │  ├─ useClickOutside.tsx
│  │  │  ├─ useDialog.tsx
│  │  │  ├─ useDynamicMeta.ts
│  │  │  ├─ useIsMounted.ts
│  │  │  └─ useModal.tsx
│  │  ├─ portals
│  │  │  └─ AlertPortal.tsx
│  │  ├─ reducers
│  │  │  ├─ board.reducer.ts
│  │  │  ├─ doc.reducer.ts
│  │  │  ├─ etc
│  │  │  │  ├─ board-initial-state.ts
│  │  │  │  ├─ doc-initial-state.ts
│  │  │  │  ├─ plan-initial-state.ts
│  │  │  │  └─ poll-reducer-helper.ts
│  │  │  ├─ plan.reducer.ts
│  │  │  └─ poll.reducer.ts
│  │  ├─ services
│  │  │  ├─ alert.service.ts
│  │  │  └─ personal-contact.service.ts
│  │  ├─ styles
│  │  │  ├─ common.scss
│  │  │  ├─ globals.scss
│  │  │  ├─ print.scss
│  │  │  ├─ tiptap.scss
│  │  │  └─ variables.scss
│  │  ├─ types
│  │  │  ├─ common.type.ts
│  │  │  ├─ draft.ts
│  │  │  ├─ draft.type.ts
│  │  │  ├─ mail.type.ts
│  │  │  ├─ menu.type.ts
│  │  │  ├─ plan.type.ts
│  │  │  ├─ poll.type.ts
│  │  │  ├─ user-role.type.ts
│  │  │  └─ user.type.ts
│  │  └─ util
│  │     ├─ axios
│  │     │  ├─ api-service.ts
│  │     │  └─ axios-instance.ts
│  │     ├─ common
│  │     │  ├─ config.ts
│  │     │  ├─ last-url.ts
│  │     │  ├─ menu-redirect.ts
│  │     │  ├─ pdf-export.ts
│  │     │  └─ storage.ts
│  │     ├─ helpers
│  │     │  ├─ calendar-helper.ts
│  │     │  ├─ case-converter.ts
│  │     │  ├─ chunk-array-slicer.ts
│  │     │  ├─ color-helper.ts
│  │     │  ├─ copy-text.ts
│  │     │  ├─ formatters.ts
│  │     │  ├─ parseXml.ts
│  │     │  ├─ random-generator.ts
│  │     │  └─ timezone.ts
│  │     ├─ print
│  │     │  └─ print-utils.ts
│  │     └─ validators
│  │        ├─ check-empty.ts
│  │        └─ check-manager.ts
│  ├─ tiptap-augmentations.d.ts
│  └─ tsconfig.json
├─ gateway
│  ├─ .env.development
│  ├─ .env.production
│  ├─ .env.stage
│  ├─ .yo-rc.json
│  ├─ config
│  │  ├─ gateway.config.template.yml
│  │  ├─ gateway.config.yml
│  │  ├─ models
│  │  │  ├─ applications.json
│  │  │  ├─ credentials.json
│  │  │  └─ users.json
│  │  ├─ system.config.template.yml
│  │  └─ system.config.yml
│  ├─ keys
│  ├─ manifest.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ server.js
│  ├─ start-gateway.ps1
│  └─ start-gateway.sh
├─ package-lock.json
├─ package.json
├─ quick-network-test.sh
├─ README.md
├─ server
│  ├─ attendance
│  │  ├─ .eslintrc.js
│  │  ├─ .prettierrc
│  │  ├─ keys
│  │  ├─ nest-cli.json
│  │  ├─ package-lock.json
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ app.module.ts
│  │  │  ├─ batch
│  │  │  │  ├─ task.controller.ts
│  │  │  │  ├─ task.module.ts
│  │  │  │  └─ task.service.ts
│  │  │  ├─ common
│  │  │  │  ├─ dto
│  │  │  │  │  └─ common.dto.ts
│  │  │  │  ├─ interceptor
│  │  │  │  │  ├─ payload-to-body.interceptor.ts
│  │  │  │  │  └─ request-info.interceptor.ts
│  │  │  │  └─ util
│  │  │  │     ├─ axios.ts
│  │  │  │     ├─ check-empty.ts
│  │  │  │     ├─ pagination.helper.ts
│  │  │  │     ├─ partial-dto.ts
│  │  │  │     ├─ query-strategy.helper.ts
│  │  │  │     ├─ random-generator.ts
│  │  │  │     ├─ result.ts
│  │  │  │     └─ transformer.ts
│  │  │  ├─ config
│  │  │  │  ├─ env
│  │  │  │  │  ├─ .env.development
│  │  │  │  │  ├─ .env.production
│  │  │  │  │  └─ .env.stage
│  │  │  │  └─ orm.config.ts
│  │  │  ├─ main.ts
│  │  │  ├─ middleware
│  │  │  │  └─ logger.middleware.ts
│  │  │  └─ modules
│  │  │     ├─ attendance
│  │  │     │  ├─ attendance.module.ts
│  │  │     │  ├─ controller
│  │  │     │  │  └─ attendance.controller.ts
│  │  │     │  ├─ dto
│  │  │     │  │  ├─ req
│  │  │     │  │  │  ├─ attendance-log.req-dto.ts
│  │  │     │  │  │  ├─ emp-work-policy.req-dto.ts
│  │  │     │  │  │  ├─ employee.req-dto.ts
│  │  │     │  │  │  ├─ leave-request.req-dto.ts
│  │  │     │  │  │  ├─ payroll.req-dto.ts
│  │  │     │  │  │  ├─ work-calendar.req-dto.ts
│  │  │     │  │  │  └─ work-policy.req-dto.ts
│  │  │     │  │  └─ res
│  │  │     │  │     ├─ attendance-log.res-dto.ts
│  │  │     │  │     ├─ emp-work-policy.res-dto.ts
│  │  │     │  │     ├─ employee.res-dto.ts
│  │  │     │  │     ├─ leave-request.res-dto.ts
│  │  │     │  │     ├─ payroll.res-dto.ts
│  │  │     │  │     ├─ work-calendar.res-dto.ts
│  │  │     │  │     └─ work-policy.res-dto.ts
│  │  │     │  ├─ entity
│  │  │     │  │  ├─ attendance-log.entity.ts
│  │  │     │  │  ├─ emp-work-policy.entity.ts
│  │  │     │  │  ├─ employee.entity.ts
│  │  │     │  │  ├─ leave-request.entity.ts
│  │  │     │  │  ├─ payroll.entity.ts
│  │  │     │  │  ├─ work-calendar.entity.ts
│  │  │     │  │  └─ work-policy.entity.ts
│  │  │     │  ├─ etc
│  │  │     │  │  ├─ contact-helper.ts
│  │  │     │  │  └─ contact.type.ts
│  │  │     │  └─ service
│  │  │     │     └─ attendance.service.ts
│  │  │     └─ side-menu
│  │  │        ├─ attendance-menu.module.ts
│  │  │        ├─ controller
│  │  │        │  └─ attendance-menu.controller.ts
│  │  │        ├─ dto
│  │  │        │  ├─ req
│  │  │        │  │  └─ attendance-menu.req-dto.ts
│  │  │        │  └─ res
│  │  │        │     └─ attendance-menu.res-dto.ts
│  │  │        ├─ entity
│  │  │        │  └─ attendance-menu.entity.ts
│  │  │        └─ service
│  │  │           └─ attendance-menu.service.ts
│  │  └─ tsconfig.json
│  ├─ auth
│  │  ├─ .eslintrc.js
│  │  ├─ .prettierrc
│  │  ├─ keys
│  │  ├─ nest-cli.json
│  │  ├─ package-lock.json
│  │  ├─ package.json
│  │  ├─ src
│  │  │  ├─ admin
│  │  │  │  ├─ admin.controller.ts
│  │  │  │  ├─ admin.module.ts
│  │  │  │  ├─ dto
│  │  │  │  │  ├─ request-dto
│  │  │  │  │  │  └─ admin-menu.req-dto.ts
│  │  │  │  │  └─ response-dto
│  │  │  │  │     └─ admin-menu.res-dto.ts
│  │  │  │  ├─ entities
│  │  │  │  │  └─ admin-menu.entity.ts
│  │  │  │  └─ services
│  │  │  │     └─ admin-menu.service.ts
│  │  │  ├─ app.module.ts
│  │  │  ├─ batch
│  │  │  │  ├─ task.module.ts
│  │  │  │  └─ task.service.ts
│  │  │  ├─ common
│  │  │  │  ├─ dto
│  │  │  │  │  └─ common.dto.ts
│  │  │  │  ├─ interceptor
│  │  │  │  │  ├─ payload-to-body.interceptor.ts
│  │  │  │  │  └─ request-info.interceptor.ts
│  │  │  │  └─ util
│  │  │  │     ├─ axios.ts
│  │  │  │     ├─ check-empty.ts
│  │  │  │     ├─ partial-dto.ts
│  │  │  │     ├─ result.ts
│  │  │  │     ├─ transformer.ts
│  │  │  │     └─ uuid.ts
│  │  │  ├─ config
│  │  │  │  ├─ env
│  │  │  │  │  ├─ .env.development
│  │  │  │  │  ├─ .env.production
│  │  │  │  │  └─ .env.stage
│  │  │  │  └─ orm.config.ts
│  │  │  ├─ helpers
│  │  │  │  └─ password.ts
│  │  │  ├─ jwt
│  │  │  │  ├─ dto
│  │  │  │  │  ├─ req
│  │  │  │  │  │  └─ token.req-dto.ts
│  │  │  │  │  └─ res
│  │  │  │  │     └─ token.res-dto.ts
│  │  │  │  ├─ entity
│  │  │  │  │  └─ token.entity.ts
│  │  │  │  ├─ jwt.controller.ts
│  │  │  │  ├─ jwt.module.ts
│  │  │  │  ├─ service
│  │  │  │  │  └─ jwt.service.ts
│  │  │  │  └─ types
│  │  │  │     └─ tokens.type.ts
│  │  │  ├─ main.ts
│  │  │  ├─ middlewares
│  │  │  │  └─ logger.middleware.ts
│  │  │  └─ users
│  │  │     ├─ dto
│  │  │     │  ├─ req
│  │  │     │  │  ├─ role-menu-map.req-dto.ts
│  │  │     │  │  ├─ role.req-dto.ts
│  │  │     │  │  └─ user.req-dto.ts
│  │  │     │  └─ res
│  │  │     │     ├─ role-menu-map.res-dto.ts
│  │  │     │     ├─ role.res-dto.ts
│  │  │     │     └─ user.res-dto.ts
│  │  │     ├─ entity
│  │  │     │  ├─ role-menu-map.entity.ts
│  │  │     │  ├─ role.entity.ts
│  │  │     │  ├─ user-autograph.entity.ts
│  │  │     │  └─ user.entity.ts
│  │  │     ├─ service
│  │  │     │  ├─ role.service.ts
│  │  │     │  └─ user.service.ts
│  │  │     ├─ types
│  │  │     │  └─ user.type.ts
│  │  │     ├─ users.controller.ts
│  │  │     └─ users.module.ts
│  │  └─ tsconfig.json
│  ├─ board
│  │  ├─ .eslintrc.js
│  │  ├─ .prettierrc
│  │  ├─ keys
│  │  ├─ nest-cli.json
│  │  ├─ package-lock.json
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ app.module.ts
│  │  │  ├─ common
│  │  │  │  ├─ dto
│  │  │  │  │  └─ common.dto.ts
│  │  │  │  ├─ interceptor
│  │  │  │  │  ├─ payload-to-body.interceptor.ts
│  │  │  │  │  └─ request-info.interceptor.ts
│  │  │  │  └─ util
│  │  │  │     ├─ axios.ts
│  │  │  │     ├─ check-empty.ts
│  │  │  │     ├─ partial-dto.ts
│  │  │  │     ├─ result.ts
│  │  │  │     ├─ transformer.ts
│  │  │  │     └─ uuid.ts
│  │  │  ├─ config
│  │  │  │  ├─ env
│  │  │  │  │  ├─ .env.development
│  │  │  │  │  ├─ .env.production
│  │  │  │  │  └─ .env.stage
│  │  │  │  └─ orm.config.ts
│  │  │  ├─ helpers
│  │  │  │  ├─ check-empty.ts
│  │  │  │  └─ uuid.ts
│  │  │  ├─ main.ts
│  │  │  ├─ middlewares
│  │  │  │  └─ logger.middleware.ts
│  │  │  └─ modules
│  │  │     ├─ batch
│  │  │     │  ├─ task.controller.ts
│  │  │     │  ├─ task.module.ts
│  │  │     │  └─ task.service.ts
│  │  │     └─ board
│  │  │        ├─ board.module.ts
│  │  │        ├─ controllers
│  │  │        │  ├─ board-menu.controller.ts
│  │  │        │  └─ board.controller.ts
│  │  │        ├─ dto
│  │  │        │  ├─ request-dto
│  │  │        │  │  ├─ board-menu.req-dto.ts
│  │  │        │  │  ├─ board-setting.req-dto.ts
│  │  │        │  │  ├─ comment.req-dto.ts
│  │  │        │  │  ├─ pagination.req-dto.ts
│  │  │        │  │  ├─ post-scrap.req-dto.ts
│  │  │        │  │  ├─ post.req-dto.ts
│  │  │        │  │  └─ view-count.req-dto.ts
│  │  │        │  └─ response-dto
│  │  │        │     ├─ board-menu.res-dto.ts
│  │  │        │     ├─ board-setting.res-dto.ts
│  │  │        │     ├─ comment.res-dto.ts
│  │  │        │     ├─ pagination.res-dto.ts
│  │  │        │     ├─ post-scrap.res-dto.ts
│  │  │        │     ├─ post.res-dto.ts
│  │  │        │     └─ view-count.res-dto.ts
│  │  │        ├─ entities
│  │  │        │  ├─ board-menu.entity.ts
│  │  │        │  ├─ board-setting.entity.ts
│  │  │        │  ├─ comment.entity.ts
│  │  │        │  ├─ post-scrap.entity.ts
│  │  │        │  ├─ post.entity.ts
│  │  │        │  └─ view-count.entity.ts
│  │  │        └─ services
│  │  │           ├─ board-menu.service.ts
│  │  │           ├─ board-setting.service.ts
│  │  │           ├─ comment.service.ts
│  │  │           ├─ post-scrap.service.ts
│  │  │           ├─ post.service.ts
│  │  │           └─ view-count.service.ts
│  │  └─ tsconfig.json
│  ├─ docs
│  │  ├─ .eslintrc.js
│  │  ├─ .prettierrc
│  │  ├─ keys
│  │  ├─ nest-cli.json
│  │  ├─ package-lock.json
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ app.module.ts
│  │  │  ├─ batch
│  │  │  │  ├─ task.module.ts
│  │  │  │  └─ task.service.ts
│  │  │  ├─ common
│  │  │  │  ├─ dto
│  │  │  │  │  └─ common.dto.ts
│  │  │  │  ├─ interceptor
│  │  │  │  │  ├─ payload-to-body.interceptor.ts
│  │  │  │  │  └─ request-info.interceptor.ts
│  │  │  │  └─ util
│  │  │  │     ├─ axios.ts
│  │  │  │     ├─ check-empty.ts
│  │  │  │     ├─ partial-dto.ts
│  │  │  │     ├─ result.ts
│  │  │  │     ├─ transformer.ts
│  │  │  │     └─ uuid.ts
│  │  │  ├─ config
│  │  │  │  ├─ env
│  │  │  │  │  ├─ .env.development
│  │  │  │  │  ├─ .env.production
│  │  │  │  │  └─ .env.stage
│  │  │  │  └─ orm.config.ts
│  │  │  ├─ main.ts
│  │  │  ├─ middlewares
│  │  │  │  └─ logger.middleware.ts
│  │  │  └─ modules
│  │  │     └─ docs
│  │  │        ├─ docs.controller.ts
│  │  │        ├─ docs.module.ts
│  │  │        ├─ dto
│  │  │        │  ├─ req
│  │  │        │  │  ├─ doc.req-dto.ts
│  │  │        │  │  ├─ docs-menu.req-dto.ts
│  │  │        │  │  ├─ form.req-dto.ts
│  │  │        │  │  ├─ meta-field.req-dto.ts
│  │  │        │  │  └─ pagination.req-dto.ts
│  │  │        │  └─ res
│  │  │        │     ├─ doc.res-dto.ts
│  │  │        │     ├─ docs-menu.res-dto.ts
│  │  │        │     ├─ form.res-dto.ts
│  │  │        │     ├─ meta-field.res-dto.ts
│  │  │        │     └─ pagination.res-dto.ts
│  │  │        ├─ entities
│  │  │        │  ├─ doc-resp.entity.ts
│  │  │        │  ├─ doc.entity.ts
│  │  │        │  ├─ docs-menu.entity.ts
│  │  │        │  ├─ form.entity.ts
│  │  │        │  └─ meta-field.entity.ts
│  │  │        ├─ etc
│  │  │        │  └─ doc.type.ts
│  │  │        └─ services
│  │  │           ├─ dash-board.service.ts
│  │  │           ├─ docs-menu.service.ts
│  │  │           ├─ docs.service.ts
│  │  │           └─ form.service.ts
│  │  └─ tsconfig.json
│  ├─ draft
│  │  ├─ .prettierrc
│  │  ├─ eslint.config.mjs
│  │  ├─ keys
│  │  ├─ nest-cli.json
│  │  ├─ package-lock.json
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ app.module.ts
│  │  │  ├─ common
│  │  │  │  ├─ check-empty.ts
│  │  │  │  ├─ dto
│  │  │  │  │  └─ common.dto.ts
│  │  │  │  ├─ guard
│  │  │  │  │  └─ jwt-auth.guard.ts
│  │  │  │  ├─ interceptor
│  │  │  │  │  ├─ payload-to-body.interceptor.ts
│  │  │  │  │  └─ request-info.interceptor.ts
│  │  │  │  ├─ partial-dto.ts
│  │  │  │  ├─ result.ts
│  │  │  │  ├─ transformer.ts
│  │  │  │  ├─ util
│  │  │  │  │  ├─ axios.ts
│  │  │  │  │  ├─ check-empty.ts
│  │  │  │  │  ├─ partial-dto.ts
│  │  │  │  │  ├─ result.ts
│  │  │  │  │  ├─ transformer.ts
│  │  │  │  │  └─ uuid.ts
│  │  │  │  └─ utils
│  │  │  │     └─ id-generator.util.ts
│  │  │  ├─ config
│  │  │  │  ├─ env
│  │  │  │  │  ├─ .env.development
│  │  │  │  │  ├─ .env.production
│  │  │  │  │  └─ .env.stage
│  │  │  │  └─ orm.config.ts
│  │  │  ├─ drafts
│  │  │  │  ├─ controller
│  │  │  │  │  └─ draft.controller.ts
│  │  │  │  ├─ draft.module.ts
│  │  │  │  ├─ dto
│  │  │  │  │  ├─ req-dto
│  │  │  │  │  │  ├─ draft-basic.req-dto.ts
│  │  │  │  │  │  ├─ draft-forms.req-dto.ts
│  │  │  │  │  │  └─ draft-menu.req-dto.ts
│  │  │  │  │  └─ res-dto
│  │  │  │  │     ├─ draft-basic.res-dto.ts
│  │  │  │  │     ├─ draft-forms.res-dto.ts
│  │  │  │  │     └─ draft-menu.res-dto.ts
│  │  │  │  ├─ entities
│  │  │  │  │  ├─ approval-history.entity.ts
│  │  │  │  │  ├─ attached-files.entity.ts
│  │  │  │  │  ├─ custom-approval-line.entity.entity.ts
│  │  │  │  │  ├─ custom-line-basic.entity.ts
│  │  │  │  │  ├─ custom-reference-line.entity.ts
│  │  │  │  │  ├─ defined-approval-line.entity.ts
│  │  │  │  │  ├─ defined-line-basic.entity.ts
│  │  │  │  │  ├─ defined-reference-line.entity.ts
│  │  │  │  │  ├─ draft-approval-lines.entity.ts
│  │  │  │  │  ├─ draft-basic.entity.ts
│  │  │  │  │  ├─ draft-forms.entity.ts
│  │  │  │  │  ├─ draft-menu.entity.ts
│  │  │  │  │  ├─ draft-opinion.entity.ts
│  │  │  │  │  └─ draft-setting.entity.ts
│  │  │  │  └─ services
│  │  │  │     ├─ draft-basic.services.ts
│  │  │  │     ├─ draft-forms.services.ts
│  │  │  │     └─ draft-menu.services.ts
│  │  │  ├─ main.ts
│  │  │  └─ middlewares
│  │  │     └─ logger.middleware.ts
│  │  ├─ test
│  │  │  ├─ app.e2e-spec.ts
│  │  │  └─ jest-e2e.json
│  │  └─ tsconfig.json
│  ├─ file
│  │  ├─ .eslintrc.js
│  │  ├─ .prettierrc
│  │  ├─ keys
│  │  ├─ nest-cli.json
│  │  ├─ package-lock.json
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ app.module.ts
│  │  │  ├─ common
│  │  │  │  ├─ dto
│  │  │  │  │  └─ common.dto.ts
│  │  │  │  ├─ interceptor
│  │  │  │  │  ├─ payload-to-body.interceptor.ts
│  │  │  │  │  └─ request-info.interceptor.ts
│  │  │  │  └─ util
│  │  │  │     ├─ axios.ts
│  │  │  │     ├─ check-empty.ts
│  │  │  │     ├─ partial-dto.ts
│  │  │  │     ├─ random-generator.ts
│  │  │  │     ├─ result.ts
│  │  │  │     └─ transformer.ts
│  │  │  ├─ config
│  │  │  │  ├─ env
│  │  │  │  │  ├─ .env.development
│  │  │  │  │  ├─ .env.production
│  │  │  │  │  └─ .env.stage
│  │  │  │  └─ orm.config.ts
│  │  │  ├─ main.ts
│  │  │  ├─ middlewares
│  │  │  │  └─ logger.middleware.ts
│  │  │  └─ modules
│  │  │     └─ file
│  │  │        ├─ controllers
│  │  │        │  ├─ download.controller.ts
│  │  │        │  ├─ file.controller.ts
│  │  │        │  └─ fileByPass.controller.ts
│  │  │        ├─ dto
│  │  │        │  ├─ req
│  │  │        │  │  ├─ attached-file.req-dto.ts
│  │  │        │  │  └─ file.req-dto.ts
│  │  │        │  └─ res
│  │  │        │     └─ attached-file.res-dto.ts
│  │  │        ├─ entities
│  │  │        │  └─ attached-file.entity.ts
│  │  │        ├─ etc
│  │  │        │  └─ multer.option.ts
│  │  │        ├─ files.module.ts
│  │  │        └─ services
│  │  │           └─ file.service.ts
│  │  └─ tsconfig.json
│  ├─ mail
│  │  ├─ .eslintrc.js
│  │  ├─ .prettierrc
│  │  ├─ keys
│  │  ├─ nest-cli.json
│  │  ├─ package-lock.json
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ app.module.ts
│  │  │  ├─ common
│  │  │  │  ├─ dto
│  │  │  │  │  └─ common.dto.ts
│  │  │  │  ├─ interceptor
│  │  │  │  │  ├─ payload-to-body.interceptor.ts
│  │  │  │  │  └─ request-info.interceptor.ts
│  │  │  │  └─ util
│  │  │  │     ├─ axios.ts
│  │  │  │     ├─ check-empty.ts
│  │  │  │     ├─ pagination.helper.ts
│  │  │  │     ├─ partial-dto.ts
│  │  │  │     ├─ query-strategy.helper.ts
│  │  │  │     ├─ random-generator.ts
│  │  │  │     ├─ result.ts
│  │  │  │     └─ transformer.ts
│  │  │  ├─ config
│  │  │  │  ├─ env
│  │  │  │  │  ├─ .env.development
│  │  │  │  │  ├─ .env.production
│  │  │  │  │  └─ .env.stage
│  │  │  │  └─ orm.config.ts
│  │  │  ├─ main.ts
│  │  │  ├─ middleware
│  │  │  │  └─ logger.middleware.ts
│  │  │  └─ modules
│  │  │     ├─ contact
│  │  │     │  ├─ contact.module.ts
│  │  │     │  ├─ controller
│  │  │     │  │  ├─ contact.controller.ts
│  │  │     │  │  └─ personal-contact.controller.ts
│  │  │     │  ├─ dto
│  │  │     │  │  ├─ req
│  │  │     │  │  │  ├─ contact.req-dto.ts
│  │  │     │  │  │  ├─ favorite-contact.req-dto.ts
│  │  │     │  │  │  ├─ pagination.req-dto.ts
│  │  │     │  │  │  └─ personal-contact.req-dto.ts
│  │  │     │  │  └─ res
│  │  │     │  │     ├─ contact.res-dto.ts
│  │  │     │  │     ├─ favorite-contact.res-dto.ts
│  │  │     │  │     ├─ pagination.res-dto.ts
│  │  │     │  │     └─ personal-contact.res-dto.ts
│  │  │     │  ├─ entity
│  │  │     │  │  ├─ contact.entity.ts
│  │  │     │  │  ├─ favorite-contact.entity.ts
│  │  │     │  │  └─ personal-contact.entity.ts
│  │  │     │  ├─ etc
│  │  │     │  │  ├─ contact-helper.ts
│  │  │     │  │  └─ contact.type.ts
│  │  │     │  └─ service
│  │  │     │     ├─ contact.service.ts
│  │  │     │     ├─ favorite-contact.service.ts
│  │  │     │     └─ personal-contact.service.ts
│  │  │     ├─ mail
│  │  │     │  ├─ controller
│  │  │     │  │  └─ mail.controller.ts
│  │  │     │  ├─ dto
│  │  │     │  │  ├─ req
│  │  │     │  │  │  ├─ mail-message.req-dto.ts
│  │  │     │  │  │  ├─ pagination.req-dto.ts
│  │  │     │  │  │  └─ recipient.req-dto.ts
│  │  │     │  │  └─ res
│  │  │     │  │     ├─ mail-message.res-dto.ts
│  │  │     │  │     ├─ pagination.res-dto.ts
│  │  │     │  │     └─ recipient.res-dto.ts
│  │  │     │  ├─ entity
│  │  │     │  │  ├─ mail-message.entity.ts
│  │  │     │  │  └─ recipient.entity.ts
│  │  │     │  ├─ etc
│  │  │     │  │  └─ mail.type.ts
│  │  │     │  ├─ mail.module.ts
│  │  │     │  └─ service
│  │  │     │     └─ mail.service.ts
│  │  │     ├─ side-menu
│  │  │     │  ├─ controller
│  │  │     │  │  └─ mail-menu.controller.ts
│  │  │     │  ├─ dto
│  │  │     │  │  ├─ req
│  │  │     │  │  │  └─ mail-menu.req-dto.ts
│  │  │     │  │  └─ res
│  │  │     │  │     └─ mail-menu.res-dto.ts
│  │  │     │  ├─ entity
│  │  │     │  │  └─ mail-menu.entity.ts
│  │  │     │  ├─ service
│  │  │     │  │  └─ mail-menu.service.ts
│  │  │     │  └─ side-menu.module.ts
│  │  │     └─ task
│  │  │        ├─ task.controller.ts
│  │  │        ├─ task.module.ts
│  │  │        └─ task.service.ts
│  │  └─ tsconfig.json
│  ├─ menu
│  │  ├─ .eslintrc.js
│  │  ├─ .prettierrc
│  │  ├─ keys
│  │  ├─ nest-cli.json
│  │  ├─ package-lock.json
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ app.module.ts
│  │  │  ├─ batch
│  │  │  │  ├─ task.module.ts
│  │  │  │  └─ task.service.ts
│  │  │  ├─ common
│  │  │  │  ├─ dto
│  │  │  │  │  └─ common.dto.ts
│  │  │  │  ├─ interceptor
│  │  │  │  │  ├─ payload-to-body.interceptor.ts
│  │  │  │  │  └─ request-info.interceptor.ts
│  │  │  │  └─ util
│  │  │  │     ├─ axios.ts
│  │  │  │     ├─ check-empty.ts
│  │  │  │     ├─ partial-dto.ts
│  │  │  │     ├─ result.ts
│  │  │  │     ├─ transformer.ts
│  │  │  │     └─ uuid.ts
│  │  │  ├─ config
│  │  │  │  ├─ env
│  │  │  │  │  ├─ .env.development
│  │  │  │  │  ├─ .env.production
│  │  │  │  │  └─ .env.stage
│  │  │  │  └─ orm.config.ts
│  │  │  ├─ main.ts
│  │  │  ├─ menus
│  │  │  │  ├─ dto
│  │  │  │  │  ├─ req-dto
│  │  │  │  │  │  └─ menu-tree.req-dto.ts
│  │  │  │  │  ├─ res-dto
│  │  │  │  │  │  └─ menu-tree.res.dto.ts
│  │  │  │  │  ├─ SettingCode.dto.ts
│  │  │  │  │  ├─ SettingCodeDetail.dto.ts
│  │  │  │  │  └─ SettingCodeValue.dto.ts
│  │  │  │  ├─ entity
│  │  │  │  │  ├─ MenuTree.entity.ts
│  │  │  │  │  ├─ SettingCode.entity.ts
│  │  │  │  │  ├─ SettingCodeDetail.entity.ts
│  │  │  │  │  └─ SettingCodeValue.entity.ts
│  │  │  │  ├─ menus.controller.ts
│  │  │  │  ├─ menus.module.ts
│  │  │  │  └─ service
│  │  │  │     ├─ menu.service.ts
│  │  │  │     └─ setting-code.service.ts
│  │  │  └─ middlewares
│  │  │     └─ logger.middleware.ts
│  │  └─ tsconfig.json
│  ├─ plan
│  │  ├─ .eslintrc.js
│  │  ├─ .prettierrc
│  │  ├─ keys
│  │  ├─ nest-cli.json
│  │  ├─ package-lock.json
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ app.module.ts
│  │  │  ├─ batch
│  │  │  │  ├─ task.module.ts
│  │  │  │  └─ task.service.ts
│  │  │  ├─ common
│  │  │  │  ├─ dto
│  │  │  │  │  └─ common.dto.ts
│  │  │  │  ├─ interceptor
│  │  │  │  │  ├─ payload-to-body.interceptor.ts
│  │  │  │  │  └─ request-info.interceptor.ts
│  │  │  │  └─ util
│  │  │  │     ├─ axios.ts
│  │  │  │     ├─ check-empty.ts
│  │  │  │     ├─ partial-dto.ts
│  │  │  │     ├─ result.ts
│  │  │  │     ├─ transformer.ts
│  │  │  │     └─ uuid.ts
│  │  │  ├─ config
│  │  │  │  ├─ env
│  │  │  │  │  ├─ .env.development
│  │  │  │  │  ├─ .env.production
│  │  │  │  │  └─ .env.stage
│  │  │  │  └─ orm.config.ts
│  │  │  ├─ main.ts
│  │  │  ├─ middlewares
│  │  │  │  └─ logger.middleware.ts
│  │  │  └─ module
│  │  │     ├─ attendance
│  │  │     │  ├─ attendance.module.ts
│  │  │     │  ├─ controller
│  │  │     │  │  └─ attendance.controller.ts
│  │  │     │  ├─ dto
│  │  │     │  │  ├─ req
│  │  │     │  │  │  └─ attendance-policy.req-dto.ts
│  │  │     │  │  └─ res
│  │  │     │  │     └─ attendance-policy.res-dto.ts
│  │  │     │  ├─ entity
│  │  │     │  │  └─ attendance-policy.entity.ts
│  │  │     │  └─ service
│  │  │     │     └─ attendance.service.ts
│  │  │     └─ plan
│  │  │        ├─ dto
│  │  │        │  ├─ req-dto
│  │  │        │  │  ├─ dayoff.req-dto.ts
│  │  │        │  │  ├─ plan-menu.req-dto.ts
│  │  │        │  │  ├─ plan.req-dto.ts
│  │  │        │  │  ├─ repeat-rule.req-dto.ts
│  │  │        │  │  ├─ schedule.req-dto.ts
│  │  │        │  │  └─ task.req-dto.ts
│  │  │        │  └─ res-dto
│  │  │        │     ├─ dayoff.res-dto.ts
│  │  │        │     ├─ plan-menu.res-dto.ts
│  │  │        │     ├─ plan.res-dto.ts
│  │  │        │     ├─ repeat-rule.res-dto.ts
│  │  │        │     ├─ schedule.res-dto.ts
│  │  │        │     └─ task.res-dto.ts
│  │  │        ├─ entities
│  │  │        │  ├─ dayoff.entity.ts
│  │  │        │  ├─ plan-menu.entity.ts
│  │  │        │  ├─ plan.entity.ts
│  │  │        │  ├─ repeatRule.entity.ts
│  │  │        │  ├─ schedule.entity.ts
│  │  │        │  └─ task.entity.ts
│  │  │        ├─ etc
│  │  │        │  ├─ plan-helper.ts
│  │  │        │  ├─ plan.enum.ts
│  │  │        │  └─ plan.type.ts
│  │  │        ├─ plans.controller.ts
│  │  │        ├─ plans.module.ts
│  │  │        └─ services
│  │  │           ├─ calendar.service.ts
│  │  │           └─ plan.service.ts
│  │  └─ tsconfig.json
│  └─ poll
│     ├─ .eslintrc.js
│     ├─ .prettierrc
│     ├─ keys
│     ├─ nest-cli.json
│     ├─ package-lock.json
│     ├─ package.json
│     ├─ README.md
│     ├─ src
│     │  ├─ app.module.ts
│     │  ├─ batch
│     │  │  ├─ task.module.ts
│     │  │  └─ task.service.ts
│     │  ├─ common
│     │  │  ├─ dto
│     │  │  │  └─ common.dto.ts
│     │  │  ├─ interceptor
│     │  │  │  ├─ payload-to-body.interceptor.ts
│     │  │  │  └─ request-info.interceptor.ts
│     │  │  └─ util
│     │  │     ├─ axios.ts
│     │  │     ├─ check-empty.ts
│     │  │     ├─ partial-dto.ts
│     │  │     ├─ result.ts
│     │  │     ├─ transformer.ts
│     │  │     └─ uuid.ts
│     │  ├─ config
│     │  │  ├─ env
│     │  │  │  ├─ .env.development
│     │  │  │  ├─ .env.production
│     │  │  │  └─ .env.stage
│     │  │  └─ orm.config.ts
│     │  ├─ main.ts
│     │  ├─ middlewares
│     │  │  └─ logger.middleware.ts
│     │  └─ polls
│     │     ├─ dto
│     │     │  ├─ request-dto
│     │     │  │  ├─ pagination.req-dto.ts
│     │     │  │  ├─ poll-menu.req-dto.ts
│     │     │  │  ├─ poll-result.req-dto.ts
│     │     │  │  ├─ poll.req-dto.ts
│     │     │  │  ├─ question.req-dto.ts
│     │     │  │  ├─ respondent.req-dto.ts
│     │     │  │  ├─ response.req-dto.ts
│     │     │  │  └─ selection.req-dto.ts
│     │     │  └─ response-dto
│     │     │     ├─ pagination.res-dto.ts
│     │     │     ├─ poll-menu.res-dto.ts
│     │     │     ├─ poll-result.res-dto.ts
│     │     │     ├─ poll.res-dto.ts
│     │     │     ├─ question.res-dto.ts
│     │     │     ├─ respondent.res-dto.ts
│     │     │     ├─ response.res-dto.ts
│     │     │     └─ selection.res-dto.ts
│     │     ├─ entities
│     │     │  ├─ poll-menu.entity.ts
│     │     │  ├─ poll.entity.ts
│     │     │  ├─ question.entity.ts
│     │     │  ├─ respondent.entity.ts
│     │     │  ├─ response.entity.ts
│     │     │  └─ selection.entity.ts
│     │     ├─ etc
│     │     │  └─ poll.enum.ts
│     │     ├─ polls.controller.ts
│     │     ├─ polls.module.ts
│     │     └─ services
│     │        ├─ poll-menu.service.ts
│     │        └─ poll.service.ts
│     └─ tsconfig.json
└─ start.ps1

```