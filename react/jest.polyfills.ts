import {
  ReadableStream,
  WritableStream,
  TransformStream,
} from 'node:stream/web';
import { TextEncoder, TextDecoder } from 'node:util';

Object.defineProperties(globalThis, {
  ReadableStream: { value: ReadableStream },
  WritableStream: { value: WritableStream },
  TransformStream: { value: TransformStream },
  TextEncoder: { value: TextEncoder },
  TextDecoder: { value: TextDecoder },
});
