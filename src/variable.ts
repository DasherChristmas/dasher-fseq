import { Uint16Clamped } from "./uint";

export default class Variable {
  constructor(public identifier: string, public value: string) {
    if (this.identifier.length !== 2)
      throw new RangeError("Invalid Identifier, should have a length of 2.");
  }
  toBuffer(): Buffer {
    let data = Buffer.from(this.value);
    let length = new Uint16Clamped().f(4 + data.length); //todo Warn if the data's length overflows.
    let buf = Buffer.alloc(length.n());
    let identifier = Buffer.from(this.identifier);
    buf.writeUInt16LE(length.n(), 0);
    buf.set(identifier, 2);
    buf.set(data, 4);

    return buf;
  }

  /**
   * File path of the audio to play
   */
  static MediaFile = new Variable("mf", "");
  /**
   * Identifies the program used to create the sequence
   */
  static SequenceProducer = new Variable("sp", "");
}
