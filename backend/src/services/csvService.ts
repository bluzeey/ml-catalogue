import fs from "fs-extra";
import csv from "csv-parser";
import path from "path";

interface PlatformData {
  "What is the name of this AI/ML software platform?": string;
  "What are the features of this platform?": string;
  "What are the key differentiators of this platform?": string;
  "Which client industries are using this platform?": string;
  "What is the pricing information for this platform?": string;
  "What are the deployment options for this platform?": string;
  "What are the customer reviews and ratings of this platform?": string;
  [key: string]: string;
}

class CSVService {
  private dataCache: PlatformData[] | null = null;

  private async loadCSV(filePath: string): Promise<PlatformData[]> {
    if (this.dataCache) {
      return this.dataCache;
    }

    const results: PlatformData[] = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => results.push(row))
        .on("end", () => {
          this.dataCache = results;
          resolve(results);
        })
        .on("error", (error) => reject(error));
    });
  }

  // Find an exact match by name
  async findByName(
    name: string,
    filePath: string
  ): Promise<PlatformData | null> {
    const data = await this.loadCSV(filePath);
    return (
      data.find(
        (row) =>
          row[
            "What is the name of this AI/ML software platform?"
          ].toLowerCase() === name.toLowerCase()
      ) || null
    );
  }
}

export default new CSVService();
