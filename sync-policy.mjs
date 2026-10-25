// Compare ancestry, never device clocks (which may be wrong).
export function chooseSave(local, remote) {
  if (!remote?.progress) return local?.progress ? 'local' : 'empty';
  if (!local?.progress || !local._cloudPending) return 'remote';
  if (local._clientStamp && local._clientStamp === remote._clientStamp) return 'remote';
  if (typeof local._cloudBaseStamp === 'string' &&
      local._cloudBaseStamp === remote._clientStamp) return 'local';
  // Legacy saves and divergent devices require an explicit player choice.
  return 'conflict';
}

export function withTimeout(promise, duration, step) {
  let timer;
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_, reject) => { timer = setTimeout(() => {
      const error = new Error(`Masa menunggu terlalu lama (${step}).`);
      error.code = 'KEDAI_TIMEOUT'; reject(error);
    }, duration); })
  ]).finally(() => clearTimeout(timer));
}
