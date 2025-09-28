#!/usr/bin/env python3
"""
Markdown 파일의 linter 오류를 자동으로 수정하는 스크립트
"""

import re
import os

def fix_markdown_file(file_path):
    """Markdown 파일의 linter 오류를 수정합니다."""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    fixed_lines = []
    
    for i, line in enumerate(lines):
        # 1. Trailing spaces 제거
        line = line.rstrip()
        
        # 2. 헤딩 주변 빈 줄 추가
        if re.match(r'^#{1,6}\s+', line):
            # 헤딩 앞에 빈 줄 추가 (첫 번째 줄이 아닌 경우)
            if i > 0 and fixed_lines and fixed_lines[-1].strip():
                fixed_lines.append('')
            fixed_lines.append(line)
            # 헤딩 뒤에 빈 줄 추가 (다음 줄이 빈 줄이 아닌 경우)
            if i < len(lines) - 1 and lines[i + 1].strip():
                fixed_lines.append('')
        # 3. 리스트 주변 빈 줄 추가
        elif re.match(r'^\s*[-*+]\s+', line) or re.match(r'^\s*\d+\.\s+', line):
            # 리스트 앞에 빈 줄 추가 (이전 줄이 빈 줄이 아닌 경우)
            if i > 0 and fixed_lines and fixed_lines[-1].strip() and not re.match(r'^\s*[-*+]\s+', lines[i-1]) and not re.match(r'^\s*\d+\.\s+', lines[i-1]):
                fixed_lines.append('')
            fixed_lines.append(line)
            # 리스트 뒤에 빈 줄 추가 (다음 줄이 빈 줄이 아닌 경우)
            if i < len(lines) - 1 and lines[i + 1].strip() and not re.match(r'^\s*[-*+]\s+', lines[i+1]) and not re.match(r'^\s*\d+\.\s+', lines[i+1]):
                fixed_lines.append('')
        # 4. 코드 블록 주변 빈 줄 추가
        elif line.strip().startswith('```'):
            # 코드 블록 앞에 빈 줄 추가
            if i > 0 and fixed_lines and fixed_lines[-1].strip():
                fixed_lines.append('')
            fixed_lines.append(line)
            # 코드 블록 뒤에 빈 줄 추가
            if i < len(lines) - 1 and lines[i + 1].strip():
                fixed_lines.append('')
        # 5. 코드 블록에 언어 지정 (```로 시작하는 경우)
        elif line.strip() == '```' and i < len(lines) - 1:
            # 다음 줄이 코드인지 확인하고 적절한 언어 지정
            next_line = lines[i + 1].strip() if i + 1 < len(lines) else ''
            if next_line.startswith('import ') or next_line.startswith('from '):
                fixed_lines.append('```python')
            elif next_line.startswith('function ') or next_line.startswith('const ') or next_line.startswith('let '):
                fixed_lines.append('```javascript')
            elif next_line.startswith('SELECT ') or next_line.startswith('INSERT ') or next_line.startswith('UPDATE '):
                fixed_lines.append('```sql')
            elif next_line.startswith('<') and next_line.endswith('>'):
                fixed_lines.append('```html')
            elif next_line.startswith('{') or next_line.startswith('['):
                fixed_lines.append('```json')
            else:
                fixed_lines.append('```')
        else:
            fixed_lines.append(line)
    
    # 6. 파일 끝에 단일 newline 추가
    if fixed_lines and fixed_lines[-1]:
        fixed_lines.append('')
    
    # 수정된 내용을 파일에 저장
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(fixed_lines))
    
    print(f"Fixed markdown file: {file_path}")

def main():
    """메인 함수"""
    markdown_file = "/home/daniel/WorkSpace/PMS/PMS_FrontEnd_v1.0/src/Phase4.md"
    
    if os.path.exists(markdown_file):
        fix_markdown_file(markdown_file)
        print("Markdown 파일 수정이 완료되었습니다.")
    else:
        print(f"파일을 찾을 수 없습니다: {markdown_file}")

if __name__ == "__main__":
    main()

