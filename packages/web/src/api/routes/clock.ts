import { base } from "../__core/app";

/**
 * Trusted time source for capture devices.
 *
 * The phone compares this against its own clock and stores the difference as an
 * offset, so a photo taken offline in a dead zone can still prove its capture time
 * was honest when it finally uploads hours later.
 *
 * Public on purpose: a device has to be able to sync its clock before it signs in,
 * and the response carries nothing but the current server time.
 */
export const clock = {
  now: base.handler(() => ({ now: Date.now() })),
};
