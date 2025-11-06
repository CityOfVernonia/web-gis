import { createRef } from 'lit-html/directives/ref.js';
import { JsxNode, LitElement, h, state } from '@arcgis/lumina';
import { CSS } from './resources';
import { styles } from './map-control-2d.scss';
import { guid } from '../../utils/guid';
import { watch } from '@arcgis/core/core/reactiveUtils';
import {
  getCurrentPosition,
  supported as geolocationSupported,
} from '@arcgis/core/widgets/support/geolocationUtils.js';
import HomeViewModel from '@arcgis/core/widgets/Home/HomeViewModel';
import ZoomViewModel from '@arcgis/core/widgets/Zoom/ZoomViewModel';
import Point from '@arcgis/core/geometry/Point';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import Graphic from '@arcgis/core/Graphic';

declare global {
  interface DeclareElements {
    'cov-map-control-2d': MapControl2D;
  }
}

export class MapControl2D extends LitElement {
  //#region Static Members

  static override styles = styles;

  //#endregion

  //#region Private Properties

  private rotationActionRef = createRef<HTMLCalciteActionElement>();

  private guid = guid();

  private homeViewModel = new HomeViewModel();

  private locateGraphic = new Graphic();

  private view?: __esri.MapView;

  private zoomViewModel = new ZoomViewModel();

  //#endregion

  //#region State Properties

  @state() private fullscreenActive = false;

  @state() private fullscreenDisabled = document.body.requestFullscreen ? false : true;

  @state() private locateState: 'ready' | 'locating' | 'disabled' = 'ready';

  //#endregion

  //#region Lifecycle

  /**
   * All this is just a proof of concept.
   */
  load(): void {
    // TODO: create controller to bind view models to component
    // (import AccessorController from '@arcgis/lumina/controllers/accessor';)
    const { homeViewModel, view, zoomViewModel } = this;

    if (view) {
      homeViewModel.view = view;

      zoomViewModel.view = view;
    } else {
      const parentElement = this.el.parentElement as HTMLArcgisMapElement | null;

      if (!parentElement || (parentElement && parentElement.tagName !== 'ARCGIS-MAP')) return;

      this.view = parentElement.view;

      homeViewModel.view = this.view;

      zoomViewModel.view = this.view;
    }

    // TODO: create a controller to add and remove listener when component connects/disconnects
    // import GenericController from '@arcgis/lumina/controllers';
    if (document.fullscreenElement) this.fullscreenActive = true;

    document.addEventListener('fullscreenchange', (): void => {
      this.fullscreenActive = document.fullscreenElement ? true : false;
    });

    // TODO: create a locate view model and create controller to bind it to component
    if (geolocationSupported() === false) this.locateState = 'disabled';

    if (this.view) {
      // TODO: logic in controller to create and remove handle
      watch(
        (): number => this.view.rotation,
        (rotation: number): void => {
          const icon = this.rotationActionRef.value.shadowRoot.querySelector(
            '.icon-container',
          ) as HTMLCalciteIconElement;

          icon.style.transform = `rotate(${rotation}deg)`;
        },
      );
    }
  }

  //#endregion

  //#region Private Methods

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

  //#endregion

  //#region Rendering

  override render(): JsxNode {
    const fullscreenText = this.fullscreenActive ? 'Exit fullscreen' : 'Enter fullscreen';

    return (
      <div class={CSS.actionBars}>
        <calcite-action-bar expand-disabled="" floating>
          <calcite-action
            disabled={!this.zoomViewModel.canZoomIn}
            icon="plus"
            id={`${this.guid}_zoom_in`}
            scale="s"
            text="Zoom in"
            // why the need to bind to itself???
            onClick={this.zoomViewModel.zoomIn.bind(this.zoomViewModel)}
          ></calcite-action>
          <calcite-tooltip close-on-click="" referenceElement={`${this.guid}_zoom_in`}>
            Zoom in
          </calcite-tooltip>

          <calcite-action
            disabled={!this.zoomViewModel.canZoomOut}
            icon="minus"
            id={`${this.guid}_zoom_out`}
            scale="s"
            text="Zoom out"
            // why the need to bind to itself???
            onClick={this.zoomViewModel.zoomOut.bind(this.zoomViewModel)}
          ></calcite-action>
          <calcite-tooltip close-on-click="" referenceElement={`${this.guid}_zoom_out`}>
            Zoom out
          </calcite-tooltip>
        </calcite-action-bar>

        <calcite-action-bar expand-disabled="" floating>
          <calcite-action
            disabled={this.homeViewModel.state === 'disabled'}
            icon="home"
            id={`${this.guid}_default_extent`}
            scale="s"
            text="Default extent"
            onClick={this.homeViewModel.go}
          ></calcite-action>
          <calcite-tooltip close-on-click="" referenceElement={`${this.guid}_default_extent`}>
            Default extent
          </calcite-tooltip>

          <calcite-action
            hidden={!this.view || (this.view && !this.view.constraints.rotationEnabled)}
            icon="compass-needle"
            id={`${this.guid}_reset_orientation`}
            ref={this.rotationActionRef}
            scale="s"
            text="Reset orientation"
            onClick={this.resetRotation}
          ></calcite-action>
          <calcite-tooltip close-on-click="" referenceElement={`${this.guid}_reset_orientation`}>
            Reset orientation
          </calcite-tooltip>

          <calcite-action
            disabled={this.locateState === 'disabled'}
            icon={this.locateState === 'locating' ? 'gps-on-f' : 'gps-on'}
            id={`${this.guid}_zoom_to_location`}
            scale="s"
            text="Zoom to location"
            onClick={this.locate}
          ></calcite-action>
          <calcite-tooltip close-on-click="" referenceElement={`${this.guid}_zoom_to_location`}>
            Zoom to location
          </calcite-tooltip>
        </calcite-action-bar>

        <calcite-action-bar expand-disabled="" floating>
          <calcite-action
            disabled={this.fullscreenDisabled}
            icon={this.fullscreenActive ? 'full-screen-exit' : 'extent'}
            id={`${this.guid}_fullscreen`}
            scale="s"
            text={fullscreenText}
            onClick={this.fullscreen}
          ></calcite-action>
          <calcite-tooltip close-on-click="" referenceElement={`${this.guid}_fullscreen`}>
            {fullscreenText}
          </calcite-tooltip>
        </calcite-action-bar>
      </div>
    );
  }

  //#endregion
}
