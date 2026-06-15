
export const calculateTotalDonationAmount = (donationsData) => {
  return donationsData.reduce((total, donation) => total + (donation.amount || 0), 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return "";

  const options = { day: "2-digit", month: "short", year: "numeric" };
  const dateObj = new Date(dateString);

  return dateObj.toLocaleDateString("en-US", options); // "04 Apr, 2011"
};


export const calculateAverageDonation = (donationsData) => {
  const totalAmount = calculateTotalDonationAmount(donationsData);
  return donationsData.length ? totalAmount / donationsData.length : 0;
};


export const numberToWords = (number) => {
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
    if (number === 0) return "Zero";
  
    const convertChunk = (num) => {
      if (num === 0) return "";
      let chunkWords = "";
      if (num >= 100) {
        chunkWords += units[Math.floor(num / 100)] + " Hundred ";
        num %= 100;
      }
      if (num >= 20) {
        chunkWords += tens[Math.floor(num / 10)] + " ";
        num %= 10;
      } else if (num >= 10) {
        chunkWords += teens[num - 10] + " ";
        num = 0;
      }
      if (num > 0) {
        chunkWords += units[num] + " ";
      }
      return chunkWords.trim();
    };
  
    let words = "";
    if (number >= 10000000) {
      const crore = Math.floor(number / 10000000);
      words += convertChunk(crore) + " Crore ";
      number %= 10000000;
    }
    if (number >= 100000) {
      const lakh = Math.floor(number / 100000);
      words += convertChunk(lakh) + " Lakh ";
      number %= 100000;
    }
    if (number >= 1000) {
      const thousand = Math.floor(number / 1000);
      words += convertChunk(thousand) + " Thousand ";
      number %= 1000;
    }
    if (number > 0) {
      words += convertChunk(number);
    }
      
    return words.trim()+" "+"Rupees Only";
  };
  

export const calculateMedianDonation = (donationsData) => {
  if (!donationsData.length) return 0;

  const sortedAmounts = donationsData
    .map((donation) => donation.amount || 0)
    .sort((a, b) => a - b);

  const mid = Math.floor(sortedAmounts.length / 2);
  return sortedAmounts.length % 2 !== 0
    ? sortedAmounts[mid]
    : (sortedAmounts[mid - 1] + sortedAmounts[mid]) / 2;
};


export const calculateHighestDonation = (donationsData) => {
  return donationsData.length
    ? Math.max(...donationsData.map((donation) => donation.amount || 0))
    : 0;
};