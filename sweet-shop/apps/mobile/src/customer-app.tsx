import React from "react";
import { SafeAreaView, Text } from "react-native";
import { i18n } from "./i18n";

export default function CustomerApp(): React.ReactElement {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 10 }}>{i18n.t("customerTitle")}</Text>
      <Text>{i18n.t("browseStores")}</Text>
    </SafeAreaView>
  );
}
