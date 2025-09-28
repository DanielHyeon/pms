"""Thread-safe in-memory datastore backed by the seed dataset."""

from __future__ import annotations

from copy import deepcopy
from threading import RLock
from typing import Any, Dict, List, Optional
from uuid import uuid4

from .seed_data import load_seed_data


class DataStore:
    """Lightweight in-memory repository used while the relational DB is optional."""

    def __init__(self) -> None:
        self._lock = RLock()
        self._data: Dict[str, Any] = load_seed_data()

    # ------------------------------------------------------------------
    # Generic helpers
    # ------------------------------------------------------------------
    def _get_mutable_collection(self, key: str) -> List[Dict[str, Any]]:
        with self._lock:
            collection = self._data.setdefault(key, [])
            if not isinstance(collection, list):
                raise TypeError(f"Collection '{key}' is not a list")
            return collection

    def _get_mutable_mapping(self, key: str) -> Dict[str, Any]:
        with self._lock:
            mapping = self._data.setdefault(key, {})
            if not isinstance(mapping, dict):
                raise TypeError(f"Mapping '{key}' is not a dict")
            return mapping

    def get_collection(self, key: str) -> List[Dict[str, Any]]:
        with self._lock:
            return deepcopy(self._data.get(key, []))

    def get_mapping(self, key: str) -> Dict[str, Any]:
        with self._lock:
            value = self._data.get(key, {})
            return deepcopy(value)

    # ------------------------------------------------------------------
    # Users
    # ------------------------------------------------------------------
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        users = self._data.get("users", [])
        for user in users:
            if user["email"].lower() == email.lower():
                return deepcopy(user)
        return None

    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        users = self._data.get("users", [])
        for user in users:
            if user["id"] == user_id:
                return deepcopy(user)
        return None

    def list_users(self) -> List[Dict[str, Any]]:
        return self.get_collection("users")

    # ------------------------------------------------------------------
    # Projects
    # ------------------------------------------------------------------
    def list_projects(self) -> List[Dict[str, Any]]:
        return self.get_collection("projects")

    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        projects = self._data.get("projects", [])
        for project in projects:
            if project["id"] == project_id:
                return deepcopy(project)
        return None

    # ------------------------------------------------------------------
    # Requirements
    # ------------------------------------------------------------------
    def list_requirements(self, project_id: str) -> List[Dict[str, Any]]:
        return [
            req
            for req in self.get_collection("requirements")
            if req["projectId"] == project_id
        ]

    def create_requirement(self, project_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        requirement = {
            "id": str(uuid4()),
            "reqIdString": payload.get("reqIdString")
            or f"REQ-{len(self._data.get('requirements', [])) + 1:03d}",
            "projectId": project_id,
            "status": payload.get("status", "defined"),
            "title": payload["title"],
            "description": payload.get("description", ""),
            "trackingNumber": payload.get("trackingNumber"),
            "createdAt": payload.get("createdAt"),
            "updatedAt": payload.get("updatedAt"),
        }
        if requirement["createdAt"] is None:
            requirement["createdAt"] = payload.get("timestamp") or payload.get("date") or payload.get("createdAt")
        if requirement["createdAt"] is None:
            requirement["createdAt"] = requirement["updatedAt"] or "2025-01-01"
        if requirement["updatedAt"] is None:
            requirement["updatedAt"] = requirement["createdAt"]
        with self._lock:
            self._data.setdefault("requirements", []).append(requirement)
        return deepcopy(requirement)

    def update_requirement(self, requirement_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self._lock:
            for idx, requirement in enumerate(self._data.get("requirements", [])):
                if requirement["id"] == requirement_id:
                    requirement.update(payload)
                    requirement["updatedAt"] = payload.get("updatedAt", requirement.get("updatedAt"))
                    self._data["requirements"][idx] = requirement
                    return deepcopy(requirement)
        return None

    # ------------------------------------------------------------------
    # Tasks
    # ------------------------------------------------------------------
    def list_tasks(self, project_id: str) -> List[Dict[str, Any]]:
        return [
            task
            for task in self.get_collection("tasks")
            if task["projectId"] == project_id
        ]

    def create_task(self, project_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        task = {
            "id": str(uuid4()),
            "projectId": project_id,
            "title": payload["title"],
            "description": payload.get("description", ""),
            "status": payload.get("status", "todo"),
            "assignee": payload.get("assignee", ""),
            "priority": payload.get("priority", "medium"),
            "createdAt": payload.get("createdAt", "2025-01-01"),
            "requirementId": payload.get("requirementId"),
            "parentTaskId": payload.get("parentTaskId"),
        }
        with self._lock:
            self._data.setdefault("tasks", []).append(task)
        return deepcopy(task)

    def update_task(self, task_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self._lock:
            for idx, task in enumerate(self._data.get("tasks", [])):
                if task["id"] == task_id:
                    task.update(payload)
                    self._data["tasks"][idx] = task
                    return deepcopy(task)
        return None

    def delete_task(self, task_id: str) -> bool:
        with self._lock:
            tasks = self._data.get("tasks", [])
            original_length = len(tasks)
            tasks = [task for task in tasks if task["id"] != task_id and task.get("parentTaskId") != task_id]
            self._data["tasks"] = tasks
            return len(tasks) != original_length

    # ------------------------------------------------------------------
    # Sprints & backlog
    # ------------------------------------------------------------------
    def list_sprints(self, project_id: str) -> List[Dict[str, Any]]:
        return [
            sprint
            for sprint in self.get_collection("sprints")
            if sprint["projectId"] == project_id
        ]

    def create_sprint(self, project_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        sprint = {
            "id": str(uuid4()),
            "projectId": project_id,
            "name": payload["name"],
            "goal": payload.get("goal", ""),
            "status": payload.get("status", "planning"),
            "startDate": payload.get("startDate"),
            "endDate": payload.get("endDate"),
            "capacity": payload.get("capacity", 0),
            "commitment": payload.get("commitment", 0),
            "completed": payload.get("completed", 0),
            "createdAt": payload.get("createdAt", "2025-01-01"),
        }
        with self._lock:
            self._data.setdefault("sprints", []).append(sprint)
        return deepcopy(sprint)

    def list_backlog_items(self, project_id: str) -> List[Dict[str, Any]]:
        return [
            item
            for item in self.get_collection("backlog_items")
            if item["projectId"] == project_id
        ]

    def create_backlog_item(self, project_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        item = {
            "id": payload.get("id") or f"PB-{len(self._data.get('backlog_items', [])) + 200}",
            "projectId": project_id,
            "title": payload["title"],
            "description": payload.get("description", ""),
            "storyPoints": payload.get("storyPoints", 0),
            "priority": payload.get("priority", "medium"),
            "status": payload.get("status", "backlog"),
            "assignee": payload.get("assignee"),
            "requirementId": payload.get("requirementId"),
            "sprintId": payload.get("sprintId"),
            "type": payload.get("type", "task"),
            "acceptance_criteria": payload.get("acceptance_criteria", []),
            "createdAt": payload.get("createdAt", "2025-01-01"),
        }
        with self._lock:
            self._data.setdefault("backlog_items", []).append(item)
        return deepcopy(item)

    # ------------------------------------------------------------------
    # Budgets
    # ------------------------------------------------------------------
    def list_budget_items(self) -> List[Dict[str, Any]]:
        return self.get_collection("budget_items")

    def get_budget_trend(self) -> List[Dict[str, Any]]:
        return self.get_collection("budget_trend")

    # ------------------------------------------------------------------
    # Risk / Quality / Analytics
    # ------------------------------------------------------------------
    def get_risk_snapshot(self, project_id: str) -> Optional[Dict[str, Any]]:
        return self.get_mapping("risk").get(project_id)

    def list_risk_insights(self, project_id: str) -> List[Dict[str, Any]]:
        return self.get_mapping("risk_insights").get(project_id, [])

    def get_quality_metrics(self, project_id: str) -> Optional[Dict[str, Any]]:
        return self.get_mapping("quality_metrics").get(project_id)

    def get_quality_trends(self, project_id: str) -> List[Dict[str, Any]]:
        return self.get_mapping("quality_trends").get(project_id, [])

    def get_file_quality(self, project_id: str) -> List[Dict[str, Any]]:
        return self.get_mapping("file_quality").get(project_id, [])

    def get_code_analysis(self, project_id: str) -> Optional[Dict[str, Any]]:
        return self.get_mapping("code_analysis").get(project_id)

    # ------------------------------------------------------------------
    # Notifications
    # ------------------------------------------------------------------
    def list_notifications(self, project_id: str) -> List[Dict[str, Any]]:
        return self.get_mapping("notifications").get(project_id, [])

    def mark_notification_read(self, project_id: str, notification_id: str) -> Optional[Dict[str, Any]]:
        mapping = self._get_mutable_mapping("notifications")
        notifications = mapping.get(project_id, [])
        for entry in notifications:
            if entry["id"] == notification_id:
                entry["read"] = True
                return deepcopy(entry)
        return None

    # ------------------------------------------------------------------
    # Integrations
    # ------------------------------------------------------------------
    def list_integrations(self) -> List[Dict[str, Any]]:
        return self.get_collection("integrations")

    def update_integration(self, integration_id: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self._lock:
            for idx, integration in enumerate(self._data.get("integrations", [])):
                if integration["id"] == integration_id:
                    integration.update(payload)
                    self._data["integrations"][idx] = integration
                    return deepcopy(integration)
        return None

    def list_integration_logs(self, integration_id: Optional[str] = None) -> List[Dict[str, Any]]:
        logs = self.get_collection("integration_logs")
        if integration_id:
            logs = [log for log in logs if log["integrationId"] == integration_id]
        return logs

    # ------------------------------------------------------------------
    # Executive analytics
    # ------------------------------------------------------------------
    def get_executive_snapshot(self) -> Dict[str, Any]:
        return self.get_mapping("executive")

    # ------------------------------------------------------------------
    # Admin helpers
    # ------------------------------------------------------------------
    def reset(self) -> None:
        with self._lock:
            self._data = load_seed_data()


_DATASTORE: DataStore | None = None


def get_datastore() -> DataStore:
    global _DATASTORE
    if _DATASTORE is None:
        _DATASTORE = DataStore()
    return _DATASTORE
