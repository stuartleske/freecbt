import { StyleSheet, TextStyle, ViewStyle } from "react-native"

export const theme2 = {
  background: "white",
  text: "#596275",
  textHeader: "#303952",
  backgroundCard: "#f2f5fa",
  border: "#dadfeb",

  backgroundSelected: "#778beb",
  backgroundCardSelected: "#546de5",
  borderSelected: "#546de5",
  textSelected: "white",
  textHeaderSelected: "white",
}

const text = {
  color: theme2.text,
  // backgroundColor: theme2.background,
} as TextStyle
const border = {
  borderColor: theme2.border,
  borderRadius: 8,
  borderWidth: StyleSheet.hairlineWidth,
  borderBottomWidth: StyleSheet.hairlineWidth * 2,
  padding: 4,
}
const subheader = {
  color: theme2.textHeader,
  // backgroundColor: theme2.background,
  fontWeight: "700",
  fontSize: 18,
  marginBottom: 12,
} as TextStyle
const card = {
  color: theme2.text,
  backgroundColor: theme2.backgroundCard,
  // borderColor: theme2.border,
  borderColor: theme2.backgroundCard,
  borderRadius: 8,
  // borderWidth: StyleSheet.hairlineWidth,
  // borderBottomWidth: StyleSheet.hairlineWidth * 2,
  padding: 4,
}
const paragraph = {
  ...text,
  fontWeight: "400",
  fontSize: 16,
} as TextStyle
export const light = StyleSheet.create({
  text,
  border,
  subheader,
  card,
  paragraph,
  view: { backgroundColor: theme2.background } as ViewStyle,

  // selected
  selectedText: {
    color: theme2.textSelected,
    // backgroundColor: theme2.backgroundSelected,
  },
  selectedBorder: {
    ...border,
    borderColor: theme2.borderSelected,
  },
  selectedSubheader: {
    ...subheader,
    color: theme2.textHeaderSelected,
    // backgroundColor: theme2.backgroundSelected,
  },
  selectedCard: {
    ...card,
    color: theme2.textSelected,
    backgroundColor: theme2.backgroundCardSelected,
    borderColor: theme2.borderSelected,
  },
  selectedParagraph: {
    ...paragraph,
    color: theme2.textSelected,
    // backgroundColor: theme2.backgroundSelected,
  },
  selectedView: { backgroundColor: theme2.backgroundSelected } as ViewStyle,
})
