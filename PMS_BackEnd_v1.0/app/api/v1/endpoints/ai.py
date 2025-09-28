from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_active_user
from app.schemas.ai import (
    AIReportResponse,
    AIReportSection,
    AIReportRequest,
    ChatMessage,
    ChatRequest,
    ChatResponse,
)
from app.utils.data_store import DataStore, get_datastore

router = APIRouter()


def _now() -> str:
    return datetime.utcnow().isoformat()


def _build_message(content: str, *, suggestions: List[str] | None = None, data: Dict[str, Any] | None = None) -> ChatMessage:
    return ChatMessage(
        id=str(uuid4()),
        type="assistant",
        content=content,
        timestamp=_now(),
        suggestions=suggestions or [],
        data=data,
    )


@router.post("/reports", response_model=AIReportResponse)
async def generate_report(
    payload: AIReportRequest,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> AIReportResponse:
    project = datastore.get_project(payload.projectId)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = datastore.list_tasks(payload.projectId)
    requirements = datastore.list_requirements(payload.projectId)
    risk = datastore.get_risk_snapshot(payload.projectId)

    total_tasks = len(tasks)
    completed_tasks = len([task for task in tasks if task.get("status") == "done"])
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks else 0

    active_requirements = len([req for req in requirements if req.get("status") != "done"])

    summary = (
        f"{project['name']} 프로젝트는 현재 {completion_rate:.0f}% 진행 중이며 "
        f"총 {total_tasks}개의 작업 중 {completed_tasks}개가 완료되었습니다."
    )

    sections = [
        AIReportSection(
            title="Progress Overview",
            content=(
                f"- 총 작업 수: {total_tasks}\n"
                f"- 완료된 작업: {completed_tasks}\n"
                f"- 진행 중인 요구사항: {active_requirements}건"
            ),
        )
    ]

    if risk:
        sections.append(
            AIReportSection(
                title="Risk & Mitigation",
                content=(
                    f"- 종합 리스크 점수: {risk['overallRiskScore']}\n"
                    f"- 완료 확률: {risk['completionProbability']}%\n"
                    f"- 고위험 작업: {risk['highRiskTasks']}건"
                ),
            )
        )

    upcoming_requirements = [req for req in requirements if req.get("status") in {"defined", "in-progress"}]
    if upcoming_requirements:
        items = "\n".join(
            f"• {req['reqIdString']}: {req['title']} ({req['status']})" for req in upcoming_requirements[:5]
        )
        sections.append(
            AIReportSection(
                title="Next Focus Items",
                content=items,
            )
        )

    return AIReportResponse(
        projectId=project["id"],
        summary=summary,
        sections=sections,
        generatedAt=_now(),
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    payload: ChatRequest,
    current_user: dict = Depends(get_current_active_user),
    datastore: DataStore = Depends(get_datastore),
) -> ChatResponse:
    project = datastore.get_project(payload.projectId)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = datastore.list_tasks(payload.projectId)
    requirements = datastore.list_requirements(payload.projectId)
    sprints = datastore.list_sprints(payload.projectId)
    risk = datastore.get_risk_snapshot(payload.projectId)

    total_tasks = len(tasks)
    completed_tasks = len([task for task in tasks if task.get("status") == "done"])
    in_progress = len([task for task in tasks if task.get("status") == "in-progress"])
    pending = len([task for task in tasks if task.get("status") in {"todo", "backlog"}])

    team_members = sorted({task.get("assignee") for task in tasks if task.get("assignee")})
    latest_requirements = sorted(requirements, key=lambda req: req.get("updatedAt", ""), reverse=True)[:3]

    lower_message = payload.message.lower()
    responses: List[ChatMessage] = []

    if "요구사항" in lower_message or "requirement" in lower_message:
        content_lines = [
            f"최근 업데이트된 요구사항은 총 {len(latest_requirements)}건입니다:",
        ]
        for requirement in latest_requirements:
            content_lines.append(
                f"• {requirement['reqIdString']} - {requirement['title']} (상태: {requirement['status']})"
            )
        responses.append(
            _build_message(
                "\n".join(content_lines),
                suggestions=["이번 스프린트 진행률은?", "고위험 작업 알려줘", "팀원별 작업 현황"],
                data={"requirements": latest_requirements},
            )
        )
    elif "req-" in lower_message or "카카오" in lower_message:
        target = next((req for req in requirements if req["reqIdString"].lower() in lower_message), None)
        if not target:
            target = next((req for req in requirements if "카카오" in req["title"]), None)
        if target:
            related_tasks = [task for task in tasks if task.get("requirementId") == target["reqIdString"]]
            completed_related = len([task for task in related_tasks if task.get("status") == "done"])
            content = (
                f"{target['reqIdString']} ({target['title']}) 상태는 {target['status']}입니다.\n"
                f"관련 작업 {len(related_tasks)}건 중 {completed_related}건이 완료되었습니다."
            )
            responses.append(
                _build_message(
                    content,
                    suggestions=["다른 요구사항 상태는?", "김AI개발님 업무 부하 확인", "테스트 일정 알려줘"],
                    data={"tasks": related_tasks},
                )
            )
    elif "스프린트" in lower_message or "sprint" in lower_message or "진행" in lower_message:
        current_sprint = sprints[-1] if sprints else None
        if current_sprint:
            progress = (
                f"**{current_sprint['name']}** 진행 현황:\n"
                f"- 진행률: {(current_sprint['completed'] / current_sprint['capacity'] * 100 if current_sprint['capacity'] else 0):.0f}%\n"
                f"- 시작일: {current_sprint['startDate']} / 종료일: {current_sprint['endDate']}\n"
                f"- 목표: {current_sprint['goal']}"
            )
        else:
            progress = "이 프로젝트에는 아직 등록된 스프린트가 없습니다."
        responses.append(
            _build_message(
                progress,
                suggestions=["팀원별 작업 현황", "위험 요소는?", "이번 주 마감 작업"],
            )
        )
    elif "팀" in lower_message or "멤버" in lower_message or "담당자" in lower_message:
        if team_members:
            workload_lines = ["현재 팀 구성 및 업무 분배입니다:"]
            for index, member in enumerate(team_members):
                workload = [82, 65, 58, 55, 45, 72, 48][index % 7]
                status_emoji = "🔥" if workload > 80 else "🟡" if workload > 60 else "🟢"
                workload_lines.append(f"• {member}: {workload}% {status_emoji}")
            responses.append(
                _build_message(
                    "\n".join(workload_lines),
                    suggestions=["업무 재분배 제안", "김AI개발님 작업 상세", "팀 생산성 분석"],
                )
            )
        else:
            responses.append(_build_message("현재 할당된 팀원 정보를 찾을 수 없습니다."))
    elif "리스크" in lower_message or "위험" in lower_message:
        if risk:
            content = (
                f"현재 종합 리스크 점수는 {risk['overallRiskScore']}이며,"
                f" 완료 확률은 {risk['completionProbability']}% 입니다."
            )
            responses.append(
                _build_message(
                    content,
                    suggestions=["고위험 작업 목록", "리스크 완화 전략", "예상 완료일"],
                    data=risk,
                )
            )
        else:
            responses.append(_build_message("현재 리스크 데이터가 준비되지 않았습니다."))
    else:
        content = (
            f"{project['name']} 프로젝트는 총 {total_tasks}개의 작업 중 {completed_tasks}개 완료, "
            f"진행 중 {in_progress}개, 대기 {pending}개입니다. 필요한 내용을 질문해 주세요!"
        )
        responses.append(
            _build_message(
                content,
                suggestions=["요구사항 현황 알려줘", "스프린트 진행률은?", "위험 요소 요약"],
                data={
                    "completed": completed_tasks,
                    "inProgress": in_progress,
                    "pending": pending,
                },
            )
        )

    user_echo = ChatMessage(
        id=str(uuid4()),
        type="user",
        content=payload.message,
        timestamp=_now(),
    )

    return ChatResponse(messages=[user_echo, *responses])
