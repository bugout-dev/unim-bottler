export interface BottleType {
  volume: number;
  name: string;
  imageUrl: string;
}
export interface BottleTypes {
  small: BottleType;
  medium: BottleType;
  large: BottleType;
}

export const BOTTLE_TYPES: BottleTypes = {
  small: {
    volume: process.env.NODE_ENV !== "development" ? 500 : 250,
    name: "small",
    imageUrl:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/small_um.png",
  },
  medium: {
    volume: process.env.NODE_ENV !== "development" ? 2500 : 5000,
    name: "medium",
    imageUrl:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/medium_um.png",
  },
  large: {
    volume: process.env.NODE_ENV !== "development" ? 50000 : 50000,
    name: "large",
    imageUrl:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/large_um.png",
  },
};

export const MILK_ADDRESS =
  process.env.NODE_ENV === "development"
    ? "0x3655B1500122aE4A0f1ADB85D6581F0127e63814"
    : "NOT DEFINED YET!";

export const BOTTLER_ADDRESS =
  process.env.NODE_ENV === "development"
    ? "0x54d9fda007F0117a657092dAD547c9Eb51af0fF1"
    : "NOT DEFINED YET!";
