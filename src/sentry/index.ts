import * as Sentry from "sentry-expo";

Sentry.init({
  dsn:
    "https://2a90a942f052449db134f1131a7649fd@o392715.ingest.sentry.io/5240752",
  // enableInExpoDevelopment: true,
  // debug: true,
});

export default Sentry;
