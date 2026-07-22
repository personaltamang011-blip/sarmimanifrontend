// English (AD) to Nepali (BS) Date Utility Helper
function getFormattedDates(dateObj = new Date()) {
  const adDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
  const adYear = dateObj.getFullYear();
  const adMonth = dateObj.getMonth() + 1;
  const adDay = dateObj.getDate();

  // Bikram Sambat Calculation Approximation for 2024-2030 AD range
  // Approx: BS year = AD + 56 (or 57 after Baisakh 1), month offset ~ 8 months 17 days
  let bsYear = adYear + 56;
  let bsMonth = adMonth + 8;
  let bsDay = adDay + 17;

  if (bsDay > 30) {
    bsDay -= 30;
    bsMonth += 1;
  }
  if (bsMonth > 12) {
    bsMonth -= 12;
    bsYear += 1;
  }

  const monthNamesBS = [
    "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
    "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
  ];

  const bsMonthName = monthNamesBS[(bsMonth - 1) % 12];
  const bsFormatted = `${bsYear} ${bsMonthName} ${bsDay < 10 ? '0' + bsDay : bsDay}`;

  return {
    english: adDate,
    nepali: bsFormatted,
    fullDisplay: `${bsFormatted} (${adDate})`
  };
}

module.exports = { getFormattedDates };
