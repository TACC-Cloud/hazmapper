import React from 'react';
import Map from '../Map';

interface Props {
  /**
   * Whether or not the map project is public.
   * @default false
   */
  isPublic?: boolean;
}

/**
 * A component that displays a map project (a map and related data)
 */
export default class MapProject extends React.Component<Props> {
  static defaultProps: Props = {
    isPublic: false,
  };

  render() {
    return <Map />;
  }
}
