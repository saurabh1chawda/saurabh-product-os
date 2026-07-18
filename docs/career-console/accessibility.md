# Career Console Accessibility

## Implemented Practices

- Persistent semantic navigation.
- Breadcrumb labeling.
- Visible focus states through existing global focus styles.
- Keyboard-reachable links, controls, table rows, and pagination.
- Form labels for every filter control.
- `aria-current` for active navigation.
- Text-based status labels alongside color treatment.
- High-contrast accent usage on critical controls.

## Validation Expectations

- Tab order follows the visual order.
- All links and controls remain reachable without a pointer.
- Filter controls are labeled and screen-reader legible.
- Operational warnings are not communicated by color alone.
- Placeholder modules provide clear return navigation.

## Known Limitation

Sprint 18.3 uses deterministic static validation rather than a browser-based accessibility runner. A future sprint can add Playwright plus Axe if the project adopts a browser test dependency.

