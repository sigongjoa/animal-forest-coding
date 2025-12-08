# Story Page Selector Map & Testing Guide

This document defines the **Single Source of Truth** for all DOM selectors used in E2E testing for the `story.html` page.
All test scripts MUST use these selectors to ensure stability and consistency.

## 1. Scene Navigation
| Element | Selector | Description |
|:--- |:--- |:--- |
| **Scene Container** | `.scene[data-scene="N"]` | N = 1, 2, 3, 4 |
| **Active Scene** | `.scene.active` | Currently visible scene |
| **Next Button** | `.scene.active button:has-text("다음")` | Navigation to next scene |
| **Start IDE Button** | `button:has-text("IDE 시작")` | Entry point to coding mission |

## 2. Dialogue & Content
| Element | Selector | Description |
|:--- |:--- |:--- |
| **Nook's Quote** | `.nook-quote` | Key narrative text box (Orange border) |
| **Generic Dialogue** | `.dialogue` | Standard character dialogue |
| **Images** | `.scene-image` | Story illustrations |

## 3. IDE & Mission Section
**Parent Container:** `#ideSection`

### Mission Steps (Containers)
| Step | ID Selector | Description |
|:--- |:--- |:--- |
| **Step 1** | `#mission-1` | Variable Declaration |
| **Step 2** | `#mission-2` | Interest Rate Declaration |
| **Step 3** | `#mission-3` | Casting Logic |

### Editor Inputs
| All editors consistently use the format: `#editor-stepN` |
|:--- |:--- |:--- |
| **Step 1 Input** | `#editor-step1` | |
| **Step 2 Input** | `#editor-step2` | |
| **Step 3 Input** | `#editor-step3` | |

### Action Buttons
| Button | Scoped Selector (Recommended) | ID Selector (Best) | Note |
|:--- |:--- |:--- |:--- |
| **Run Code** | `#mission-N .run-button` | N/A | Use parent scope to avoid ambiguity |
| **Reset Code** | `#mission-N .reset-button` | N/A | |
| **Next Step (Success)**| `#mission-N button[id^="next-step"]` | `#next-step1`, `#next-step2`, `#next-step3` | **Initially hidden.** Must wait for visible. |
| **Finish (Final)** | `#next-step3` | `#next-step3` | Text: "🎉 완료! 이야기 계속 →" |

### Output Areas
| Output | ID Selector |
|:--- |:--- |
| **Step 1 Result** | `#output-content-step1` |
| **Step 2 Result** | `#output-content-step2` |
| **Step 3 Result** | `#output-content-step3` |

## 4. Test Stability Rules
1. **Prefer IDs**: UI Text can change (e.g., "다음 단계" -> "✅ 완료!"). Always use IDs (`#next-step1`) where available.
2. **Scoping**: Always scope buttons to their parent container (e.g., `#mission-1 .run-button`) to prevent clicking the wrong button in a multi-step page.
3. **Visibility Waits**: Elements like `#next-step1` are hidden until validation passes. Tests MUST use `await expect(locator).toBeVisible()` before clicking.
