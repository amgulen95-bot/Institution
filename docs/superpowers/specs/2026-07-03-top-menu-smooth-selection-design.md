# Top Menu Smooth Selection Design

## Goal

Make the first-level top menu selection move smoothly left and right when switching between items such as 在线开方, 开方记录, 收费管理, 患者病历, 一人一方, 经营情况, and 更多.

## Constraints

- Do not change menu text size.
- Do not change menu text position.
- Do not change other page content, colors, or layout.
- Limit the behavior to the top horizontal first-level menu.

## Design

Keep the existing menu click and route behavior. Add a visual active indicator layer for the horizontal top menu only. The indicator is positioned from the currently selected menu item's DOM rectangle and moves with `transform` and `width` transitions.

The selected menu item itself should not change padding, margin, height, or line-height. This prevents layout jumps. Existing selected colors and background treatment are preserved on the indicator layer instead of resizing the menu item.

## Verification

- Open the app preview and switch between first-level top menu items.
- Confirm the active state slides horizontally instead of jumping.
- Confirm menu text size and position stay unchanged.
- Confirm sidebar/menu variants and page content are unaffected.
