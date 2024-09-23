import { FeatureCollection, Feature } from '../types';

interface FeatureFileNode {
  id: string;
  name: string;
  isDirectory: boolean;
  children?: FeatureFileNode[];
}

function createFeatureFileNode(
  id: string,
  name: string,
  isDirectory: boolean,
  children?: FeatureFileNode[]
): FeatureFileNode {
  return { id, name, isDirectory, ...(children && { children }) };
}

function getFullPathFromFeature(feature: Feature): string {
  const firstAsset = feature.assets[0];
  if (firstAsset?.display_path) {
    return firstAsset.display_path;
  }
  if (firstAsset) {
    return firstAsset.id.toString();
  }
  return feature.id.toString();
}

/**
 * Convert a feature collection to a tree of file nodes.
 *
 * This returns an array of only top-level nodes (which contain
 * a node for all the features + their parent directories)
 */
export function featureCollectionToFileNodeArray(
  featureCollection: FeatureCollection
): FeatureFileNode[] {
  const rootNodes: FeatureFileNode[] = [];
  const nodeMap: { [key: string]: FeatureFileNode } = {};

  // Sort features to ensure consistent order
  const sortedFeatures = featureCollection.features.sort((a, b) =>
    getFullPathFromFeature(a).localeCompare(getFullPathFromFeature(b))
  );

  sortedFeatures.forEach((feature) => {
    const nodePath = getFullPathFromFeature(feature);
    const parts = nodePath.split('/');

    let currentPath = '';
    let currentNode: FeatureFileNode | null = null;

    parts.forEach((part, index) => {
      currentPath += (currentPath ? '/' : '') + part;
      const isLast = index === parts.length - 1;

      if (!nodeMap[currentPath]) {
        const newNode = createFeatureFileNode(
          isLast ? feature.id.toString() : currentPath,
          part,
          !isLast
        );
        nodeMap[currentPath] = newNode;

        if (currentNode) {
          if (!currentNode.children) currentNode.children = [];
          currentNode.children.push(newNode);
        } else {
          rootNodes.push(newNode);
        }
      }

      currentNode = nodeMap[currentPath];
    });
  });

  return rootNodes;
}
