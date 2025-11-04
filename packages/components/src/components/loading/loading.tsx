import { JsxNode, LitElement, h, method, property } from '@arcgis/lumina';
import { CSS } from './resources';
import { styles } from './loading.scss';
import cityLogoDataUrl, { coffeePath, heartPath } from '../../support/logo';

declare global {
  interface DeclareElements {
    'cov-loading': Loading;
  }
}

export class Loading extends LitElement {
  //#region Static Members

  static override styles = styles;

  //#endregion

  //#region Public Properties

  @property({ reflect: true }) text = 'Vernonia';

  //#endregion

  //#region Public Methods

  @method()
  end(): void {
    const { el } = this;

    setTimeout((): void => {
      el.style.opacity = '0';
    }, 2000);

    setTimeout((): void => {
      el.parentElement?.removeChild(el);
    }, 3000);
  }

  //#endregion

  //#region Rendering

  override render(): JsxNode {
    return (
      <div>
        <div class={CSS.textIndicator}>
          <div>{this.text}</div>
          <calcite-progress type="indeterminate"></calcite-progress>
        </div>
        <img class={CSS.logo} src={cityLogoDataUrl}></img>
        <div class={CSS.info}>
          <div>The City of Vernonia is an Equal Opportunity Employer and Provider</div>
          <div>Copyright &copy; {new Date().getFullYear()} City of Vernonia</div>
          <div>
            <span>Made with</span>
            <svg
              class={CSS.heart}
              aria-hidden="true"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <path fill="currentColor" d={heartPath}></path>
            </svg>
            <span>and</span>
            <svg
              class={CSS.coffee}
              aria-hidden="true"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 512"
            >
              <path fill="currentColor" d={coffeePath}></path>
            </svg>
            <span>in Vernonia, Oregon</span>
          </div>
        </div>
      </div>
    );
  }

  //#endregion

  // override willUpdate(changes: PropertyValues<this>): void {}
}
