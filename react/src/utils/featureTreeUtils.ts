import {
  FeatureCollection,
  Feature,
  FeatureType,
  FeatureFileNode,
  getFeatureType,
} from '../types';

function createFeatureFileNode(
  nodeId: string,
  name: string,
  isDirectory: boolean,
  featureType: FeatureType | undefined,
  children?: FeatureFileNode[]
): FeatureFileNode {
  return {
    nodeId,
    name,
    isDirectory,
    featureType,
    ...(children && { children }),
  };
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
  const nodeMap: { [key: string]: FeatureFileNode[] } = {};

  function normalizePath(path: string): string {
    return path.replace(/^\/+|\/+$/g, '');
  }

  // Sort features by normalized path
  const sortedFeatures = featureCollection.features
    .map((feature) => ({
      feature,
      normalizedPath: normalizePath(getFullPathFromFeature(feature)),
    }))
    .sort((a, b) => a.normalizedPath.localeCompare(b.normalizedPath))
    .map(({ feature }) => feature);

  sortedFeatures.forEach((feature) => {
    const nodePath = normalizePath(getFullPathFromFeature(feature));
    const parts = nodePath.split('/');

    let currentPath = '';
    let currentNode: FeatureFileNode | null = null;

    parts.forEach((part, index) => {
      currentPath += (currentPath ? '/' : '') + part;
      const isLast = index === parts.length - 1;

      if (isLast) {
        // For leaf nodes (actual features), always create a new node
        const newNode = createFeatureFileNode(
          feature.id.toString(),
          part,
          false,
          getFeatureType(feature)
        );

        // Add to parent node if it exists
        if (currentNode) {
          if (!currentNode.children) currentNode.children = [];
          // Important: Always add the new node to children array
          currentNode.children.push(newNode);
        } else {
          rootNodes.push(newNode);
        }

        // Store in nodeMap
        if (!nodeMap[currentPath]) {
          nodeMap[currentPath] = [];
        }
        nodeMap[currentPath].push(newNode);
      } else {
        // For directories, reuse existing node if it exists
        if (!nodeMap[currentPath]) {
          const newNode = createFeatureFileNode(
            `DIR_${currentPath}`,
            part,
            true,
            undefined
          );

          if (currentNode) {
            if (!currentNode.children) currentNode.children = [];
            currentNode.children.push(newNode);
          } else {
            rootNodes.push(newNode);
          }

          nodeMap[currentPath] = [newNode];
        }

        // Always use the first directory node
        currentNode = nodeMap[currentPath][0];
      }
    });
  });

  return rootNodes;
}
