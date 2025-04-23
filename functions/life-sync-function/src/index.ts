import { Storage } from "@google-cloud/storage";
import { Request, Response } from "express";
import { z } from "zod";

const RequestBodySchema = z.object({
  /**
   * The type of data being sent, e.g. "location", "vitals", etc.
   */
  type: z.enum(["location", "vitals", "mentalWellbeing"]),
  /**
   * The data being sent
   */
  data: z
    .object({
      /**
       * The timestamp of the data
       */
      timestamp: z.number(),
      /**
       * The source of the data, e.g. "iOS", "watchOS", etc.
       */
      source: z.string(),
    })
    /**
     * Any other data
     */
    .passthrough(),
});

type RequestBody = z.infer<typeof RequestBodySchema>;

export const lifeSync = async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const body: RequestBody = req.body;

  // Validate the request body
  const schemaValidationResult = RequestBodySchema.safeParse(body);

  if (!schemaValidationResult.success) {
    return res
      .status(400)
      .send(
        `Invalid request body: ${JSON.stringify(schemaValidationResult.error)}`
      );
  }

  // Bucket & file name
  const bucketName = "life-sync-bucket";
  const fileName = `${body.type}.json`;

  try {
    // Get a reference to the GCS bucket
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);

    // Create or overwrite the file in the bucket
    const file = bucket.file(fileName);

    await file.save(JSON.stringify(body.data), {
      resumable: false,
      contentType: "application/json",
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send("Error uploading file");
  }

  res.status(200).send(`File ${fileName} overwritten in ${bucketName}.`);
};
