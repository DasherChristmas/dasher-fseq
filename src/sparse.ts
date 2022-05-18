import { Uint24, UintUtils } from "./uint";

export default class SparseRange {
  constructor(public startChannel: Uint24, public channelCount: Uint24) {}
  toBuffer(): Buffer {
    let bytes = Buffer.alloc(6);
    let startChannel = UintUtils.toBytes(this.startChannel);
    let channelCount = UintUtils.toBytes(this.channelCount);

    bytes.set(startChannel, 0);
    bytes.set(channelCount, 3);

    return bytes;
  }
}
