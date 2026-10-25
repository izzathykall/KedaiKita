// A failed precondition never commits a payment. Allow the same transaction
// to be attempted again once paper/stock has been replenished.
export function resetDigitalAttempt(customer) {
  if (!customer || customer.paid || !['card','qr'].includes(customer.method)) return false;
  customer.cardStage='ready';
  customer.cardContactReady=false;customer.cardPose=null;customer.pinInput='';
  customer.qrScanned=false;customer.qrArmed=false;
  return true;
}

export function recoverInterruptedPayment(customer) {
  if (!['contact','processing'].includes(customer?.cardStage)) return false;
  return resetDigitalAttempt(customer);
}
