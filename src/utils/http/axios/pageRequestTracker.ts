let pendingCount = 0;
let lastChangedAt = Date.now();
let pageTransitionReady = true;
let pageTransitionWaiters: Array<() => void> = [];

const sleep = (delay: number) => new Promise<void>((resolve) => setTimeout(resolve, delay));

export function markPageRequestStart() {
  pendingCount += 1;
  lastChangedAt = Date.now();
}

export function markPageRequestEnd() {
  pendingCount = Math.max(0, pendingCount - 1);
  lastChangedAt = Date.now();
}

export async function waitForPageRequestIdle(options?: {
  idleTime?: number;
  minWait?: number;
  maxWait?: number;
}) {
  const idleTime = options?.idleTime ?? 80;
  const minWait = options?.minWait ?? 90;
  const maxWait = options?.maxWait ?? 520;
  const startedAt = Date.now();

  await sleep(minWait);

  while (Date.now() - startedAt < maxWait) {
    const idleFor = Date.now() - lastChangedAt;
    if (pendingCount === 0 && idleFor >= idleTime) {
      return;
    }
    await sleep(32);
  }
}

export function markPageTransitionStart() {
  pageTransitionReady = false;
}

export function markPageTransitionReady() {
  pageTransitionReady = true;
  const waiters = pageTransitionWaiters;
  pageTransitionWaiters = [];
  waiters.forEach((resolve) => resolve());
}

export function waitForPageTransitionReady() {
  if (pageTransitionReady) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    pageTransitionWaiters.push(resolve);
  });
}
