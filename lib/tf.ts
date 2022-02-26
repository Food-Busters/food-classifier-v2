import { loadGraphModel, node, image, dispose } from "@tensorflow/tfjs-node";

const labelMap = {
  1: "Omelet Rice",
  2: "Chicken Rice",
} as const;

type valueOf<T> = T[keyof T];

export interface MLResult {
  type: valueOf<typeof labelMap>;
  score: number;
}

export async function getMLResult(img: string) {
  const net = await loadGraphModel(
    "https://foodbuster.s3.jp-tok.cloud-object-storage.appdomain.cloud/model.json"
  );

  const decodedImage = node.decodeImage(
    Buffer.from(img.replace(/^data:image\/.+;base64,/, ""), "base64")
  );
  const transformed = image
    .resizeBilinear(decodedImage, [640, 480])
    .cast("int32")
    .expandDims(0);
  const obj = await net.executeAsync(transformed);

  const result: MLResult = {
    type: labelMap[(await obj[7].array())[0][0]],
    score: (await obj[2].array())[0][0],
  };

  dispose(decodedImage);
  dispose(transformed);
  dispose(obj);

  return result;
}
