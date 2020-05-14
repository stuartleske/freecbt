import React from "react";
import { ScrollView, StatusBar, Platform } from "react-native";
import theme from "./theme";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import {
  Header,
  Row,
  Container,
  IconButton,
  SubHeader,
  Paragraph,
  RoundedSelectorButton,
  B,
  ActionButton,
} from "./ui";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationAction,
} from "react-navigation";
import { CBT_ON_BOARDING_SCREEN, LOCK_SCREEN } from "./screens";
import { setSetting, getSettingOrSetDefault } from "./setting/settingstore";
import {
  HISTORY_BUTTON_LABEL_KEY,
  HISTORY_BUTTON_LABEL_DEFAULT,
  HistoryButtonLabelSetting,
  isHistoryButtonLabelSetting,
} from "./setting";
import i18n from "./i18n";
import { recordScreenCallOnFocus } from "./navigation";
import OneSignal from "react-native-onesignal";
// import { ONESIGNAL_SECRET } from "react-native-dotenv";
import * as stats from "./stats";
import { FadesIn } from "./animations";

export { HistoryButtonLabelSetting };

// Exportable settings
export async function getHistoryButtonLabel(): Promise<
  HistoryButtonLabelSetting
> {
  const value = await getSettingOrSetDefault(
    HISTORY_BUTTON_LABEL_KEY,
    HISTORY_BUTTON_LABEL_DEFAULT
  );

  if (!isHistoryButtonLabelSetting(value)) {
    console.error(
      `Something went wrong getting ${HISTORY_BUTTON_LABEL_KEY}. Got: "${value}"`
    );
    return HISTORY_BUTTON_LABEL_DEFAULT;
  }

  return value;
}

interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationAction>;
}

interface State {
  isReady: boolean;
  historyButtonLabel?: HistoryButtonLabelSetting;
  subscriptionExpirationDate?: string;
  areNotificationsOn?: boolean;
}

class SettingScreen extends React.Component<Props, State> {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      areNotificationsOn: false,
    };
    recordScreenCallOnFocus(this.props.navigation, "settings");
  }

  async componentDidMount() {
    //OneSignal.init(ONESIGNAL_SECRET, {
    //  kOSSettingsKeyAutoPrompt: false,
    //  kOSSettingsKeyInFocusDisplayOption: 0,
    //});
    await this.refresh();
  }

  refresh = async () => {
    const historyButtonLabel = await getHistoryButtonLabel();
    this.setState({
      historyButtonLabel,
      // TODO: remove once OneSignal works
      isReady: true,
    });

    // Check notification status
    // TODO: this is failing and blocking page load (probably because my ONESIGNAL_SECRET is bogus)
    //OneSignal.getPermissionSubscriptionState(status => {
    //  this.setState({
    //    areNotificationsOn: !!status.subscriptionEnabled,
    //    isReady: true,
    //  });
    //});
  };

  navigateToList = () => {
    this.props.navigation.pop();
  };

  navigateToOnboardingScreen = () => {
    this.props.navigation.navigate(CBT_ON_BOARDING_SCREEN);
  };

  toggleHistoryButtonLabels = () => {
    if (!this.state.isReady) {
      this.refresh();
      return;
    }

    if (this.state.historyButtonLabel === "alternative-thought") {
      setSetting<HistoryButtonLabelSetting>(
        HISTORY_BUTTON_LABEL_KEY,
        "automatic-thought"
      );
      this.refresh();
    } else {
      setSetting<HistoryButtonLabelSetting>(
        HISTORY_BUTTON_LABEL_KEY,
        "alternative-thought"
      );
      this.refresh();
    }
  };

  render() {
    const { historyButtonLabel, isReady } = this.state;

    return (
      <FadesIn
        style={{ backgroundColor: theme.lightOffwhite }}
        pose={isReady ? "visible" : "hidden"}
      >
        <ScrollView
          style={{
            backgroundColor: theme.lightOffwhite,
            marginTop: Constants.statusBarHeight,
            paddingTop: 24,
            height: "100%",
          }}
        >
          <Container
            style={{
              paddingBottom: 128,
            }}
          >
            <StatusBar barStyle="dark-content" />
            <Row style={{ marginBottom: 18 }}>
              <Header>{i18n.t("settings.header")}</Header>
              <IconButton
                featherIconName={"list"}
                accessibilityLabel={i18n.t("accessibility.list_button")}
                onPress={() => this.navigateToList()}
              />
            </Row>

            <Row
              style={{
                marginBottom: 18,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <SubHeader>*reminders</SubHeader>
              <Paragraph
                style={{
                  marginBottom: 9,
                }}
              >
                If you'd like, you can turn on notification reminders that help
                you build up the habit of challenging thoughts.
              </Paragraph>
              <RoundedSelectorButton
                title={"Please remind me"}
                selected={this.state.areNotificationsOn}
                onPress={() => {
                  if (Platform.OS === "ios") {
                    OneSignal.registerForPushNotifications();
                  }
                  OneSignal.setSubscription(true);
                  this.setState({
                    areNotificationsOn: true,
                  });
                  stats.userTurnedOnNotifications();
                }}
              />

              <RoundedSelectorButton
                title={"No reminders, thanks"}
                selected={!this.state.areNotificationsOn}
                onPress={() => {
                  OneSignal.setSubscription(false);
                  this.setState({
                    areNotificationsOn: false,
                  });
                  stats.userTurnedOffNotifications();
                }}
              />
            </Row>

            <Row
              style={{
                marginBottom: 18,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <SubHeader>*pincode lock 🔒</SubHeader>
              <Paragraph
                style={{
                  marginBottom: 9,
                }}
              >
                You can lock the app with a pincode if you'd like. Be warned
                that the only way to reset the code is to contact support (which
                can take awhile), so be careful not to forget.
              </Paragraph>
              <ActionButton
                flex={1}
                title={"Set Pincode"}
                width={"100%"}
                fillColor="#EDF0FC"
                textColor={theme.darkBlue}
                onPress={() => {
                  this.props.navigation.push(LOCK_SCREEN, {
                    isSettingCode: true,
                  });
                }}
              />
            </Row>

            <Row
              style={{
                marginBottom: 18,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <SubHeader>*history button labels</SubHeader>
              <Paragraph
                style={{
                  marginBottom: 9,
                }}
              >
                By default, we set the buttons in the history screen to use the
                Alternative Thought. This helps cement the thought as "changed."
              </Paragraph>
              <RoundedSelectorButton
                title={"Alternative Thought"}
                selected={historyButtonLabel === "alternative-thought"}
                onPress={() => this.toggleHistoryButtonLabels()}
              />
              <RoundedSelectorButton
                title={"Automatic Thought"}
                selected={historyButtonLabel === "automatic-thought"}
                onPress={() => this.toggleHistoryButtonLabels()}
              />
            </Row>

    <Row
      style={{
        marginBottom: 9,
      }}
    >
      <ActionButton
        flex={1}
        title={"Privacy Policy"}
        fillColor="#EDF0FC"
        textColor={theme.darkBlue}
        onPress={() => {
          const url = "https://github.com/erosson/freecbt/blob/master/PRIVACY.md"
          Linking.canOpenURL(url).then(() =>
            Linking.openURL(url)
          );
        }}
      />
    </Row>
    <Row>
      <ActionButton
        flex={1}
        title={"Terms of Service"}
        fillColor="#EDF0FC"
        textColor={theme.darkBlue}
        onPress={() => {
          const url = "https://github.com/erosson/freecbt/blob/master/TOS.md"
          Linking.canOpenURL(url).then(() =>
            Linking.openURL(url)
          );
        }}
      />
    </Row>
          </Container>
        </ScrollView>
      </FadesIn>
    );
  }
}

export default SettingScreen;
