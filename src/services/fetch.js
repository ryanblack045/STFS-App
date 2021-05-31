export const getTransactionData = async (url) => {
  const response = await fetch(url);
  let transactions = await response.json();
  return transactions
}
