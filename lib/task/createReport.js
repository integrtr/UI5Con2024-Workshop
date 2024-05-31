const path = require("node:path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

// Function to check if a file contains comments
function containsComments(fileContent) {
  return /\/\*[\s\S]*?\*\/|\/\/.*/g.test(fileContent);
}

// Function to check if a file contains console.logs
function containsConsoleLogs(fileContent) {
  return /console\.log\s*\(/g.test(fileContent);
}

/*
 * Generate a PDF summary of project files, excluding preload, map, and dbg files
 */
module.exports = async function ({
  dependencies,
  log,
  options,
  taskUtil,
  workspace,
}) {
  const resources = await workspace.byGlob("/**/*.*");

  const currentTime = new Date().toISOString().replace(/:/g, "-");
  const pdfPath = `./files/fileSummary_${currentTime}.pdf`;
  const pdfDoc = new PDFDocument();
  const pdfStream = fs.createWriteStream(pdfPath);

  pdfDoc.pipe(pdfStream);
  pdfDoc.fontSize(18).text("Project File Summary", { underline: true });
  pdfDoc.moveDown();

  pdfDoc.fontSize(14).text("File Details:", { underline: true });
  pdfDoc.moveDown();

  await Promise.all(
    resources.map(async (resource) => {
      const filePath = resource.getPath();

      // Skip preload, map, and dbg files
      if (
        filePath.includes("/dist/") ||
        filePath.includes("-dbg.js") ||
        filePath.endsWith(".map") ||
        filePath.endsWith("-preload.js")
      ) {
        return;
      }

      const fileContent = await resource.getString();
      const fileExtension = path.extname(filePath);
      const lineCount = fileContent.split("\n").length;
      const hasComments = containsComments(fileContent);
      const hasConsoleLogs = containsConsoleLogs(fileContent);

      pdfDoc.fontSize(12).text(`File Path: ${filePath}`);
      pdfDoc.fontSize(12).text(`File Extension: ${fileExtension}`);
      pdfDoc.fontSize(12).text(`Line Count: ${lineCount}`);
      pdfDoc.fontSize(12).text(`Comments Exist: ${hasComments ? "Yes" : "No"}`);
      pdfDoc
        .fontSize(12)
        .text(`Console Logs Exist: ${hasConsoleLogs ? "Yes" : "No"}`);
      pdfDoc.moveDown();
    })
  );

  pdfDoc.end();
  log.info(
    `PDF summary of project files in the webapp folder has been created at ${pdfPath}`
  );
};
