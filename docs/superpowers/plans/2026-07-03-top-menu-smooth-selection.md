# Top Menu Smooth Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Smooth the first-level top menu selected state without moving text or changing page content.

**Architecture:** `BasicMenu.vue` measures the selected top menu item and exposes an absolutely positioned indicator. `index.less` keeps menu item layout stable and animates only the indicator layer.

**Tech Stack:** Vue 3, Ant Design Vue Menu, Less, Vite.

## Global Constraints

- Do not change menu text size.
- Do not change menu text position.
- Do not change other page content, colors, or layout.
- Limit the behavior to the top horizontal first-level menu.

---

### Task 1: Add Top Menu Indicator State

**Files:**
- Modify: `src/components/Menu/src/BasicMenu.vue`
- Modify: `src/components/Menu/src/index.less`

**Interfaces:**
- Consumes: existing `menuState.selectedKeys`, `props.isHorizontal`, and `getIsTopMenu`.
- Produces: a `.vben-basic-menu-active-indicator` element styled with CSS variables through inline style.

- [ ] Add wrapper and indicator markup around the existing `<Menu>`.
- [ ] Measure `.ant-menu-item-selected` after route changes, item changes, and window resize.
- [ ] Apply indicator style using `transform: translateX(...)` and `width`.
- [ ] Remove selected menu padding and margin changes that cause text movement.
- [ ] Run `pnpm type:check` or a targeted build check.
