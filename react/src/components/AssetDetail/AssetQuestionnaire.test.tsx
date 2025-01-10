import React, { forwardRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { mockQuestionnaireFeature } from '@hazmapper/__fixtures__/featuresFixture';
import AssetQuestionnaire from './AssetQuestionnaire';

// Create a mock ref implementation for Carousel
const mockCarouselRef = {
  next: jest.fn(),
  prev: jest.fn(),
};

// Mock the antd components used in AssetQuestionnaire
jest.mock('antd', () => ({
  Carousel: forwardRef(({ children }: any, ref: any) => {
    // Assign the mock methods to the ref
    React.useImperativeHandle(ref, () => mockCarouselRef);
    return <div data-testid="mock-carousel">{children}</div>;
  }),
  Space: ({ children }: any) => <div data-testid="mock-space">{children}</div>,
  Flex: ({ children }: any) => <div data-testid="mock-flex">{children}</div>,
}));

jest.mock('@tacc/core-components', () => ({
  Button: ({ children, onClick, iconNameBefore }: any) => (
    <button onClick={onClick} data-testid={`button-${iconNameBefore}`}>
      {iconNameBefore}
      {children}
    </button>
  ),
}));

describe('AssetQuestionnaire', () => {
  const mockFeatureSource = 'https://example.com/api/assets/123';

  beforeEach(() => {
    // Clear mock function calls before each test
    mockCarouselRef.next.mockClear();
    mockCarouselRef.prev.mockClear();
  });

  const setup = () => {
    return render(
      <AssetQuestionnaire
        feature={mockQuestionnaireFeature}
        featureSource={mockFeatureSource}
      />
    );
  };

  it('renders all images from the questionnaire assets', async () => {
    await act(async () => {
      setup();
    });

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(
      mockQuestionnaireFeature?.properties?._hazmapper.questionnaire.assets
        .length
    );

    mockQuestionnaireFeature?.properties?._hazmapper.questionnaire.assets.forEach(
      (asset, index) => {
        const image = images[index];
        const expectedPreviewPath =
          `${mockFeatureSource}/${asset.filename}`.replace(
            /\.([^.]+)$/,
            '.preview.$1'
          );

        expect(image.getAttribute('src')).toBe(expectedPreviewPath);
        expect(image.getAttribute('alt')).toBe(asset.filename);
      }
    );
  });

  it('renders navigation buttons', async () => {
    await act(async () => {
      setup();
    });

    const prevButton = screen.getByTestId('button-push-left');
    const nextButton = screen.getByTestId('button-push-right');

    expect(prevButton).toBeTruthy();
    expect(nextButton).toBeTruthy();
  });

  it('displays image filenames as captions', async () => {
    await act(async () => {
      setup();
    });

    mockQuestionnaireFeature?.properties?._hazmapper.questionnaire.assets.forEach(
      (asset) => {
        const caption = screen.getByText(asset.filename);
        expect(caption).toBeTruthy();
      }
    );
  });

  it('handles carousel navigation', async () => {
    await act(async () => {
      setup();
    });

    const prevButton = screen.getByTestId('button-push-left');
    const nextButton = screen.getByTestId('button-push-right');

    await act(async () => {
      fireEvent.click(nextButton);
    });
    expect(mockCarouselRef.next).toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(prevButton);
    });
    expect(mockCarouselRef.prev).toHaveBeenCalled();
  });

  it('renders "No images available" when there are no assets', async () => {
    const emptyFeature = {
      ...mockQuestionnaireFeature,
      properties: {
        _hazmapper: {
          questionnaire: {
            assets: [],
          },
        },
      },
    };

    await act(async () => {
      render(
        <AssetQuestionnaire
          feature={emptyFeature}
          featureSource={mockFeatureSource}
        />
      );
    });

    const noImagesText = screen.getByText('No images available');
    expect(noImagesText).toBeTruthy();
  });
});
