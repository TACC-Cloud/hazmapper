import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MapProjectNavBar from './MapProjectNavBar';

describe('MapProjectNavBar', () => {
  it('renders the public nav items for public maps', () => {
    const { getByText, queryByText } = render(
      <BrowserRouter>
        <MapProjectNavBar isPublic={true} />
      </BrowserRouter>
    );
    expect(getByText('Assets')).toBeDefined();
    expect(getByText('Layers')).toBeDefined();
    expect(getByText('Filters')).toBeDefined();
    expect(getByText('Streetview')).toBeDefined();
    expect(getByText('Manage')).toBeDefined();
    // Point Clouds should not be rendered for public maps
    expect(queryByText('Point Clouds')).toBeNull();
  });

  it('renders all nav items for non-public maps', () => {
    const { getByText } = render(
      <BrowserRouter>
        <MapProjectNavBar isPublic={false} />
      </BrowserRouter>
    );

    // All items should be rendered
    expect(getByText('Assets')).toBeDefined();
    expect(getByText('Point Clouds')).toBeDefined();
    expect(getByText('Layers')).toBeDefined();
    expect(getByText('Filters')).toBeDefined();
    expect(getByText('Streetview')).toBeDefined();
    expect(getByText('Manage')).toBeDefined();
  });
});
