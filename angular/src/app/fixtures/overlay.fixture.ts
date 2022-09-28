import { Overlay } from '../models/models';

let overlayFixture: Overlay;
overlayFixture = <Overlay> {
  id: 1,
  label: 'test',
  maxLat: 10,
  maxLon: 10,
  minLat: 0,
  minLon: 0,
  path: '/test',
  project_id: 1,
  uuid: '12345',
};

export { overlayFixture };
