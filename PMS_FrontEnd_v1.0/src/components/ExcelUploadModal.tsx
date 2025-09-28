import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import * as XLSX from 'xlsx';
import type { Requirement } from './RequirementsPage';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (requirements: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'projectId' | 'reqIdString'>[]) => void;
  projectId: string;
}

interface ParsedRequirement {
  title: string;
  description: string;
  trackingNumber?: string;
  status: 'defined' | 'in-progress' | 'done';
  isValid: boolean;
  error?: string;
}

export function ExcelUploadModal({ isOpen, onClose, onUpload, projectId }: ExcelUploadModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRequirement[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseStatus = (statusValue: string): 'defined' | 'in-progress' | 'done' => {
    const normalizedStatus = statusValue.toLowerCase().trim();
    
    if (normalizedStatus === 'defined' || normalizedStatus === '정의됨' || normalizedStatus === '정의') {
      return 'defined';
    }
    if (normalizedStatus === 'in-progress' || normalizedStatus === '진행중' || normalizedStatus === '진행 중' || normalizedStatus === '진행') {
      return 'in-progress';
    }
    if (normalizedStatus === 'done' || normalizedStatus === '완료' || normalizedStatus === '완성') {
      return 'done';
    }
    
    return 'defined'; // 기본값
  };

  const validateRequirement = (row: any, index: number): ParsedRequirement => {
    const title = row['제목'] || row['title'] || row['Title'] || '';
    const description = row['설명'] || row['description'] || row['Description'] || '';
    const trackingNumber = row['추적번호'] || row['추적 번호'] || row['tracking_number'] || row['trackingNumber'] || row['TrackingNumber'] || '';
    const statusValue = row['상태'] || row['status'] || row['Status'] || '';

    let isValid = true;
    let error = '';

    if (!title.trim()) {
      isValid = false;
      error = '제목이 비어있습니다';
    } else if (!description.trim()) {
      isValid = false;
      error = '설명이 비어있습니다';
    } else if (title.length > 200) {
      isValid = false;
      error = '제목이 너무 깁니다 (최대 200자)';
    } else if (description.length > 1000) {
      isValid = false;
      error = '설명이 너무 깁니다 (최대 1000자)';
    }

    return {
      title: title.trim(),
      description: description.trim(),
      trackingNumber: trackingNumber.trim() || undefined,
      status: parseStatus(statusValue),
      isValid,
      error
    };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      processExcelFile(file);
    }
  };

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error('엑셀 파일에 데이터가 없습니다.');
      }

      const parsed = jsonData.map((row, index) => validateRequirement(row, index));
      setParsedData(parsed);
      setStep('preview');
    } catch (error) {
      console.error('Excel parsing error:', error);
      alert(error instanceof Error ? error.message : '엑셀 파일을 처리하는 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmUpload = () => {
    const validRequirements = parsedData
      .filter(req => req.isValid)
      .map(req => ({
        title: req.title,
        description: req.description,
        trackingNumber: req.trackingNumber,
        status: req.status
      }));

    if (validRequirements.length > 0) {
      onUpload(validRequirements);
      setStep('complete');
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        '제목': '사용자는 이메일과 비밀번호로 로그인할 수 있어야 한다',
        '추적번호': 'CUST-2024-001',
        '설명': '기본적인 이메일 인증 기반 로그인 시스템을 구축하여 사용자가 안전하게 시스템에 접근할 수 있도록 한다.',
        '상태': '정의됨'
      },
      {
        '제목': '소셜 로그인 기능 지원',
        '추적번호': 'BIZ-REQ-002',
        '설명': '구글, 카카오 등의 소셜 플랫폼을 통한 간편 로그인 기능을 제공한다.',
        '상태': '진행 중'
      },
      {
        '제목': '프로젝트 대시보드 화면',
        '추적번호': '',
        '설명': '사용자가 자신의 프로젝트 목록을 한눈에 볼 수 있는 대시보드를 제공한다.',
        '상태': '완료'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '요구사항');
    XLSX.writeFile(wb, '요구사항_템플릿.xlsx');
  };

  const resetModal = () => {
    setUploadedFile(null);
    setParsedData([]);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const validCount = parsedData.filter(req => req.isValid).length;
  const invalidCount = parsedData.length - validCount;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>엑셀로 요구사항 업로드</DialogTitle>
          <DialogDescription>
            엑셀 파일을 업로드하여 여러 요구사항을 한 번에 추가할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">1. 템플릿 다운로드</h3>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                템플릿 다운로드
              </Button>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                엑셀 파일은 다음과 같은 열을 포함해야 합니다: <strong>제목</strong>, <strong>설명</strong>, <strong>상태</strong>
                <br />
                상태는 다음 중 하나여야 합니다: 정의됨, 진행중, 완료 (또는 영문: defined, in-progress, done)
              </AlertDescription>
            </Alert>

            <div>
              <h3 className="text-lg font-medium mb-4">2. 파일 업로드</h3>
              <Card 
                className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="py-12 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {isProcessing ? (
                    <div className="space-y-2">
                      <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto animate-pulse" />
                      <p className="text-muted-foreground">파일을 처리하고 있습니다...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">
                        클릭하여 엑셀 파일을 선택하거나 여기에 드래그하세요
                      </p>
                      <p className="text-xs text-muted-foreground">
                        지원 형식: .xlsx, .xls
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">업로드 미리보기</h3>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    유효: {validCount}개
                  </Badge>
                  {invalidCount > 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      오류: {invalidCount}개
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetModal}>
                  다시 선택
                </Button>
                <Button 
                  onClick={handleConfirmUpload}
                  disabled={validCount === 0}
                >
                  {validCount}개 요구사항 추가
                </Button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {parsedData.map((req, index) => (
                <Card key={index} className={req.isValid ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            REQ-{String(index + 1).padStart(3, '0')}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={req.status === 'defined' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                      req.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                      'bg-green-100 text-green-800 border-green-200'}
                          >
                            {req.status === 'defined' ? '정의됨' : req.status === 'in-progress' ? '진행 중' : '완료'}
                          </Badge>
                          {req.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <CardTitle className="text-base">{req.title || '(제목 없음)'}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="mb-2">
                      {req.description || '(설명 없음)'}
                    </CardDescription>
                    {!req.isValid && req.error && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                          {req.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">업로드 완료!</h3>
            <p className="text-muted-foreground mb-6">
              {validCount}개의 요구사항이 성공적으로 추가되었습니다.
            </p>
            <Button onClick={handleClose}>
              확인
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}