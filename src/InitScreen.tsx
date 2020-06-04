import React from "react";
import { View } from "react-native";
import { hasPincode } from "./lock/lockstore";
import {
  NavigationScreenProp,
  NavigationState,
  NavigationAction,
} from "react-navigation";
import * as Screens from "./screens";

interface Props {
  navigation: NavigationScreenProp<NavigationState, NavigationAction>;
}

export default class InitScreen extends React.Component<Props, {}> {
  async componentDidMount() {
    this.redirectToFormScreen();
  }

  async redirectToFormScreen() {
    // If we're locked, go to the lock instead
    // Check if we should show a pincode
    const isLocked = await hasPincode();
    if (isLocked) {
      this.props.navigation.replace(Screens.LOCK_SCREEN);
      return;
    }

    // We replace here because you shouldn't be able to go "back" to this screen
    this.props.navigation.replace(Screens.CBT_FORM_SCREEN, {
      thought: false,
    });
  }

  render() {
    return <View />;
  }
}
