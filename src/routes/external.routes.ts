import { Router } from "express";
import { getPdfURL } from "../services/url.service";
import { checkPdfExists, parsePDF } from "../services/pdf.service";
import { formatResponse } from "../utils/response";
import dayjs from "dayjs";

const router = Router();

router.get("/price-breakdown", async (req, res) => {
  try {
    const type = typeof req.query.type === "string" ? req.query.type : "day";
    const dateRange =
      typeof req.query.dateRange === "string" ? req.query.dateRange : "";
    const currentDate = dayjs();
    const currentURL = getPdfURL(type, dateRange);

    const exists = await checkPdfExists(currentURL);

    if (!exists) {
      return res
        .status(404)
        .json(
          formatResponse(
            false,
            null,
            `Data not available at the moment ref(${currentURL})`,
          ),
        );
    }

    const pdfContents = await parsePDF(currentURL);

    return res.status(200).json(
      formatResponse(true, {
        requestTime: req.requestTime,
        date: currentDate.format("YYYY-MM-DD"),
        data: pdfContents,
      }),
    );
  } catch (error) {
    console.error("daily-price error:", error);

    return res
      .status(500)
      .json(formatResponse(false, null, "Something went wrong"));
  }
});

export default router;
