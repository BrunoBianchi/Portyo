const { PDFParse } = require("pdf-parse");

export const parseResume = async (fileBuffer: Buffer): Promise<string> => {
    try {
        const parser = new PDFParse({ data: fileBuffer });
        const data = await parser.getText();
        return data.text;
    } catch (error) {
        console.error("Error parsing resume PDF:", error);
        throw new Error("Failed to parse resume file");
    }
};
