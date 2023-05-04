import * as uuidv4 from 'uuid/v4';
/**
 * A generic Tree data structure. The type T refers to the data/payload attached to each node.
 * Start with a root element of null, then start adding files/folders:
 * tree = new PathTree<string>(null)
 * tree.add('a/b/c.txt', 'payload')
 */
class PathTree<T> {
  private uuid: string;
  private path: string;
  private _payload: T | null;
  private _metadata: any;
  private _type = 'dir';

  private children: Map<string, PathTree<T>> = new Map<string, PathTree<T>>();

  constructor(path: string) {
    // Remove any leading slashes
    if (path !== null) {
      path = path.replace(/^\/+/, '');
    }
    // if path is not null, need to create a root level node with null
    // and create leaf nodes for the rest of the path
    this.path = this.normalizePath(path);
    this._payload = null;
    this.uuid = uuidv4();
  }

  /**
   * pathlib.dirname returns '.' for the root dir for some reason
   * @param path string path like '/a/b/c/file.txt'
   */
  private normalizePath(path: string): string {
    if (path === '.') {
      path = '';
    }
    return path;
  }

  /**
   * given a path like a/b/c/d.txt, this will return 'a'
   *
   * @param path string path like '/a/b/c/file.txt'
   */
  private getRootDir(path: string): string {
    path = path.replace(/^\/+/, '');
    return path.split('/')[0];
  }

  private reducePath(path: string): string {
    path = path.replace(/^\/+/, '');
    return path.split('/').slice(1, path.length).join('/');
  }

  private getBaseName(path: string): string {
    path = path.replace(/^\/+/, '');
    // remove trailing slashes and split
    return path.replace(/\/$/, '').split('/').pop();
  }

  public getPath() {
    return this.path;
  }

  public getType() {
    return this._type;
  }

  public isDir() {
    return this._type === 'dir';
  }

  public getSize() {
    return this.children.size;
  }

  public getPayload(): T {
    return this._payload;
  }

  public getId(): string {
    return this.uuid;
  }

  public getChildrenAsArray(): Array<PathTree<T>> {
    return [...this.getChildren()];
  }

  public insert(path: string, payload: any, metadata: any = null) {
    // TODO: payload can be nulled if the insert is for a directory, i.e. path ends with '/';
    // TODO: ensure that the parent of the path is a directory, should not be able to add to a file object

    /**
     * if path is '' do nothing
     *
     * if parent(path) == this.path -> add to this.children
     * else this.insert(parent(path))
     */
    if (path === '') {
      return;
    }

    // given a path like a/b/c/d.txt, this will return 'a'
    const rootDir: string = this.getRootDir(path);
    const itemName: string = this.getBaseName(path);
    const child = this.getChild(rootDir);
    // given a path like a/b/c/d.txt, this will create b/c/d.txt
    const reducedPath: string = this.reducePath(path);
    if (child) {
      child.insert(reducedPath, payload, metadata);
    } else {
      const node: PathTree<T> = new PathTree(rootDir);

      // If its a leaf node, add the payload
      if (rootDir === itemName) {
        node._payload = payload;
        node._metadata = metadata;
        if (path.endsWith('/')) {
          node._type = 'dir';
        } else {
          node._type = 'file';
        }
      }
      this.children.set(rootDir, node);
      node.insert(reducedPath, payload, metadata);
    }
  }

  public ls(path: string): PathTree<T> | null {
    // TODO: If path ends in slash and item is not a dir, should be null / error;

    if (path === '') {
      return this;
    }
    const name = this.getRootDir(path);
    const item = this.getChild(name);
    if (item === null) {
      return null;
    } else {
      const reducedPath: string = this.reducePath(path);
      return item.ls(reducedPath);
    }
  }

  public get(path: string): T | null {
    const item: PathTree<T> = this.ls(path);
    if (item) {
      return item._payload;
    } else {
      return null;
    }
  }
  public getChild(path: string): PathTree<T> | null {
    const item = this.children.get(path);
    if (item) {
      return item;
    } else {
      return null;
    }
  }

  public *getChildren(): IterableIterator<PathTree<T>> {
    // console.log("Called getChildren");
    for (const [key, node] of this.children) {
      yield node;
    }
  }

  public *walk(): IterableIterator<PathTree<T>> {
    yield this;
    for (const [key, value] of this.children) {
      yield* value.walk();
    }
  }
}

export { PathTree };
