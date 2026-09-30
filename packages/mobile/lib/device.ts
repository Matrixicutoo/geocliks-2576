import Constants from "expo-constants";
import * as Device from "expo-device";

/**
 * Which handset a capture or a punch came off, for the evidence record.
 *
 * `Device.modelName` is the hardware model — "iPhone 15 Pro", "Pixel 8". That is what a
 * dispute wants: it describes the camera that took the picture, and it means the same thing
 * to everyone reading the record a year later.
 *
 * `Constants.deviceName` is only a fallback. It is whatever the owner named the phone —
 * "Marc's iPhone", sometimes a nickname, sometimes blank — which identifies a person rather
 * than a device, and changes whenever they rename it. Fine when nothing better is available,
 * wrong to prefer.
 *
 * Both are null on an emulator with no model reported, and the field is nullable all the way
 * to the column, so an unknown device stays unknown rather than being guessed at.
 *
 * One function, called from both the camera queue and the punch stamp, so the two paths can
 * never label the same phone differently.
 */
export function deviceLabel(): string | null {
  const model = Device.modelName?.trim();
  if (model) return model.slice(0, 80);
  const named = Constants.deviceName?.trim();
  return named ? named.slice(0, 80) : null;
}
