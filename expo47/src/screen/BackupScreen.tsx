import React from "react"
import { ScrollView, StatusBar, TextInput, Text, Alert } from "react-native"
import theme from "../theme"
import Constants from "expo-constants"
import * as AsyncState from "../async-state"
import {
  Header,
  Row,
  Container,
  IconButton,
  ActionButton,
  Paragraph,
} from "../ui"
import { Screen, ScreenProps } from "../screens"
import i18n from "../i18n"
import {
  textInputStyle,
  textInputPlaceholderColor,
} from "../form/textInputStyle"
import { FadesIn } from "../animations"
import * as TS from "../io-ts/thought/store"
import * as T from "io-ts"
import * as Clipboard from "expo-clipboard"
import { Archive } from "../io-ts/archive"

type Props = ScreenProps<Screen.BACKUP>

export default function BackupScreen(props: Props): JSX.Element {
  const archive = AsyncState.useAsyncState<string>(TS.readArchiveString)

  return (
    <FadesIn style={{ backgroundColor: theme.lightOffwhite }} pose="visible">
      <ScrollView
        style={{
          backgroundColor: theme.lightOffwhite,
          marginTop: Constants.statusBarHeight,
          paddingTop: 24,
          height: "100%",
        }}
      >
        <Container style={{ paddingBottom: 128 }}>
          <StatusBar barStyle="dark-content" />
          <Row style={{ marginBottom: 18 }}>
            <Header>{i18n.t("export_screen.header")}</Header>
            <IconButton
              featherIconName={"list"}
              accessibilityLabel={i18n.t("accessibility.list_button")}
              onPress={() => {
                props.navigation.pop()
              }}
            />
          </Row>
          {AsyncState.fold(
            archive,
            () => null,
            () => null,
            (error) => (
              <Text>{error}</Text>
            ),
            (a) => (
              <>
                <Export archive={a} />
                <Import archive={a} />
              </>
            )
          )}
        </Container>
      </ScrollView>
    </FadesIn>
  )
}

function Export(props: { archive: string }): JSX.Element {
  const [isCopied, setIsCopied] = React.useState(false)

  return (
    <>
      <Row style={{ marginBottom: 9 }}>
        <Paragraph>{i18n.t("export_screen.export.description")}</Paragraph>
      </Row>
      <Row style={{ marginBottom: 9 }}>
        <TextInput
          style={{
            ...textInputStyle,
            backgroundColor: "white",
          }}
          // @ts-expect-error not sure why this isn't typed, but it makes this fill the width
          flex={1}
          value={props.archive}
          multiline={true}
          numberOfLines={3}
          editable={true}
          selectTextOnFocus={true}
        />
      </Row>
      <Row style={{ marginBottom: 9 }}>
        <ActionButton
          flex={1}
          title={i18n.t("export_screen.export.button")}
          fillColor="#EDF0FC"
          textColor={theme.darkBlue}
          onPress={async () => {
            setIsCopied(await Clipboard.setStringAsync(props.archive))
          }}
        />
      </Row>
      {isCopied ? (
        <Row style={{ marginBottom: 9 }}>
          <Text>{i18n.t("export_screen.export.success")}</Text>
        </Row>
      ) : null}
    </>
  )
}

function Import(props: { archive: string }): JSX.Element {
  const [archiveWrite, setArchiveWrite] = React.useState<
    AsyncState.RemoteData<null, T.Errors>
  >({
    status: "init",
  })
  const [importText, setImportText] = React.useState<string>("")
  async function onImport(): Promise<void> {
    const promise = TS.writeArchiveString(importText ?? "")
    setArchiveWrite({
      status: "pending",
      promise: promise.then(() => {}),
    })
    const result = await promise
    setArchiveWrite(
      result === null
        ? { status: "success", value: null }
        : { status: "failure", error: result }
    )
  }

  return (
    <>
      <Row style={{ marginBottom: 9 }}>
        <Paragraph>{i18n.t("export_screen.import.description")}</Paragraph>
      </Row>
      <Row style={{ marginBottom: 9 }}>
        <TextInput
          style={{
            ...textInputStyle,
            backgroundColor: "white",
          }}
          // @ts-expect-error not sure why this isn't typed, but it makes this fill the width
          flex={1}
          placeholderTextColor={textInputPlaceholderColor}
          placeholder={props.archive}
          value={importText}
          multiline={true}
          numberOfLines={3}
          editable={true}
          selectTextOnFocus={true}
          onChange={(event) => {
            setImportText(event.nativeEvent.text)
            setArchiveWrite({ status: "init" })
          }}
        />
      </Row>
      <Row style={{ marginBottom: 9 }}>
        <ActionButton
          flex={1}
          title={i18n.t("export_screen.import.button")}
          fillColor="#EDF0FC"
          textColor={theme.darkBlue}
          onPress={onImport}
        />
      </Row>
      {AsyncState.fold(
        archiveWrite,
        () => null,
        () => null,
        (err) => (
          <Row style={{ marginBottom: 9 }}>
            <Text>{i18n.t("export_screen.import.failure")}</Text>
          </Row>
        ),
        () =>
          importText === props.archive ? (
            <Row style={{ marginBottom: 9 }}>
              <Text>{i18n.t("export_screen.import.noop")}</Text>
            </Row>
          ) : (
            <Row style={{ marginBottom: 9 }}>
              <Text>{i18n.t("export_screen.import.success")}</Text>
            </Row>
          )
      )}
    </>
  )
}
