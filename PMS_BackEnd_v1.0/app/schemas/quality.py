from __future__ import annotations

from typing import List

from pydantic import BaseModel


class QualityMetrics(BaseModel):
    codeComplexity: float
    testCoverage: float
    bugDensity: float
    duplicateCodeRate: float
    codeSmells: int
    technicalDebt: float
    performanceScore: float
    securityScore: float
    maintainabilityIndex: float


class QualityTrendPoint(BaseModel):
    date: str
    complexity: float
    coverage: float
    bugs: float
    performance: float


class FileQuality(BaseModel):
    file: str
    complexity: float
    coverage: float
    issues: int
    size: int
    risk: str


class CodeAnalysisSummary(BaseModel):
    totalLines: int
    productionLines: int
    testLines: int
    commentLines: int
    filesAnalyzed: int
    lastAnalysis: str


class QualityOverview(BaseModel):
    metrics: QualityMetrics
    trend: List[QualityTrendPoint]
    files: List[FileQuality]
    analysis: CodeAnalysisSummary
