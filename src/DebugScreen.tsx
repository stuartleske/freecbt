import React from "react";
import { View, Text, Switch, FlatList, Platform } from "react-native";
import Constants from 'expo-constants'
import feature from './feature'
import theme from "./theme";

export default class DebugScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {feature};
  }
  setFeature(key, val) {
    feature[key] = val;
    this.setState({feature});
  }
  render() {
    const items = [
      ["Release channel", Constants.manifest.releaseChannel || "(dev)"],
      ["Installation id", Constants.installationId],
      ["Expo version", Constants.expoVersion],
      ["App version", Constants.manifest.version],
      ["OS", Platform.OS],
      ["Test", <Text>test</Text>],
      ...(Object.entries(this.state.feature)).map(([key, val]) => (
        [key,
        <Switch
          value={val}
          onChange={() => {this.setFeature(key, !val);}}
        />
        ]
      ))
    ]
    return (
      <View>
        <Text style={{fontSize: 24, borderBottomWidth: 1}}>Debug</Text>
        <View>
          {items.map(renderEntry)}
        </View>
      </View>
    )
  }
}

function renderEntry([key, val], i) {
  const rowStyle = {flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1}
  if (typeof val === "string") {
    return (
      <View key={key} style={rowStyle}>
        <Text>{key}: </Text>
        <Text style={{alignSelf: "flex-end"}}>{val}</Text>
      </View>
    )
  }
  else if (React.isValidElement(val)) {
    return (
      <View key={key} style={rowStyle}>
        <Text>{key}: </Text>
        <View>{val}</View>
      </View>
    )
  }
  else {
    return (
      <View key={key} style={rowStyle}>
        <Text>{key}</Text>
      </View>
    )
  }
}
