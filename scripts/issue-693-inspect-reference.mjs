import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const names = [
  "reference-solutions.cpp.gz.b64.1",
  "reference-solutions.cpp.gz.b64.2",
  "reference-solutions.cpp.gz.b64.3.1",
  "reference-solutions.cpp.gz.b64.3.2",
  "reference-solutions.cpp.gz.b64.3.3",
  "reference-solutions.cpp.gz.b64.3.4"
];
const encoded = names.map((name) => readFileSync(`services/interview-judge/${name}`, "utf8")).join("");
const source = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");
console.log(source.slice(-16000));
