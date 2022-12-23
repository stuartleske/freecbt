import React, { ReactNode } from "react"
import {
  SubHeader,
  Paragraph,
  Header,
  IconButton,
  ActionButton,
  GhostButton,
} from "../ui"
import {
  ScrollView,
  View,
  Linking,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Text,
} from "react-native"
import Constants from "expo-constants"
import * as Haptic from "expo-haptics"
import theme from "../theme"
import { Screen, ScreenProps } from "../screens"
import i18n from "../i18n"
import { BubbleThought } from "../imgs/Bubbles"
import haptic from "../haptic"
import * as D from "../io-ts/distortion"
import * as Feature from "../feature"

type Props = ScreenProps<Screen.EXPLANATION>

function Distortion(props: {
  children: ReactNode
  selected: boolean
  onPress: () => void
}): JSX.Element {
  if (!Feature.useFeature.extendedDistortions()) {
    return <View style={{ marginBottom: 48 }}>{props.children}</View>
  }
  const style = {
    backgroundColor: props.selected ? theme.blue : "white",
    borderColor: props.selected ? theme.darkBlue : theme.lightGray,
    borderBottomWidth: 2,
    paddingTop: 8,
    paddingLeft: 4,
    paddingRight: 4,
    paddingBottom: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
    marginTop: 1,
  }
  return (
    <TouchableOpacity onPress={props.onPress} style={style}>
      <View style={{ marginBottom: 48 }}>{props.children}</View>
    </TouchableOpacity>
  )
}

const style = StyleSheet.create({
  selected: {
    color: "white",
  },
  unselected: {
    color: theme.darkText,
  },
  subheader: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 12,
  },
})

const els: { [slug: string]: (props: { selected: boolean }) => JSX.Element } = {
  "all-or-nothing": (props) => (
    <>
      <SubHeader>
        {i18n.t("all_or_nothing_thinking")} {"🌓"}
      </SubHeader>

      <Paragraph>{i18n.t("all_or_nothing_thinking_explanation")}</Paragraph>

      <BubbleThought>{i18n.t("all_or_nothing_thinking_thought")}</BubbleThought>
    </>
  ),
  catastrophizing: () => (
    <>
      <SubHeader>
        {i18n.t("catastrophizing")} {"🤯"}
      </SubHeader>

      <Paragraph>{i18n.t("catastrophizing_explanation")}</Paragraph>

      <BubbleThought color="purple">
        {i18n.t("catastrophizing_thought")}
      </BubbleThought>
    </>
  ),
  "emotional-reasoning": () => (
    <>
      <SubHeader>
        {i18n.t("emotional_reasoning")} {"🎭"}
      </SubHeader>

      <Paragraph>
        {i18n.t("emotional_reasoning_explanation_1")} {"\n"}
      </Paragraph>

      <Paragraph>{i18n.t("emotional_reasoning_explanation_2")}</Paragraph>

      <BubbleThought color="pink">
        {i18n.t("emotional_reasoning_thought")}
      </BubbleThought>
    </>
  ),
  "fortune-telling": () => (
    <>
      <SubHeader>
        {i18n.t("fortune_telling")} {"🔮"}
      </SubHeader>

      <Paragraph>{i18n.t("fortune_telling_explanation")}</Paragraph>

      <BubbleThought color="purple">
        {i18n.t("fortune_telling_thought")}
      </BubbleThought>
    </>
  ),
  labeling: () => (
    <>
      <SubHeader>
        {i18n.t("labeling")} {"🏷"}
      </SubHeader>

      <Paragraph>{i18n.t("labeling_explanation")}</Paragraph>

      <BubbleThought>{i18n.t("labeling_thought")}</BubbleThought>
    </>
  ),
  "magnification-of-the-negative": () => (
    <>
      <SubHeader>
        {i18n.t("magnification_of_the_negative")} {"👎"}
      </SubHeader>

      <Paragraph>
        {i18n.t("magnification_of_the_negative_explanation")}
      </Paragraph>

      <BubbleThought>
        {i18n.t("magnification_of_the_negative_thought")}
      </BubbleThought>
    </>
  ),
  "mind-reading": () => (
    <>
      <SubHeader>
        {i18n.t("mind_reading")} {"🧠"}
      </SubHeader>

      <Paragraph>{i18n.t("mind_reading_explanation")}</Paragraph>

      <BubbleThought color="pink">
        {i18n.t("mind_reading_thought")}
      </BubbleThought>
    </>
  ),
  "minimization-of-the-positive": () => (
    <>
      <SubHeader>
        {i18n.t("minimization_of_the_positive")} {"👍"}
      </SubHeader>

      <Paragraph>
        {i18n.t("minimization_of_the_positive_explanation")}
      </Paragraph>

      <BubbleThought>
        {i18n.t("minimization_of_the_positive_thought")}
      </BubbleThought>
    </>
  ),
  "other-blaming": () => (
    <>
      <SubHeader>
        {i18n.t("other_blaming")} {"🧛‍"}
      </SubHeader>

      <Paragraph>
        {i18n.t("other_blaming_explanation_1")} {`\n`}
      </Paragraph>

      <Paragraph>{i18n.t("other_blaming_explanation_2")}</Paragraph>

      <BubbleThought color="purple">
        {i18n.t("other_blaming_thought")}
      </BubbleThought>
    </>
  ),
  overgeneralization: () => (
    <>
      <SubHeader>
        {i18n.t("over_generalization")} {"👯‍"}
      </SubHeader>

      <Paragraph>{i18n.t("over_generalization_explanation")}</Paragraph>

      <BubbleThought>{i18n.t("over_generalization_thought")}</BubbleThought>
    </>
  ),
  "self-blaming": () => (
    <>
      <SubHeader>
        {i18n.t("self_blaming")}
        {"👁"}
      </SubHeader>

      <Paragraph>{i18n.t("self_blaming_explanation")}</Paragraph>

      <BubbleThought color="pink">
        {i18n.t("self_blaming_thought")}
      </BubbleThought>
    </>
  ),
  "should-statements": () => (
    <>
      <SubHeader>
        {i18n.t("should_statements")} {"✨"}
      </SubHeader>

      <Paragraph>
        {i18n.t("should_statements_explanation_1")} {"\n"}
      </Paragraph>

      <Paragraph>{i18n.t("should_statements_explanation_2")}</Paragraph>

      <BubbleThought>{i18n.t("should_statements_thought")}</BubbleThought>
    </>
  ),
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

        {D.sortedBySlug.map((d) => {
          const El = els[d.slug]
          const s = selected.has(d)
          // console.log(d.slug, El, s)
          return (
            <Distortion key={d.slug} selected={s} onPress={() => toggle(d)}>
              <El selected={s} />
            </Distortion>
          )
        })}
      </View>
    </ScrollView>
  )
}
