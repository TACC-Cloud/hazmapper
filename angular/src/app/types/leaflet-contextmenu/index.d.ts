import * as L from 'leaflet';

declare module 'leaflet' {
    interface Map {
        contextmenu: any;
    }

    interface MapOptions {
        contextmenu?: boolean | undefined;
        contextmenuWidth?: number | undefined;
    }
}
