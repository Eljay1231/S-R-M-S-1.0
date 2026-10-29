# Frontend design system

## Visual foundations

The global tokens are defined in `assets/css/main.css` and imported by each page.

- Primary palette: white (`--color-white`), soft black (`--color-black`), and medium gray (`--color-gray`).
- Interface text, borders, and surfaces use the shared color variables rather than page-specific colors.
- Semantic colors are reserved for actions and feedback: blue for edit/information, red for deletion/errors, green for success, and amber for warnings.
- Typography uses Arial, Helvetica, sans-serif throughout.
- Spacing tokens range from `--space-1` through `--space-8`; page, section, component, form, and table spacing use their named variables.
- General surfaces, tables, form controls, and secondary buttons use a solid 1px medium-gray border and a 4px radius.
- Shadows are disabled. Focus indicators are visible and use the shared information color.

## Shared components

- `layout.css`: sidebar, topbar, workspace, content panels, and login layout
- `components.css`: button variants, status indicators, feedback, metric cards, filters, and dialogs
- `forms.css`: field layouts, validation affordances, password control, and record details
- `tables.css`: semantic data tables and horizontal overflow wrapper
- `dashboard.css`: dashboard-specific grid and enrollment indicators
- `responsive.css`: tablet/mobile layout and print rules

Buttons have consistent sizing and labels. Primary actions use soft black; secondary actions are white with a gray border; edit and informational actions use blue; destructive actions use red and require confirmation. Focus, hover, active, and disabled states are supplied.

## Layout and accessibility

Admin pages share a labeled navigation sidebar, page-title header, administrator demonstration label, and aligned content area. On narrow screens the sidebar is toggled by a keyboard-accessible button. Tables are wrapped for horizontal scrolling. Forms use explicit labels, validation text, and `aria-invalid`; status regions announce feedback. Reports have a print stylesheet that removes navigation and controls.

The interface is intentionally restrained and has no external assets, icon package, or framework.
