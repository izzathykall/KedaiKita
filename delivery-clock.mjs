export function remainingMs(order, now=Date.now()) {
  if (!order) return 0;
  if (Number.isFinite(order.pausedRemainingMs)) return Math.max(0,order.pausedRemainingMs);
  if (Number.isFinite(order.deadlineAt)) return Math.max(0,order.deadlineAt-now);
  return Math.max(0,((Number(order.timeLimit)||30)-(Number(order.elapsedSeconds)||0))*1000);
}

export const remainingSeconds=(order,now=Date.now())=>Math.ceil(remainingMs(order,now)/1000);

// Persist the exact remaining budget during a real game pause; opening/closing
// the rider popup is not a pause. Repeated calls never grant additional time.
export function setClockPaused(order, paused, now=Date.now()) {
  const wasPaused=Number.isFinite(order.pausedRemainingMs);
  if (paused===wasPaused) return false;
  if (paused) order.pausedRemainingMs=remainingMs(order,now);
  else {order.deadlineAt=now+Math.max(0,order.pausedRemainingMs);delete order.pausedRemainingMs;}
  return true;
}
