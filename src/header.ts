import {
  Uint12,
  Uint16,
  Uint16Clamped,
  Uint24,
  Uint32,
  Uint32Clamped,
  Uint4,
  Uint64,
  Uint8
} from "./uint";
import Variable from "./variable";

export type CompressionType = "zlib" | "zstd" | "none";

function writeHeader(h: Header): Buffer {
  let buf = Buffer.alloc(32);
  /**
   * Always `PSEQ` (older encodings may contain `FSEQ`)
   */
  buf.write("PSEQ");
  /**
   * Normally `0x00`, optionally `0x01` is required to enable support for
   * Extended Compression Blocks.
   */
  buf.writeUInt8(h.minorVersion, 6);
  /**
   * Currently `0x02`
   */
  buf.writeUInt8(h.majorVersion, 7);
  /**
   * Address of first variable, length of the header (32 bytes) +
   * `Compression Block Count` * length of a `Compression Block` (8 bytes) +
   * `Sparse Range Count` * length of a `Sparse Range` (12 bytes)
   */
  const headerLength = new Uint16Clamped().f(
    32 + 8 * /*h.compressionBlockCount.n()*/ 0 + 12 * h.sparseRangeCount.n()
  );
  buf.writeUInt16LE(headerLength.n(), 8);
  /**
   * Byte index of the channel data portion of the file.
   * A little out of order because we need headerLength.
   */
  const builtVariables: Buffer[] = h.variables.map((v) => v.toBuffer());
  const channelDataOffset =
    headerLength.n() +
    builtVariables.reduce((p, c) => {
      return p + c.length;
    }, 0);
  buf.writeUInt16LE(channelDataOffset, 4);

  /**
   * Sum of `Sparse Range` lengths
   */
  const channelCount = new Uint32Clamped().f(12 * h.sparseRangeCount.n());
  buf.writeUInt32LE(channelCount.n(), 10);

  buf.writeUInt32LE(h.frameCount.n(), 14);

  /**
   * Step interval
   */
  buf.writeUInt8(h.stepTime.n(), 18);

  /**
   * Flags -- unused
   */
  buf.writeUInt8(0, 19);
  //todo Implement compression
  buf.writeUInt16LE(0, 20);
  /**
   * Sparse range count.
   */
  buf.writeUInt8(h.sparseRangeCount.n(), 22);

  buf.writeBigInt64LE(BigInt(h.uid.n()), 24);

  return buf;
}

export default class Header {
  constructor(
    public minorVersion: 0,
    public majorVersion: 2,
    public frameCount: Uint32,
    public stepTime: Uint8,
    public flags: Uint8,
    /*public compressionBlockCount: Uint12;
  public compressionType: CompressionType;*/ //todo Implement compression
    public sparseRangeCount: Uint8,
    public uid: Uint64,
    public variables: Variable[]
  ) {}

  toBuffer(): Buffer {
    return writeHeader(this);
  }
}
