import { expose } from 'comlink';
import { runBigTask } from './utils';

const worker = {
    runBigTask
}

export type RunBigTaskWorker = typeof worker;
expose(worker);