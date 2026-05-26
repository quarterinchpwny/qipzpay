import { Router } from "express";
import { getPdfURL } from "../services/url.service";
import { checkPdfExists, parsePDF } from "../services/pdf.service";
import { formatResponse } from "../utils/response";
import dayjs from "dayjs";

const router = Router();

router.get("/daily-price", async (req, res) => {
  // check currently stored

  const currentDate = dayjs();
  const currentURL = getPdfURL();

  try {
    const check = await checkPdfExists(currentURL);

    if (check) {
      const pdfContents = await parsePDF(currentURL);

      return res.json(
        formatResponse(true, {
          date: currentDate.format("MMMM-D-YYYY"),
          data: pdfContents,
        }),
      );
    }

    return res.json(
      formatResponse(false, null, "Data not available at the moment"),
    );
  } catch (e) {
    return res
      .status(500)
      .json(formatResponse(false, null, "Something went wrong"));
  }
});

export default router;
