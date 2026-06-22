import dayjs from "dayjs";

export function getPdfURL(type: string = "day", dateRange: string): string {
  const baseURL = process.env.BASE_URL!;
  let formattedURL = "";

  const dateYesterday = dayjs().subtract(1, "day");

  const currentDateFormatted = dateYesterday.format("MMMM-D-YYYY");
  const currentYear = dateYesterday.format("YYYY");
  const currentMonth = dateYesterday.format("MM");

  if (type === "day") {
    formattedURL = `${baseURL}/${currentYear}/${currentMonth}/Daily-Price-Index-${currentDateFormatted}.pdf`;
  } else if (type === "week") {
    if (!dateRange) return "";

    formattedURL = `${baseURL}/${currentYear}/${currentMonth}/Weekly-Average-Prices-${dateYesterday.format("MMMM")}-${dateRange}-${currentYear}.pdf`;
    // formattedURL =
    //   "https://www.da.gov.ph/wp-content/uploads/2026/06/Weekly-Average-Prices-June-15-20-2026.pdf";
  }

  return formattedURL;
}
