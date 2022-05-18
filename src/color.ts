export const enum ColorOrder {
  RGB,
  RBG,
  GRB,
  GBR,
  BRG,
  BGR,
  ONE
}

export function colorOrderFromString(str: string): ColorOrder {
  switch (str.toLowerCase()) {
    case "rgb":
      return ColorOrder.RGB;
    case "rbg":
      return ColorOrder.RBG;
    case "grb":
      return ColorOrder.GRB;
    case "gbr":
      return ColorOrder.GBR;
    case "brg":
      return ColorOrder.BRG;
    case "bgr":
      return ColorOrder.BGR;
    case "w":
      return ColorOrder.ONE;
  }
  return ColorOrder.RGB;
}

export function colorOrderToString(order: number): string {
  switch (order) {
    case ColorOrder.RGB:
      return "RGB";
    case ColorOrder.RBG:
      return "RBG";
    case ColorOrder.GRB:
      return "GRB";
    case ColorOrder.GBR:
      return "GBR";
    case ColorOrder.BRG:
      return "BRG";
    case ColorOrder.BGR:
      return "BGR";
    case ColorOrder.ONE:
      return "W";
  }
  return "UNKNOWN";
}
