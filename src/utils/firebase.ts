import { initializeApp, applicationDefault } from "firebase-admin/app";
// import { getMessaging } from "firebase-admin/messaging";

process.env.GOOGLE_APPLICATION_CREDENTIALS;
initializeApp({
  credential: applicationDefault(),
  projectId: "e-financer",
});


