const reportService = require("../services/reportService");
const path = require("path");

// Generate student report
exports.generateStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    // Parse dates
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const result = await reportService.generateStudentReport(
      studentId,
      start,
      end
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: "Report generated successfully",
      downloadUrl: result.downloadUrl,
    });
  } catch (error) {
    console.error("Error in generateStudentReport:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
};

// Download report file
exports.downloadReport = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(__dirname, "../temp", filename);

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(404).json({
          success: false,
          message: "File not found",
        });
      }
    });
  } catch (error) {
    console.error("Error in downloadReport:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download report",
      error: error.message,
    });
  }
};
