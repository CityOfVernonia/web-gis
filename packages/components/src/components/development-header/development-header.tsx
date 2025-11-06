import { JsxNode, LitElement, h, property } from '@arcgis/lumina';
import { CSS } from './resources';
import { styles } from './development-header.scss';

declare global {
  interface DeclareElements {
    'cov-development-header': DevelopmentHeader;
  }
}

export class DevelopmentHeader extends LitElement {
  //#region Static Members

  static override styles = styles;

  //#endregion

  //#region Public Properties

  @property({ reflect: true }) name = '';

  //#endregion

  //#region Rendering

  override render(): JsxNode {
    const { name } = this;

    const title = `${name ? `${name} - ` : ''}City of Vernonia Components`;

    return (
      <div class={CSS.container}>
        {name ? (
          <div class={CSS.title}>
            <calcite-icon
              class={CSS.icon}
              icon="home"
              scale="s"
              onClick={(): void => {
                window.location.href = window.location.origin;
              }}
            ></calcite-icon>
            <div>{title}</div>
          </div>
        ) : (
          <div>{title}</div>
        )}
        <cov-theme-select></cov-theme-select>
      </div>
    );
  }

  //#endregion
}
