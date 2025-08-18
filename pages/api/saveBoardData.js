import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method Not Allowed"
    });
  }

  try {
    const boardData = req.body;
    const publicDir = path.join(process.cwd(), "public");
    const filePath = path.join(publicDir, "boardData.json");

    // Ensure `public/` directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, {
        recursive: true
      });
    }

    // Write board data to file
    fs.writeFileSync(filePath, JSON.stringify(boardData, null, 2));

    return res.status(200).json({
      success: true,
      message: "Board data saved successfully!"
    });
  } catch (error) {
    console.error("Error saving board data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save board data"
    });
  }
}