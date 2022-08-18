import { featureArray } from '../fixtures/feature-array';
import { PathTree } from './path-tree';

describe('FeatureTree', () => {
  it('should init a tree', () => {
    const tree = new PathTree<number>(null);

    expect(tree).toBeTruthy();
  });

  it('should allow for being intialized with non null root', () => {
    const tree = new PathTree<number>(null);
    tree.insert('a/b/c/file1.txt', 1, null);
  });

  it('should walk', () => {
    const tree = new PathTree<number>(null);
    tree.insert('a/b/c/file1.txt', 1, null);
    tree.insert('a/b/c/file2.txt', 2, null);

    const iterator = tree.walk();
    let level = iterator.next().value;
    expect(level.getSize()).toEqual(1);
    level = iterator.next().value;
    expect(level.getSize()).toEqual(1);
    level = iterator.next().value;
    expect(level.getSize()).toEqual(1);
    level = iterator.next().value;
    expect(level.getSize()).toEqual(2);
  });

  fit('should iterate through children', () => {
    const tree = new PathTree<number>(null);
    tree.insert('a/b/c/file1.txt', 1, null);
    tree.insert('a/b/c/file2.txt', 2, null);
    console.log(tree);
    for (const child of tree.getChildren()) {
      console.log(child);
    }
  });
});
