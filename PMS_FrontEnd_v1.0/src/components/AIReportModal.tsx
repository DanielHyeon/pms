import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Sparkles, Copy, RotateCcw, Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  taskCount: number;
}

interface AIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export function AIReportModal({ isOpen, onClose, project }: AIReportModalProps) {
  const [period, setPeriod] = useState('1week');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    
    // Mock AI report generation - 요구사항 기반
    setTimeout(() => {
      const mockReport = `[${project.name}] 주간 업무 요약 (요구사항 기반)

📋 요구사항별 진행 상황:

### REQ-001: 사용자 이메일 로그인 기능
**상태: 진행 중 (75% 완료)**
• ✅ 완료: 로그인 기능 구현 - JWT 기반 사용자 인증 시스템 구축
• ✅ 완료: UI 컴포넌트 구현 - 로그인 페이지 개발
• 🚀 진행 중: API 설계 문서 작성 - 인증 관련 엔드포인트 설계

### REQ-002: 소셜 로그인 기능 지원  
**상태: 정의됨 (개발 대기 중)**
• ⏳ 예정: 구글 OAuth 연동 개발
• ⏳ 예정: 카카오 OAuth 연동 개발
• ⏳ 예정: 소셜 로그인 UI 구현

### REQ-003: 프로젝트 대시보드 화면
**상태: 완료 (100%)**
• ✅ 완료: 대시보드 레이아웃 구현
• ✅ 완료: 프로젝트 목록 표시 기능
• ✅ 완료: 프로젝트 생성 모달

---

📊 전체 요구사항 현황:
• 완료된 요구사항: 1개 (33%)
• 진행 중인 요구사항: 1개 (33%)
• 대기 중인 요구사항: 1개 (33%)
• 총 연결된 작업: 4개 (완료 1개, 진행 중 2개, 대기 1개)

⚠️ 주의사항:
• REQ-002 (소셜 로그인): 다음 스프린트에서 우선 시작 필요
• REQ-001의 API 문서화 작업이 다소 지연되고 있음

💡 다음 주 권장사항:
• REQ-001 완료를 위한 API 문서 작업 마무리
• REQ-002 구현 계획 수립 및 기술 스택 결정
• 고객 피드백 수집을 위한 REQ-003 사용성 테스트 진행`;

      setReportContent(mockReport);
      setHasGenerated(true);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportContent);
      toast.success('보고서가 클립보드에 복사되었습니다');
    } catch (error) {
      toast.error('복사에 실패했습니다');
    }
  };

  const handleClose = () => {
    setReportContent('');
    setHasGenerated(false);
    setIsGenerating(false);
    onClose();
  };

  const getPeriodLabel = (value: string) => {
    switch (value) {
      case '1week':
        return '최근 1주일';
      case '2weeks':
        return '최근 2주일';
      case '1month':
        return '최근 1개월';
      default:
        return '최근 1주일';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--chart-1)' }} />
            <DialogTitle>AI 주간 보고서 생성</DialogTitle>
          </div>
          <DialogDescription>
            연동된 Git과 Jira 데이터를 분석하여 프로젝트 진행 상황 보고서를 자동 생성합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {!hasGenerated && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>프로젝트</Label>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--foreground)', fontWeight: '600' }}>{project.name}</p>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{project.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>보고 기간</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="기간 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1week">최근 1주일</SelectItem>
                      <SelectItem value="2weeks">최근 2주일</SelectItem>
                      <SelectItem value="1month">최근 1개월</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ 
                background: 'var(--accent)', 
                border: '2px solid var(--chart-1)',
                borderOpacity: '0.3'
              }}>
                <h4 className="mb-2" style={{ 
                  color: 'var(--foreground)', 
                  fontWeight: '600' 
                }}>분석할 데이터 소스</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Git Repository</Badge>
                    <span className="text-sm" style={{ color: 'var(--accent-foreground)' }}>커밋 로그, 코드 변경 사항</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Jira Project</Badge>
                    <span className="text-sm" style={{ color: 'var(--accent-foreground)' }}>이슈 트래킹, 진행 상황</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">프로젝트 보드</Badge>
                    <span className="text-sm" style={{ color: 'var(--accent-foreground)' }}>태스크 완료 현황</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasGenerated && (
            <div className="flex-1 overflow-hidden flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 style={{ color: 'var(--foreground)', fontWeight: '600' }}>생성된 보고서</h4>
                  <Badge variant="secondary">{getPeriodLabel(period)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={generateReport}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    재생성
                  </Button>
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-2" />
                    복사
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <Textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  className="h-full resize-none text-sm"
                  style={{ 
                    fontFamily: 'monospace',
                    background: 'var(--input-background)',
                    border: '2px solid var(--border)',
                    color: 'var(--foreground)'
                  }}
                  placeholder="AI가 생성한 보고서가 여기에 표시됩니다..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Button variant="outline" onClick={handleClose}>
            닫기
          </Button>
          {!hasGenerated ? (
            <Button 
              onClick={generateReport} 
              disabled={isGenerating}
              style={{ 
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: 'none'
              }}
              className="hover:opacity-90 transition-opacity"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  보고서 생성
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={copyToClipboard}
              style={{ 
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: 'none'
              }}
              className="hover:opacity-90 transition-opacity"
            >
              <Copy className="w-4 h-4 mr-2" />
              클립보드에 복사
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}