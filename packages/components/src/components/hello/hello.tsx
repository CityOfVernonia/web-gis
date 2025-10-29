import { PropertyValues } from 'lit';
import { JsxNode, LitElement, createEvent, h, method, property, state } from '@arcgis/lumina';
import { useT9n } from '../../controllers/useT9n';
import T9nStrings from './assets/t9n/messages.en.json';
import { CSS, SLOTS } from './resources';
import { styles } from './hello.scss';

declare global {
  interface DeclareElements {
    'cov-hello': Hello;
  }
}

export class Hello extends LitElement {
  //#region Static Members

  static override styles = styles;

  //#endregion

  //#region Private Properties

  /**
   * Made into a prop for testing purposes only
   *
   * @private
   */
  messages = useT9n<typeof T9nStrings>();

  //#endregion

  //#region State Properties

  @state() count = 0;

  //#endregion

  //#region Public Properties

  @property({ reflect: true }) name = 'World';

  //#endregion

  //#region Public Methods

  /**
   * Get info about properties and states.
   */
  @method()
  about(): { name: string; count: number } {
    return {
      name: this.name,
      count: this.count,
    };
  }

  //#endregion

  //#region Events

  /** Fires when count advances */
  covHelloCount = createEvent({ cancelable: false });

  //#endregion

  //#region Lifecycle

  override willUpdate(changes: PropertyValues<this>): void {
    if (changes.has('count') && this.count > 0) {
      this.covHelloCount.emit();
    }
  }

  //#endregion

  //#region Private Methods

  /**
   * Advance the button click count.
   */
  private buttonClick(): void {
    this.count++;
  }

  //#endregion

  //#region Rendering

  override render(): JsxNode {
    return (
      <div>
        <div class={CSS.heading}>Hello {this.name}!</div>
        <slot class={CSS.tagLine} name={SLOTS.tagLine} />
        <calcite-button onClick={this.buttonClick}>
          I've been clicked {this.count} time{this.count === 1 ? '' : 's'}
        </calcite-button>
      </div>
    );
  }

  //#endregion
}
