export function haveHoursPassed(hours, timeToCheckMs) {
  let hoursToMs = 24 * 60 * 60 * 1000;
  let now = Date.now();

  if(now - timeToCheckMs >= hoursToMs) {
    return true;
  }
};