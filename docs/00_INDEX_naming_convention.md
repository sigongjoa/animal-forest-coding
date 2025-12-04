# File Naming Convention 📋

**Status**: Planning Phase
**Goal**: Standardize all markdown filenames in docs/

---

## 🎯 Naming Convention

**Format**: `[NUMBER]_[CATEGORY]_[DESCRIPTION].md`

### Examples:
- `00_INDEX_master.md` - Master index
- `01_CORE_technical_architecture.md` - Core documentation
- `02_TEST_strategy_roadmap.md` - Testing documentation
- `03_PHASE_1_completion_summary.md` - Phase specific
- `04_PROD_cto_review_action_plan.md` - Production readiness

---

## 📂 Category Mapping

| Category | Code | Purpose | Examples |
|----------|------|---------|----------|
| **Index** | INDEX | 인덱스 문서 | master index, structure |
| **Core** | CORE | 핵심 기술 문서 | architecture, roadmap, DoD |
| **Test** | TEST | 테스트 관련 | strategy, reports, results |
| **Phase** | PHASE | Phase별 | phase_1, phase_2, phase_3 |
| **Prod** | PROD | 프로덕션 배포 | cto_review, fix_plan, quick_start |
| **Tech** | TECH | 기술 시스템 | asset_system, ai_system, validation |
| **Spec** | SPEC | 기술 명세 | entry_page, api, design |

---

## 📊 Reorganization Plan

### Current State Analysis

**Total Files**: 70+
**Issues**:
- ❌ 파일명 컨벤션 불일치 (UPPERCASE, lowercase, 혼합)
- ❌ 번호 체계 불일치 (00-14까지 있다가 중복/누락)
- ❌ 동일 목적 파일 다중화 (TESTING_REPORT.md vs TEST_RESULTS.md vs etc)
- ❌ 깊은 디렉토리 구조

### Proposed Structure

```
docs/
├── 00_INDEX_master.md                    ← Start here
├── 00_INDEX_structure.md
├── 00_INDEX_reorganization_summary.md
│
├── 01_CORE_technical_architecture.md
├── 02_CORE_test_strategy_roadmap.md
├── 03_CORE_definition_of_done.md
├── 04_CORE_project_development_roadmap.md
│
├── 05_TEST_execution_report.md
├── 06_TEST_comprehensive_summary.md
├── 07_TEST_actual_execution_results.md
├── 08_TEST_e2e_execution_report.md
├── 09_TEST_final_report.md
├── 10_TEST_compatibility_plan.md
├── 11_TEST_monitoring_observability_plan.md
├── 12_TEST_story_page_e2e_report.md
│
├── 15_PHASE_1_completion_summary.md
├── 16_PHASE_1_implementation_guide.md
├── 17_PHASE_2_story_page_guide.md
├── 18_PHASE_2_completion_summary.md
├── 19_PHASE_3_ide_window_summary.md
├── 20_PHASE_repository_cleanup.md
├── 21_PHASE_session_completion_report.md
│
├── 25_PROD_cto_review_action_plan.md
├── 26_PROD_fix_plan.md
├── 27_PROD_quick_start_guide.md
├── 28_PROD_implementation_status.md
│
├── 30_TECH_asset_system_overview.md
├── 31_TECH_ai_system_overview.md
├── 32_TECH_code_validation_framework.md
│
├── 40_SPEC_entry_page_technical.md
├── 41_SPEC_api_design.md
├── 42_SPEC_wireframe.md
│
└── ARCHIVED/ (deprecated files)
    ├── PRODUCTION_READINESS_ROADMAP.md
    ├── COMPLETE_PROJECT_STATUS.md
    ├── etc...
```

---

## 🔄 Migration Steps

### Phase 1: 핵심 파일만 정리 (Priority: 높음)
1. 00_INDEX_* (3개)
2. 01-04_CORE_* (4개)
3. 15-28_PHASE_* + PROD_* (14개)
= **21개 파일**

### Phase 2: 테스트 보고서 정리 (Priority: 중간)
1. 05-12_TEST_* (8개)
2. 13-14_TECHNICAL_* (2개)
= **10개 파일**

### Phase 3: 기술 명세 & 기타 (Priority: 낮음)
1. 30-42_* (기술 시스템, 명세)
2. ARCHIVED/ (구식 파일들)
= **나머지 파일들**

---

## ✅ Checklist

### Phase 1 Execution
- [ ] 정렬용 번호 결정
- [ ] 파일명 변경 스크립트 작성
- [ ] 내부 링크 업데이트
- [ ] 00_INDEX_master.md 업데이트
- [ ] 커밋 & 검증

### Phase 2 Execution
- [ ] 테스트 보고서 정렬
- [ ] 기술 문서 정렬
- [ ] 인덱스 업데이트

### Phase 3 Execution
- [ ] 기술 명세 정렬
- [ ] ARCHIVED/ 생성 및 이동
- [ ] 최종 검증

---

## 📝 Naming Rules

### 1. 파일명은 모두 소문자
```
❌ PROJECT_Development_Roadmap.md
✅ 04_CORE_project_development_roadmap.md
```

### 2. 단어는 언더스코어(_)로 구분
```
❌ cto-review-action-plan.md
✅ 25_PROD_cto_review_action_plan.md
```

### 3. 카테고리는 대문자
```
❌ 25_prod_cto_review_action_plan.md
✅ 25_PROD_cto_review_action_plan.md
```

### 4. 숫자는 항상 2자리
```
❌ 5_TEST_execution_report.md
✅ 05_TEST_execution_report.md
```

### 5. 중복 파일 하나로 통합
```
❌ TESTING_REPORT.md
❌ TEST_RESULTS.md
❌ UPDATED_TEST_REPORT_100_PERCENT.md
✅ 05_TEST_execution_report.md (하나만 유지)
```

---

## 🔗 Internal Links Update

모든 마크다운 내부 링크도 업데이트:

```markdown
# Before
See [Core Architecture](./01_CORE_TECHNICAL_ARCHITECTURE.md)

# After
See [Core Architecture](./01_CORE_technical_architecture.md)
```

---

## 🎯 Benefits

1. **일관성**: 모든 파일이 동일한 패턴
2. **정렬**: 번호로 자동 정렬 가능
3. **검색성**: 카테고리로 쉬운 검색
4. **유지보수**: 새 파일 추가 시 규칙 명확
5. **자동화**: 스크립트로 쉽게 처리 가능

---

**Next**: Phase 1 파일 이름 변경 시작
