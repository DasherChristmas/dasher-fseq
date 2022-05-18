import Header, { CompressionType } from "./header";
import HeaderSparseRange from "./sparse";
import { Uint24, Uint32, Uint64, Uint8 } from "./uint";
import HeaderVariable from "./variable";

export * as Uint from "./uint";

export * as Colors from "./color";

export module FSEQ {
  export let compressionMode: CompressionType = "none";
  /**
   * Set the FSEQ compression type.
   * @param c The compression type.
   * @throws If the compression is anything but `none` because it is not yet supported.
   */
  export function setCompression(c: CompressionType) {
    if (c !== "none")
      throw new Error(`Error: Compression type ${c} is not yet supported.`);
    compressionMode = c;
  }

  class FrameData {
    private channelCount: number;
    private data: Buffer;
    constructor(private ranges: HeaderSparseRange[]) {
      this.channelCount = ranges.reduce((p, c) => p + c.channelCount.n(), 0);
      this.data = Buffer.alloc(this.channelCount);
    }
    /**
     * Set the value of one of the channels in the frame.
     * @param channel The channel (contained in one of the FSEQ's channel ranges) to set the value of.
     * @param value The `Uint8` value to set it to.
     */
    setChannelValue(channel: Uint24, value: Uint8) {
      const isInRange = (c: number, r: HeaderSparseRange) =>
        c > r.startChannel.n() && c < r.startChannel.n() + r.channelCount.n();

      const range = this.ranges.findIndex(
        isInRange.bind(isInRange, channel.n())
      );
      if (range === -1) {
        throw new RangeError(
          "Invalid channel, it is not included in file ranges!"
        );
      }
      let dataIdx = 0;
      for (let i = 0; i < range && dataIdx < this.channelCount; i++) {
        let r = this.ranges[i];
        dataIdx += r.channelCount.n();
      }
      dataIdx += channel.n() - this.ranges[range].startChannel.n();
      this.data[dataIdx] = value.n();
    }
    toBuffer(): Buffer {
      return this.data;
    }
  }

  export const Variable = HeaderVariable;
  export const SparseRange = HeaderSparseRange;

  export class FSEQFile {
    /**
     * The sequence frames.
     */
    frames: FrameData[] = [];
    /**
     * Creates a new `FrameData` object.
     * @returns The newly created frame.
     */
    createFrame(): FrameData {
      return new FrameData(this.channelRanges);
    }
    /**
     * Append a frame to the end of the list.
     * @param f The frame to add.
     */
    addFrame(f: FrameData) {
      this.frames.push(f);
    }
    /**
     * Insert a frame at a certain index.
     * @param f The frame to insert.
     * @param idx The index at which to insert the frame.
     */
    insertFrame(f: FrameData, idx: number) {
      this.frames.splice(idx, 0, f);
    }
    /**
     * Replace the frame at the given index.
     * @param idx The index of the frame to replace.
     * @param f The frame to replace it with.
     * @returns The removed frame.
     */
    replaceFrame(idx: number, f: FrameData): FrameData {
      return this.frames.splice(idx, 1, f)[0];
    }
    /**
     * The list of variables in the file.
     */
    variables: HeaderVariable[] = [];
    /**
     * Add a new variable to the sequence.
     * @param v The variable to add.
     */
    addVariable(v: HeaderVariable) {
      this.variables.push(v);
    }
    /**
     * Remove a variable from the list.
     * @param v The variable to remove.
     */
    removeVariable(v: HeaderVariable) {
      this.removeVariableAt(this.variables.indexOf(v));
    }
    /**
     * Remove the variable at the given index.
     * @param idx The index of the variable.
     */
    removeVariableAt(idx: number) {
      this.variables.splice(idx, 1);
    }
    /**
     * Replace a variable in the list.
     * @param v1 The variable to replace.
     * @param v2 The variable to replace it with.
     */
    replaceVariable(v1: HeaderVariable, v2: HeaderVariable) {
      this.replaceVariableAt(this.variables.indexOf(v1), v2);
    }
    /**
     * Replace a variable at the given position in the list.
     * @param idx The index of the variable to replace.
     * @param v The variable to replace it with.
     */
    replaceVariableAt(idx: number, v: HeaderVariable) {
      this.variables.splice(idx, 1, v);
    }
    /**
     * The fps of the sequence.
     */
    fps: number = 30;
    /**
     * A set of Sparse Ranges, which reduce file size.
     */
    channelRanges: HeaderSparseRange[] = [];
    /**
     * Add a range of channels.
     * @param r The Channel Range to add.
     */
    addChannelRange(r: HeaderSparseRange) {
      this.channelRanges.push(r);
    }
    /**
     * Remove a range of channels.
     * @param r The Channel Range to remove.
     */
    removeChannelRange(r: HeaderSparseRange) {
      this.channelRanges.splice(this.channelRanges.indexOf(r), 1);
    }

    /**
     * The unique id of the file.
     */
    uid: Uint64 = new Uint64().f(0);
    /**
     * Set the file's uid.
     * @param uid The unique id.
     */
    setUID(uid: Uint64) {
      this.uid = uid;
    }

    private constructHeader() {
      return new Header(
        0,
        2,
        new Uint32().f(this.frames.length),
        new Uint8().f(this.fps ** -1),
        new Uint8().f(0),
        new Uint8().f(this.channelRanges.length),
        this.uid,
        this.variables
      ).toBuffer();
    }

    private buildRanges() {
      return this.channelRanges.map((r) => r.toBuffer());
    }

    private buildVariables() {
      return this.variables.map((v) => v.toBuffer());
    }

    private buildFrames() {
      return this.frames.map((f) => f.toBuffer());
    }

    /**
     * Converts the FSEQ to a buffer to write it to a file.
     * @returns The generated file buffer.
     */
    toBuffer() {
      let data = [
        this.constructHeader(),
        this.buildRanges(),
        this.buildVariables(),
        this.buildFrames()
      ].flat();

      return Buffer.concat(data);
    }
  }

  export function genterateUID() {
    //! This WILL need to be changed to use bigint later.
    // However, seeing as the max integer is 1.7976931348623157e+308 and this is
    // (at the time of writing) only around 1.6e+5 this is not a pressing issue.
    return new Uint64().f(Date.now() * 1000);
  }
}
