export default ({ config }) => ({
  ...config,
  name: "Sweet Shop",
  slug: "sweet-shop",
  extra: {
    appMode: process.env.EXPO_PUBLIC_APP_MODE ?? "customer"
  }
});
