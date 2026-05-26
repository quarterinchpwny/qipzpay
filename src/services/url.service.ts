import dayjs from "dayjs";

export function getPdfURL(): string {
  const baseURL = process.env.BASE_URL!;
  const dateYesterday = dayjs().subtract(1, "day");

  const currentDateFormatted = dateYesterday.format("MMMM-D-YYYY");
  const currentYear = dateYesterday.format("YYYY");
  const currentMonth = dateYesterday.format("MM");

  const formattedURL = `${baseURL}/${currentYear}/${currentMonth}/Daily-Price-Index-${currentDateFormatted}.pdf`;
  return formattedURL;
}
