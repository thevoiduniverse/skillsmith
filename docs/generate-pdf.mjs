import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generatePDF() {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();

  const htmlPath = path.join(__dirname, "skillsmith-overview.html");
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });

  const outputPath = path.join(__dirname, "..", "SkillSMITH-Overview.pdf");
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: false,
  });

  await browser.close();
  console.log("PDF generated:", outputPath);
}

generatePDF();
