import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { Blob as BlobNode } from 'node:buffer';

// Il Blob di jsdom non sopravvive alla copia in IndexedDB finto: usiamo quello di Node,
// che si comporta come quello dei browser veri.
globalThis.Blob = BlobNode as unknown as typeof Blob;

afterEach(() => cleanup());
