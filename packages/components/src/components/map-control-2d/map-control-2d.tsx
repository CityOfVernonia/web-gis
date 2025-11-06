import { createRef } from 'lit-html/directives/ref.js';
import { JsxNode, LitElement, h, property, state } from '@arcgis/lumina';
import { CSS } from './resources';
import { styles } from './map-control-2d.scss';
import { guid } from '../../utils/guid';
import { watch } from '@arcgis/core/core/reactiveUtils';
import {
  getCurrentPosition,
  supported as geolocationSupported,
} from '@arcgis/core/widgets/support/geolocationUtils.js';
import HomeViewModel from '@arcgis/core/widgets/Home/HomeViewModel';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import Graphic from '@arcgis/core/Graphic';

declare global {
  interface DeclareElements {
    'cov-map-control-2d': MapControl2D;
  }
}

const IDS = {
  home: guid(),
  fullscreen: guid(),
  locate: guid(),
  rotation: guid(),
  zoomIn: guid(),
  zoomOut: guid(),
};

const canZoom = (type: 'in' | 'out', view?: __esri.MapView): boolean => {
  if (!view || !view?.ready) return false;

  return type === 'in'
    ? view.scale > view.constraints?.effectiveMaxScale
    : view.scale < view.constraints?.effectiveMinScale;
};

export class MapControl2D extends LitElement {
  //#region Static Members

  static override styles = styles;

  //#endregion

  //#region Private Properties

  private homeViewModel = new HomeViewModel();

  private locateGraphic = new Graphic();

  private rotationActionRef = createRef<HTMLCalciteActionElement>();

  //#endregion

  //#region State Properties

  @state() private fullscreenActive = false;

  @state() private fullscreenDisabled = document.body.requestFullscreen ? false : true;

  @state() private locateState: 'ready' | 'locating' | 'disabled' = 'ready';

  //#endregion

  //#region Public Properties

  @property({ reflect: true }) view?: __esri.MapView;

  //#endregion

  //#region Lifecycle

  load(): void {
    if (!this.view) {
      const arcgisMap = this.el.parentElement as HTMLArcgisMapElement | null;

      if (!arcgisMap || (arcgisMap && arcgisMap.tagName !== 'ARCGIS-MAP')) return;

      this.view = arcgisMap.view;
    }

    this._initView(this.view);
  }

  //#endregion

  //#region Private Methods

  private _initView(view: __esri.MapView): void {
    this.homeViewModel.view = view;

    watch(
      (): number => this.view.rotation,
      (rotation: number): void => {
        (
          this.rotationActionRef.value.shadowRoot.querySelector('.icon-container') as HTMLCalciteIconElement
        ).style.transform = `rotate(${rotation}deg)`;
      },
    );

    if (geolocationSupported() === false) this.locateState = 'disabled';

    document.addEventListener('fullscreenchange', (): void => {
      this.fullscreenActive = document.fullscreenElement ? true : false;
    });
  }

  private fullscreen(): void {
    if (this.fullscreenActive) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  }

  private async locate(): Promise<void> {
    const { view } = this;

    if (!view || this.locateState !== 'ready') return;

    this.locateState = 'locating';

    try {
      const position = (await getCurrentPosition()) as GeolocationPosition;

      const point = new Point({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      this.locateGraphic = new Graphic({
        geometry: point,
        symbol: new SimpleMarkerSymbol({
          color: 'blue',
          size: 12,
          style: 'circle',
          outline: {
            color: 'white',
            width: 2,
          },
        }),
      });

      view.graphics.add(this.locateGraphic);

      view.goTo(point);

      view.scale = 2500;

      setTimeout((): void => {
        view.graphics.remove(this.locateGraphic);

        this.locateState = 'ready';
      }, 5000);
    } catch (error) {
      console.log(error);

      this.locateState = 'ready';
    }
  }

  private resetRotation(): void {
    const { view } = this;

    if (!view) return;

    view.rotation = 0;
  }

  private zoomIn(): void {
    const { view } = this;

    // @ts-expect-error not typed
    if (canZoom('in', view)) view.mapViewNavigation.zoomIn();
  }

  private zoomOut(): void {
    const { view } = this;

    // @ts-expect-error not typed
    if (canZoom('out', view)) view.mapViewNavigation.zoomOut();
  }

  //#endregion

  //#region Rendering

  override render(): JsxNode {
    const fullscreenText = this.fullscreenActive ? 'Exit fullscreen' : 'Enter fullscreen';

    return (
      <div class={CSS.actionBars}>
        <calcite-action-bar expand-disabled="" floating>
          <calcite-action
            disabled={!canZoom('in', this.view)}
            icon="plus"
            id={IDS.zoomIn}
            scale="s"
            text="Zoom in"
            onClick={this.zoomIn}
          ></calcite-action>
          <calcite-tooltip close-on-click="" referenceElement={IDS.zoomIn}>
            Zoom in
          </calcite-tooltip>

          <calcite-action
            disabled={!canZoom('out', this.view)}
            icon="minus"
            id={IDS.zoomOut}
            scale="s"
            text="Zoom out"
            onClick={this.zoomOut}
          ></calcite-action>
          <calcite-tooltip close-on-click="" referenceElement={IDS.zoomOut}>
            Zoom out
          </calcite-tooltip>
        </calcite-action-bar>

        <calcite-action-bar expand-disabled="" floating>
          <calcite-action
            disabled={this.homeViewModel.state === 'disabled'}
            icon="home"
            id={IDS.home}
            scale="s"
            text="Default extent"
            onClick={this.homeViewModel.go.bind(this.homeViewModel)}
          ></calcite-action>
          <calcite-tooltip close-on-click="" referenceElement={IDS.home}>
            Default extent
          </calcite-tooltip>

          <calcite-action
            hidden={!this.view || (this.view && !this.view.constraints.rotationEnabled)}
            icon="compass-needle"
            id={IDS.rotation}
            ref={this.rotationActionRef}
            scale="s"
            text="Reset orientation"
            onClick={this.resetRotation}
          ></calcite-action>
          <calcite-tooltip close-on-click="" referenceElement={IDS.rotation}>
            Reset orientation
          </calcite-tooltip>

          <calcite-action
            disabled={this.locateState === 'disabled'}
            icon={this.locateState === 'locating' ? 'gps-on-f' : 'gps-on'}
            id={IDS.locate}
            scale="s"
            text="Zoom to location"
            onClick={this.locate}
          ></calcite-action>
          <calcite-tooltip close-on-click="" referenceElement={IDS.locate}>
            Zoom to location
          </calcite-tooltip>
        </calcite-action-bar>

        <calcite-action-bar expand-disabled="" floating>
          <calcite-action
            disabled={this.fullscreenDisabled}
            icon={this.fullscreenActive ? 'full-screen-exit' : 'extent'}
            id={IDS.fullscreen}
            scale="s"
            text={fullscreenText}
            onClick={this.fullscreen}
          ></calcite-action>
          <calcite-tooltip close-on-click="" referenceElement={IDS.fullscreen}>
            {fullscreenText}
          </calcite-tooltip>
        </calcite-action-bar>
      </div>
    );
  }

  //#endregion
}
