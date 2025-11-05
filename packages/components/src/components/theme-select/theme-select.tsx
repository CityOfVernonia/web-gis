import { JsxNode, LitElement, h } from '@arcgis/lumina';

declare global {
  interface DeclareElements {
    'cov-theme-select': ThemeSelect;
  }
}

export class ThemeSelect extends LitElement {
  //#region Private Methods

  private setTheme(event: Event): void {
    const value = (event.target as HTMLCalciteSelectElement).value as ':root' | 'light' | 'dark';

    document.body.classList.remove('calcite-mode-light', 'calcite-mode-dark');

    if (value === 'light') {
      document.body.classList.add('calcite-mode-light');
    }

    if (value === 'dark') {
      document.body.classList.add('calcite-mode-dark');
    }
  }

  //#endregion

  //#region Rendering

  override render(): JsxNode {
    return (
      <calcite-select label="theme select" oncalciteSelectChange={this.setTheme}>
        <calcite-option selected value="root">
          Calcite Light (:root)
        </calcite-option>
        <calcite-option value="light">Vernonia Light</calcite-option>
        <calcite-option value="dark">Vernonia Dark</calcite-option>
      </calcite-select>
    );
  }

  //#endregion
}
