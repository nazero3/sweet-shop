import React from "react";
import CustomerApp from "./src/customer-app";
import OwnerApp from "./src/owner-app";

export default function App(): React.ReactElement {
  const runtimeMode =
    typeof globalThis !== "undefined" && "__APP_MODE__" in globalThis
      ? ((globalThis as Record<string, unknown>).__APP_MODE__ as string | undefined)
      : undefined;
  const mode = runtimeMode === "owner" ? "owner" : "customer";
  return mode === "owner" ? <OwnerApp /> : <CustomerApp />;
}
