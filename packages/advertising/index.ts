import type { Campaign, Device } from "../domain";
export function playlist(
  campaigns: Campaign[],
  device: Device,
  now = new Date(),
  timezone = "Asia/Kolkata",
) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (name: string) => p.find((x) => x.type === name)?.value || "";
  const date = `${part("year")}-${part("month")}-${part("day")}`,
    time = `${part("hour")}:${part("minute")}`,
    day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
      part("weekday"),
    );
  return campaigns
    .filter(
      (c) =>
        ["ACTIVE", "SCHEDULED"].includes(c.status) &&
        c.startDate <= date &&
        c.endDate >= date &&
        c.daysOfWeek.includes(day) &&
        (c.startTime <= c.endTime
          ? time >= c.startTime && time <= c.endTime
          : time >= c.startTime || time <= c.endTime) &&
        (c.targetType === "ALL" ||
          c.targets.includes(
            c.targetType === "FLOOR"
              ? device.floorId
              : c.targetType === "DEVICE"
                ? device.id
                : device.deviceGroup,
          )),
    )
    .sort(
      (a, b) =>
        ({ HIGH: 3, NORMAL: 2, LOW: 1 })[b.priority] -
          { HIGH: 3, NORMAL: 2, LOW: 1 }[a.priority] ||
        a.id.localeCompare(b.id),
    );
}
export function idleTransition(
  state: "ACTIVE" | "AD",
  lastInteraction: number,
  now: number,
  timeoutSeconds: number,
  event: "tick" | "interaction",
) {
  if (event === "interaction") return "ACTIVE";
  return now - lastInteraction >= timeoutSeconds * 1000 ? "AD" : state;
}
