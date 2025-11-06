import { JsxNode, LitElement, h } from '@arcgis/lumina';
// import { CSS } from './resources';
import { styles } from './test-panel.scss';

declare global {
  interface DeclareElements {
    'cov-test-panel': TestPanel;
  }
}

export class TestPanel extends LitElement {
  //#region Static Members

  static override styles = styles;

  //#endregion

  //#region Rendering

  override render(): JsxNode {
    return (
      <calcite-panel heading="Test Panel">
        <calcite-notice icon="information" open>
          <div slot="title">Lorem ipsum</div>
          <div slot="message">Sed laoreet risus ac libero commodo volutpat</div>
        </calcite-notice>
        <calcite-block collapsible heading="Do stuff" open>
          <calcite-button>Click me</calcite-button>
        </calcite-block>
        <calcite-block collapsible heading="Do more stuff">
          <calcite-button>Click me</calcite-button>
        </calcite-block>
        <calcite-button slot="footer" width="half">
          Go
        </calcite-button>
        <calcite-button appearance="outline" slot="footer" width="half">
          Cancel
        </calcite-button>
      </calcite-panel>
    );
  }

  //#endregion
}
