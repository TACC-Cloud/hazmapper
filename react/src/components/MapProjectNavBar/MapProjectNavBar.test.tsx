import React, { act } from 'react';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import MapProjectNavBar from './MapProjectNavBar';
import { Panel } from '@hazmapper/utils/panels';

describe('MapProjectNavBar', () => {
  it('renders the public nav items for public maps', () => {
    const { getByText, queryByText } = render(
      <BrowserRouter>
        <MapProjectNavBar isPublicView={true} />
      </BrowserRouter>
    );
    expect(getByText('Assets')).toBeDefined();
    expect(getByText('Layers')).toBeDefined();
    expect(getByText('Filters')).toBeDefined();
    expect(getByText('Manage')).toBeDefined();
    // Streetview and Point Clouds should not be rendered for public maps
    expect(queryByText('Streetview')).toBeNull();
    expect(queryByText('Point Clouds')).toBeNull();
  });

  it('renders all nav items for non-public maps', () => {
    const { getByText } = render(
      <BrowserRouter>
        <MapProjectNavBar isPublicView={false} />
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

  it('redirects from non-public panel in public view', async () => {
    // point cloud should not be shown (and route removed) when in public view
    const initialEntries = [`/?panel=${Panel.PointClouds}`];

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <MapProjectNavBar isPublicView={true} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(window.location.search).not.toContain(Panel.PointClouds);
    });
  });
});
