import React from "react";
import { ScrollView, View, Text, Switch, Platform, AsyncStorage } from "react-native";
import Constants from "expo-constants";
import * as Feature from "./feature";
import versionJson from "../.version.json"

export default (props) => {
  const version = props.version || versionJson;
  const {feature, updateFeature} = React.useContext(Feature.Context);
  const [async_, setAsync] = React.useState(null);
  const [dump, setDump] = React.useState(false);
  React.useEffect(() => {
    if (dump && async_ === null) {
      (async () => {
        const keys = await AsyncStorage.getAllKeys();
        const dump = await AsyncStorage.multiGet(keys);
        setAsync(dump);
      })();
    }
  });
  const items = [
    ["Release channel", Constants.manifest.releaseChannel || "(dev)"],
    ["Installation id", Constants.installationId],
    ["Expo version", Constants.expoVersion],
    ["App version", Constants.manifest.version],
    ["Revision", Constants.manifest.revisionId || "(dev)"],
    ["Revision Git", version.hash],
    ["Revision Date", version.date],
    ["Revision Timestamp", version.timestamp + ''],
    ["OS", Platform.OS],
    ...(Object.entries(feature)
      // @ts-ignore: sort features by name. I promise key in [key, value] is a string
      .sort((a, b) => a[0] > b[0])
      .map(([key, val]: [string, boolean]) => (
        [key,
        <Switch
          value={val}
          onValueChange={() => updateFeature({[key]: !val})}
        />
        ]
      )
    )),
    ["Dump AsyncStorage?", <Switch value={dump} onValueChange={() => setDump(!dump)} />],
    ...(dump ? (async_ || []) : [])
      .map(([key, val]: [string, string]) => (
        ["AsyncStorage[\""+key+"\"]: \n"+val,
        ]
      )
    ),
  ]
  return (
    <ScrollView>
      <Text style={{fontSize: 24, borderBottomWidth: 1}}>Debug</Text>
      <View>
        {items.map(renderEntry)}
      </View>
    </ScrollView>
  )
};

function renderEntry([key, val], i) {
  if (typeof val === "string") {
    return (
      <View key={key} style={{flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1}}>
        <Text>{key}: </Text>
        <Text style={{alignSelf: "flex-end"}}>{val}</Text>
      </View>
    )
  }
  else if (React.isValidElement(val)) {
    return (
      <View key={key} style={{flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1}}>
        <Text>{key}: </Text>
        <View>{val}</View>
      </View>
    )
  }
  else {
    return (
      <View key={key} style={{flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1}}>
        <Text>{key}</Text>
      </View>
    )
  }
}
