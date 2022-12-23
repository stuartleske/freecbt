import React from "react"
import { Header, IconButton, ActionButton, GhostButton } from "../ui"
import {
  ScrollView,
  View,
  Linking,
  TouchableOpacity,
  BackHandler,
  Text,
} from "react-native"
import Constants from "expo-constants"
import * as Haptic from "expo-haptics"
import theme from "../theme"
import { Screen, ScreenProps } from "../screens"
import i18n from "../i18n"
import * as Bubbles from "../imgs/Bubbles"
import haptic from "../haptic"
import * as D from "../io-ts/distortion"
import * as Feature from "../feature"
import * as Style from "../style"
import { Feather } from "@expo/vector-icons"

type Props = ScreenProps<Screen.EXPLANATION>

function Distortion(props: {
  index: number
  distortion: D.Distortion
  selected: boolean
  toggle: (d: D.Distortion) => void
}): JSX.Element {
  const style = Style.useStyle()
  const selectable = Feature.useFeature.extendedDistortions()
  const selected = selectable && props.selected
  const d = props.distortion
  const bubble = Bubbles.colors[props.index % Bubbles.colors.length]
  const onPress = () => props.toggle(d)

  const body = (
    <>
      <Text style={selected ? [style.selectedSubheader] : [style.subheader]}>
        {d.label()} {d.emoji()}{" "}
        {selected ? (
          <Feather name="check" size={16} style={style.selectedText} />
        ) : null}
      </Text>

      {d.explanation().map((b, i) => (
        <Text
          key={i}
          style={selected ? [style.selectedParagraph] : [style.paragraph]}
        >
          {i === 0 ? "" : "\n"}
          {b}
        </Text>
      ))}

      <Bubbles.SelectableThought color={bubble} selected={selected}>
        {d.explanationThought()}
      </Bubbles.SelectableThought>
    </>
  )

  const styl = { marginBottom: 48 }
  if (!selectable) {
    return <View style={[style.view, styl]}>{body}</View>
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      style={
        selected
          ? [style.selectedBorder, style.selectedView, styl]
          : [style.border, style.view, styl]
      }
    >
      {body}
    </TouchableOpacity>
  )
}

export default function ExplanationScreen(props: Props): JSX.Element {
  const [selected, setSelected] = React.useState<Set<D.Distortion>>(
    new Set(props.route.params.distortions.map((d) => D.bySlug[d]))
  )

  function onBack() {
    onClose()
    return true
  }
  React.useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", onBack)
    return () => sub.remove()
  })

  function navigateToOnboardingScreen() {
    props.navigation.navigate(Screen.ONBOARDING)
  }
  function onClose() {
    haptic.impact(Haptic.ImpactFeedbackStyle.Light)
    // props.navigation.pop()
    props.navigation.navigate({
      name: Screen.CBT_FORM,
      params: { distortions: Array.from(selected).map((d) => d.slug) },
      merge: true,
    })
  }
  function toggle(d: D.Distortion) {
    const ret = new Set(selected)
    if (ret.has(d)) {
      ret.delete(d)
    } else {
      ret.add(d)
    }
    return setSelected(ret)
  }

  return (
    <ScrollView
      style={{
        marginTop: Constants.statusBarHeight,
        paddingTop: 24,
        paddingLeft: 24,
        paddingRight: 24,
        backgroundColor: "white",
      }}
    >
      <View
        style={{
          marginBottom: Constants.statusBarHeight + 24,
        }}
      >
        <View
          style={{
            marginBottom: 24,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Header allowFontScaling={false}>
            {i18n.t("explanation_screen.header")}
          </Header>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                marginRight: 8,
              }}
            >
              <GhostButton
                title={i18n.t("explanation_screen.intro")}
                width={80}
                height={48}
                borderColor={theme.lightGray}
                textColor={theme.veryLightText}
                onPress={navigateToOnboardingScreen}
              />
            </View>
            <IconButton
              featherIconName={"x"}
              accessibilityLabel={i18n.t("accessibility.new_thought_button")}
              onPress={onClose}
            />
          </View>
        </View>

        <View
          style={{
            marginBottom: 24,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <ActionButton
            flex={1}
            title={i18n.t("onboarding_screen.header")}
            fillColor="#EDF0FC"
            textColor={theme.darkBlue}
            onPress={() => {
              const url = "https://freecbt.erosson.org/explanation?ref=quirk"
              Linking.canOpenURL(url).then(() => Linking.openURL(url))
            }}
          />
        </View>

        {D.sortedBySlug.map((d, i) => (
          <Distortion
            key={d.slug}
            index={i}
            distortion={d}
            selected={selected.has(d)}
            toggle={toggle}
          />
        ))}
      </View>
    </ScrollView>
  )
}
