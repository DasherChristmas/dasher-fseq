# dasher-fseq

Dasher's internal fseq utilities.

Built with extensive help from [CaptainMurdoch](https://falconchristmas.com/forum/index.php?action=profile;u=122) on the FalconChristmas forums

intended only for use in the Dasher Christmas Light Sequencer (not yet released).

## Exports provided

The `Colors` utility object that contains the numerical codes for different color channel orders and methods to convert between these codes and strings and vice versa - currently unused by the library.

The `Uint` object that contains the Unsigned integer classes used to limit number sizes. Uint subclasses included:

- `Uint4`
  - `Uint4Clamped`
- `Uint8`
  - `Uint8Clamped`
- `Uint12` - This one is an oddball only for compression block count.
- `Uint16`
  - `Uint16Clamped`
- `Uint24`
  - `Uint24Clamped`
- `Uint32`
  - `Uint32Clamped`
- `Uint64` - Though it does not currently support bigints.
  - `Uint64Clamped`
- `Uint` - An `abstract class` used to make variants of different sizes.

The `FSEQ` module used to turn Object data into a fseq buffer.
