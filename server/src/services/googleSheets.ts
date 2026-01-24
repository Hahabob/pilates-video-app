import { google } from "googleapis";
import { readFileSync } from "fs";
import { config } from "../config/env";
import { Exercise, IExercise } from "../models/Exercise";

export interface SheetRow {
  [key: string]: string | number;
}

export const syncExercisesFromSheets = async (): Promise<{
  success: boolean;
  message: string;
  count: number;
}> => {
  try {
    // Load service account credentials
    const serviceAccountPath = config.googleServiceAccountPath;
    const credentials = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

    // Authenticate with Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Read data from the spreadsheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.googleSheetId,
      range: "A:Z", // Adjust range as needed
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return {
        success: false,
        message: "לא נמצאו נתונים בגיליון",
        count: 0,
      };
    }

    // First row is headers
    const headers = rows[0] as string[];
    const dataRows = rows.slice(1);

    let syncedCount = 0;
    const errors: string[] = [];

    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
      const row = dataRows[rowIndex];
      if (!row || row.length === 0) continue;

      try {
        // Create object from row data using exact header names
        const exerciseData: any = {};
        headers.forEach((header, index) => {
          if (row[index] !== undefined && row[index] !== "") {
            exerciseData[header] = String(row[index]);
          }
        });

        // Validate required fields
        if (!exerciseData.Name) {
          errors.push(`שורה ללא שם: ${JSON.stringify(row)}`);
          continue;
        }

        // Prepare exercise document with exact field names
        const exerciseDoc: Partial<IExercise> = {
          Name: exerciseData.Name,
          order: rowIndex + 1, // Preserve spreadsheet row order (1-indexed)
        };

        // Map all fields if they exist (following new column order)
        if (exerciseData.Page) exerciseDoc.Page = exerciseData.Page;
        if (exerciseData.Machine_setup)
          exerciseDoc.Machine_setup = exerciseData.Machine_setup;
        if (exerciseData.Exercise_move)
          exerciseDoc.Exercise_move = exerciseData.Exercise_move;
        if (exerciseData.Function_target_muscles)
          exerciseDoc.Function_target_muscles =
            exerciseData.Function_target_muscles;
        if (exerciseData.Strengthen)
          exerciseDoc.Strengthen = exerciseData.Strengthen;
        if (exerciseData.Stretch)
          exerciseDoc.Stretch = exerciseData.Stretch;
        if (exerciseData.Cues) exerciseDoc.Cues = exerciseData.Cues;
        if (exerciseData.Modifications)
          exerciseDoc.Modifications = exerciseData.Modifications;
        if (exerciseData.Contraindications)
          exerciseDoc.Contraindications = exerciseData.Contraindications;
        if (exerciseData.Peel_backs)
          exerciseDoc.Peel_backs = exerciseData.Peel_backs;
        if (exerciseData.Repetitions)
          exerciseDoc.Repetitions = exerciseData.Repetitions;
        if (exerciseData.Level) exerciseDoc.Level = exerciseData.Level;
        if (exerciseData.Image_URL)
          exerciseDoc.Image_URL = exerciseData.Image_URL;
        if (exerciseData.Video_URL)
          exerciseDoc.Video_URL = exerciseData.Video_URL;
        if (exerciseData.Machine_type)
          exerciseDoc.Machine_type = exerciseData.Machine_type;
        if (exerciseData.Series) exerciseDoc.Series = exerciseData.Series;

        // Upsert exercise (update if exists, create if not)
        // Use Name + Machine_type as unique identifier
        // This works because exercises should be unique by name within a machine type
        const queryFilter = {
          Name: exerciseData.Name,
          Machine_type: exerciseData.Machine_type || null,
        };

        await Exercise.findOneAndUpdate(queryFilter, exerciseDoc, {
          upsert: true,
          new: true,
        });

        syncedCount++;
      } catch (error: any) {
        errors.push(`שגיאה בעיבוד שורה: ${error.message}`);
      }
    }

    return {
      success: true,
      message: `סונכרן בהצלחה ${syncedCount} תרגילים${
        errors.length > 0 ? `. ${errors.length} שגיאות` : ""
      }`,
      count: syncedCount,
    };
  } catch (error: any) {
    console.error("Google Sheets sync error:", error);
    return {
      success: false,
      message: `שגיאה בסנכרון: ${error.message}`,
      count: 0,
    };
  }
};
