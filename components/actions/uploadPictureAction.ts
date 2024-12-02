"use server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ParsedReceipt = z.object({
  success: z.boolean(),
  items: z.array(z.object({
    name: z.string(),
    price: z.number()
  })),
  total: z.number()
});

type ParsedReceipt = z.infer<typeof ParsedReceipt>;

/** Take in a base64 encoded image (of a receipt) and call the OpenAI API to parse the image */
export async function parsePictureAction(encodedImage: string): Promise<SafeResponse<ParsedReceipt>> {
  try {
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Parse the following data from this receipt: All items with their name and price, as well as the total price. If everything is successful, set the success field to true. If any error occurs, or the picture doesn't contain a receipt, set the success field to false."
            },
            {
              type: "image_url",
              image_url: {
                url: encodedImage,
                detail: "high"
              }
            }
          ]
        }
      ],
      response_format: zodResponseFormat(ParsedReceipt, "receipt")
    });

    const receipt = response.choices[0].message;

    return receipt.refusal || !receipt.parsed!.success ? {
      error: receipt.refusal || "Receipt not detected"
    } : {
      res: receipt.parsed!
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error"
    return {
      error
    };
  }
}