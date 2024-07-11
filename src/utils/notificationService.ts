import { Expo, ExpoPushMessage } from "expo-server-sdk";

let expo = new Expo();

export async function sendPushNotification(
  expoPushToken: string,
  message: string,
  title: string
) {
  if (!Expo.isExpoPushToken(expoPushToken)) {
    console.error(`Push token ${expoPushToken} is not a valid Expo push token`);
    return;
  }

  console.log("Sending push notification");

  const messages: ExpoPushMessage[] = [
    {
      to: expoPushToken,
      sound: "default",
      title: title,
      body: message,
      data: { withSome: "data" },
    },
  ];

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }
}
