import React, { useState } from 'react';
import { Select, Form, Typography, Space } from 'antd';

const { Text } = Typography;

interface RenderOptions {
  colormap_name?: string;
  expression?: string;
}

interface TileServerStylingProps {
  renderOptions?: RenderOptions;
  onChange: (renderOptions: RenderOptions) => void;
}

// Matplotlib colormaps available in rio-tiler/Titiler
// TODO: We can fetch colormaps from TiTiler service via GET /colorMaps
const COLORMAPS = [
  { label: 'None (use original colors)', value: '' },
  { label: 'Terrain', value: 'terrain' },
  { label: 'Viridis', value: 'viridis' },
  { label: 'Plasma', value: 'plasma' },
  { label: 'Inferno', value: 'inferno' },
  { label: 'Magma', value: 'magma' },
  { label: 'Cividis', value: 'cividis' },
  { label: 'Greys', value: 'greys' },
  { label: 'Blues', value: 'blues' },
  { label: 'Greens', value: 'greens' },
  { label: 'Reds', value: 'reds' },
  { label: 'Rainbow', value: 'rainbow' },
  { label: 'RdYlGn', value: 'rdylgn' },
];

// TODO: Support rescale parameter to adjust data value range
// Could fetch min/max from GET /cog/statistics endpoint for smart defaults or to tell the user
// what they are working with.
// Format: "rescale=min,max" e.g., "rescale=0,255"

// TODO: Support band math expressions (e.g., NDVI, NDWI)
// Expressions like: "(b5-b4)/(b5+b4)" for NDVI
// In addition to letting users type in expression, we could have some prepopulated ones
// to choose from:
// - RGB images: b1=Red, b2=Green, b3=Blue, b4=Alpha
// - 4-band multispectral: b1=Red, b2=Green, b3=Blue, b4=NIR
// - Landsat 8/9: b4=Red, b5=NIR
// - Sentinel-2: b4=Red, b8=NIR
// Could fetch band info from GET /cog/info to validate available bands and maybe
// limit pre-populated list

// TODO: we should get if single-banded as really only supporting that now and just
// hide this colormap unless we know its single-banded. Fetch this info from cog/info`
// and/or support bidx so that people could pick single-band (or of course if we implement)
// expressions
const TileServerStyling: React.FC<TileServerStylingProps> = ({
  renderOptions = {},
  onChange,
}) => {
  const [colorMap, setColorMap] = useState<string | undefined>(
    renderOptions.colormap_name
  );

  const buildRenderOptions = (colorMapValue?: string): RenderOptions => {
    const options: RenderOptions = {};

    const currentColorMap =
      colorMapValue !== undefined ? colorMapValue : colorMap;

    if (currentColorMap) {
      options.colormap_name = currentColorMap;
    }

    return options;
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="small">
      <Text strong type="secondary">
        Additonal Render Options
      </Text>
      <Form layout="vertical" size="small">
        <Form.Item label="Color Map" style={{ marginBottom: 8 }}>
          <Select
            value={colorMap}
            onChange={(val) => {
              setColorMap(val);
              onChange(buildRenderOptions(val));
            }}
            options={COLORMAPS}
          />
        </Form.Item>
      </Form>
    </Space>
  );
};

export default TileServerStyling;
