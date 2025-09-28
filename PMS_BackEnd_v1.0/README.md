# PMS Backend v1.0

FastAPI 기반 AI 프로젝트 관리 시스템 백엔드 서비스입니다. PMS_FrontEnd_v1.0 프론트엔드와 연동되며 프로젝트, 태스크, 요구사항, 리스크, 예산, 경영 대시보드, 외부 연동, AI 어시스턴트 등 Phase 4 기능을 제공합니다.

## 🏗️ 아키텍처 개요

- **FastAPI + Uvicorn**: ASGI 기반 고성능 API 서버
- **SQLAlchemy + Alembic**: PostgreSQL/SQLite 지원 ORM 및 마이그레이션
- **JWT 인증**: OAuth2 Password Grant 기반 인증/인가
- **모듈 구조**: `auth`, `projects`, `tasks`, `requirements`, `sprints`, `budgets`, `executive`, `risk`, `quality`, `integrations`, `notifications`, `ai` 서비스로 분리
- **서비스 계층**: 비즈니스 로직과 외부 API/RAG 연동을 캡슐화
- **설정 관리**: `pydantic-settings` 기반 환경 변수 로딩 및 타입 안전 구성

## 📁 디렉터리 구조

```text
PMS_BackEnd_v1.0/
├── app
│   ├── api
│   │   └── v1
│   │       ├── __init__.py
│   │       ├── router.py
│   │       ├── endpoints
│   │       │   ├── auth.py
│   │       │   ├── projects.py
│   │       │   ├── tasks.py
│   │       │   ├── requirements.py
│   │       │   ├── sprints.py
│   │       │   ├── backlog.py
│   │       │   ├── budgets.py
│   │       │   ├── executive.py
│   │       │   ├── risk.py
│   │       │   ├── quality.py
│   │       │   ├── integrations.py
│   │       │   ├── notifications.py
│   │       │   └── ai.py
│   ├── core
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── security.py
│   │   └── logging.py
│   ├── db
│   │   ├── __init__.py
│   │   ├── session.py
│   │   ├── base.py
│   │   └── models
│   │       ├── __init__.py
│   │       ├── user.py
│   │       ├── project.py
│   │       ├── task.py
│   │       ├── requirement.py
│   │       ├── sprint.py
│   │       ├── backlog.py
│   │       ├── budget.py
│   │       ├── risk.py
│   │       ├── quality.py
│   │       ├── integration.py
│   │       └── notification.py
│   ├── schemas
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── task.py
│   │   ├── requirement.py
│   │   ├── sprint.py
│   │   ├── backlog.py
│   │   ├── budget.py
│   │   ├── executive.py
│   │   ├── risk.py
│   │   ├── quality.py
│   │   ├── integration.py
│   │   └── notification.py
│   ├── services
│   │   ├── __init__.py
│   │   ├── ai.py
│   │   ├── dashboard.py
│   │   ├── integrations.py
│   │   └── notifications.py
│   ├── utils
│   │   ├── __init__.py
│   │   ├── pagination.py
│   │   └── seed_data.py
│   └── main.py
├── requirements.txt
├── README.md
└── tests
    ├── __init__.py
    └── test_health.py
```

## 🚀 로컬 실행

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 환경 변수 설정 (필요시 .env 사용)
export PMS_DATABASE_URL="sqlite+aiosqlite:///./pms.db"

uvicorn app.main:create_app --factory --reload --port 8000
```

## 🧪 기본 테스트

```bash
pytest
```

## 🔄 데이터 시드

`app/utils/seed_data.py` 스크립트로 프론트엔드 데모와 동일한 초기 데이터를 로드할 수 있습니다.

```bash
python -m app.utils.seed_data
```

## 🛡️ 보안

- JWT 기반 인증 (access token 만료 60분, refresh token 확장 가능)
- 역할 기반 접근 제어 (시스템 관리자, 프로젝트 관리자, 파트장, 사용자)
- CORS, 보안 헤더, 속도 제한 등의 확장 포인트 제공

## 📚 추가 참고

- Phase4.md의 비즈니스 요구사항을 충족하도록 API와 데이터 모델이 설계되었습니다.
- Executive/Budget/Risk/Quality 모듈은 분석용 집계 쿼리 및 AI 기반 인사이트 생성을 위한 서비스 계층을 포함합니다.
- AI 서비스는 OpenAI 등 외부 LLM과 연동할 수 있도록 HTTP 클라이언트를 추상화했습니다.

즐거운 개발 되세요!
