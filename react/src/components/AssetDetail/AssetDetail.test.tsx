import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AssetDetail from './AssetDetail';
import { featureCollection } from '@hazmapper/__fixtures__/featuresFixture';
import { projectMock } from '@hazmapper/__fixtures__/projectFixtures';
import { useFeatures } from '@hazmapper/hooks';

jest.mock('@hazmapper/hooks', () => ({
  useFeatures: jest.fn(),
}));
