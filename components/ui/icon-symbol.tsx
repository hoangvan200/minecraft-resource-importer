import {
  Text,
  type OpaqueColorValue,
  type StyleProp,
  type TextStyle,
} from "react-native";

type IconSymbolName =
  | "house.fill"
  | "paperplane.fill"
  | "chevron.left.forwardslash.chevron.right"
  | "chevron.right";

const ICON_GLYPHS: Record<IconSymbolName, string> = {
  "house.fill": "⌂",
  "paperplane.fill": "➤",
  "chevron.left.forwardslash.chevron.right": "</>",
  "chevron.right": "›",
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: string;
}) {
  return (
    <Text
      style={[
        {
          width: size,
          height: size,
          color,
          fontSize: size,
          lineHeight: size,
          textAlign: "center",
        },
        style,
      ]}
    >
      {ICON_GLYPHS[name]}
    </Text>
  );
}
