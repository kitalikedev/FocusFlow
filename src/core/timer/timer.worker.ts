import { createBoundaryLoop } from './boundaryLoop';

export type WorkerCommand = { type: 'START'; anchor: number } | { type: 'STOP' };
export type WorkerEvent = { type: 'TICK' };

interface WorkerScope {
  postMessage: (message: WorkerEvent) => void;
  onmessage: ((event: MessageEvent<WorkerCommand>) => void) | null;
}

// A worker thread is not throttled when the tab is hidden, so it keeps the heartbeat alive (FR-06).
const scope = self as unknown as WorkerScope;
const loop = createBoundaryLoop(() => scope.postMessage({ type: 'TICK' }));

scope.onmessage = (event) => {
  if (event.data.type === 'START') loop.start(event.data.anchor);
  else loop.stop();
};
