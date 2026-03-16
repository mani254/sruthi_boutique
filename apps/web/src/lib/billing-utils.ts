export function convertAmountToWords(amount: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Lakh', 'Crore'];

  if (amount === 0) return 'Zero';

  function convertChunk(num: number): string {
    let result = '';
    if (num >= 100) {
      result += units[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) {
      result += units[num] + ' ';
    }
    return result.trim();
  }

  let words = '';


  // Handle Indian Numbering System (Lakh, Crore)
  const chunks = [];
  chunks.push(amount % 1000); // Thousands chunk
  amount = Math.floor(amount / 1000);

  while (amount > 0) {
    chunks.push(amount % 100);
    amount = Math.floor(amount / 100);
  }

  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i];
    if (chunk > 0) {
      const chunkWords = convertChunk(chunk);
      words += chunkWords + ' ' + (i > 0 ? scales[i] : '') + ' ';
    }
  }

  return words.trim();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
