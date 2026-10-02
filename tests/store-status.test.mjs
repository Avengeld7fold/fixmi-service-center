import assert from "node:assert/strict";
import { test } from "node:test";
import { getStoreLiveStatus } from "../lib/storeStatus.ts";

test("store status uses WITA boundaries independent of device timezone", () => {
  for (const timezone of ["UTC", "Asia/Makassar", "America/New_York", "Europe/London"]) {
    const previous = process.env.TZ;
    process.env.TZ = timezone;
    try {
      for (const [instant, expected] of [
        ["2026-10-02T00:59:00Z", "closed"],
        ["2026-10-02T01:00:00Z", "open"],
        ["2026-10-02T12:29:00Z", "open"],
        ["2026-10-02T12:30:00Z", "closing_soon"],
        ["2026-10-02T13:00:00Z", "closed"],
        ["2026-10-04T02:00:00Z", "closed"],
        ["2026-12-25T02:00:00Z", "holiday"],
      ]) {
        assert.equal(getStoreLiveStatus(undefined, new Date(instant)).statusType, expected, `${timezone}: ${instant}`);
      }
      assert.equal(getStoreLiveStatus({ openHour: 9, closeHourWeekday: 22, closeHourSunday: 22 }, new Date("2026-10-04T02:00:00Z")).statusType, "open");
      assert.equal(getStoreLiveStatus(undefined, null).statusType, "pending");
    } finally {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
    }
  }
});
