import { Buffer } from "buffer";

if (!global.Buffer) {
  global.Buffer = Buffer;
}
