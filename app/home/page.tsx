"use client";
import { parsePictureAction } from "@/components/actions/uploadPictureAction";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import Webcam from "react-webcam";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const camera = useRef<Webcam>(null);

  const [isProcessing, startTransition] = useTransition();

  async function uploadPicture(encodedImage: string) {
    startTransition(async () => {
      const { res: receipt, error } = await parsePictureAction(encodedImage);
      setImage(JSON.stringify(receipt) || error!);
    });
  }

  return (
    <main>
      {
        image ? (
          <>
            <Image src={image!} alt="Bruh" height={1080} width={1920} />
            {
              isProcessing ? (
                <>Uploading</>
              ) : (
                image
              )
            }
          </>
        ) : (
          <>
            <Webcam ref={camera}/>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                const img = camera.current?.getScreenshot({ width: 1920, height: 1080 }) || "";
                // setImage(img);
                uploadPicture(img);
              }
            }>
              Click me!
            </button>
          </>
        )
      }
    </main>
  );
}
