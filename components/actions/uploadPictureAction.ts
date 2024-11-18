"use server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ParsedReceipt = z.object({
  items: z.array(z.object({
    name: z.string(),
    price: z.number()
  })),
  total: z.number()
});

type ParsedReceipt = z.infer<typeof ParsedReceipt>;

/** Take in a base64 encoded image (of a receipt) and call the OpenAI API to parse the image */
export async function parsePictureAction(encodedImage: string): Promise<SafeResponse<ParsedReceipt>> {
  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Parse the following data from this receipt: All items with their name and price, as well as the total price."
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
  return receipt.refusal ? {
    error: receipt.refusal
  } : {
    res: receipt.parsed!
  };
}