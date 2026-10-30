# Frontend design system

## Visual foundations

The global tokens are defined in `frontend/assets/css/main.css` and imported by each page.

- Primary palette: black page and navigation backgrounds, charcoal surfaces, white primary actions, and gray borders and text.
- Interface text, borders, and surfaces use the shared color variables rather than page-specific colors.
- The default appearance is dark mode, using only white, black, and gray across actions and feedback.
- Typography uses the system UI font stack for a clean, native feel.
- Spacing tokens range from `--space-1` through `--space-8`; page, section, component, form, and table spacing use their named variables.
- General surfaces and controls use subtle cool-gray borders and rounded corners. Cards use a restrained shadow for separation.
- Focus indicators remain visible and use the shared gray palette.

## Shared components

- `layout.css`: sidebar, topbar, workspace, content panels, and login layout
- `components.css`: button variants, status indicators, feedback, metric cards, filters, and dialogs
- `forms.css`: field layouts, validation affordances, password control, and record details
- `tables.css`: semantic data tables and horizontal overflow wrapper
- `dashboard.css`: dashboard-specific grid and enrollment indicators
- `responsive.css`: tablet/mobile layout and print rules

Buttons have consistent sizing and labels. Primary actions use white with dark text; secondary actions use charcoal with a gray border. Focus, hover, active, and disabled states are supplied.

## Layout and accessibility

Admin pages share a dark navigation sidebar, page-title header, administrator label, and aligned content area. On narrow screens the sidebar is toggled by a keyboard-accessible button. Tables are wrapped for horizontal scrolling. Forms use explicit labels, validation text, and `aria-invalid`; status regions announce feedback. Reports have a print stylesheet that removes navigation and controls.

The interface is intentionally restrained and has no external assets, icon package, or framework.
