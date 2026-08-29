import { NextResponse } from "next/server";
import { STORES } from "@/lib/stores";
import { getStoreLiveStatus } from "@/lib/storeStatus";

export const dynamic = "force-dynamic";

export async function GET() {
  const results = STORES.map((store) => {
    const status = getStoreLiveStatus({
      openHour: store.openHour,
      closeHourWeekday: store.closeHourWeekday,
      closeHourSunday: store.closeHourSunday,
    });

    return {
      key: store.key,
      name: store.name,
      ...status,
    };
  });

  return NextResponse.json({
    success: true,
    timezone: "Asia/Makassar (WITA / UTC+8)",
    stores: results,
  });
}
