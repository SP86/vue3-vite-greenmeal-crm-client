import { DAYS } from "../constants.js";
import { ref, computed } from "vue";
import moment from "moment";
import momentTz from "moment-timezone";
export default function useDatesCalculation() {
  const days = DAYS;
  const nowInMadrid = ref(moment().tz("Europe/Madrid"));
  // const nowInMadrid = ref(
  //   moment().tz("Europe/Madrid").set({
  //     year: 2023,
  //     month: 6,
  //     date: 25,
  //     hour: 10,
  //     minute: 8,
  //     second: 0,
  //   })
  // );

  const time11AM = moment().tz("Europe/Madrid").set({
    year: 2023,
    month: 6,
    date: 25,
    hour: 11,
    minute: 0,
    second: 0,
  });

  const currentIsoWeekday = computed(() => {
    return moment().isoWeekday();
  });

  const isOwer11Pm = computed(() => {
    return nowInMadrid.value.isAfter(
      moment().tz("Europe/Madrid").hour(11).minute(0).second(0)
    );
    // return nowInMadrid.value.isAfter(time11AM);
  });

  const remainingOrderTime = computed(() => {
    const currentDayOfWeek = nowInMadrid.value.day();

    let targetDayOfWeek; // day number convert to day name for timer block
    let lastDayToOrder; // last day in diff calculation (to 11 am)

    if (currentDayOfWeek === 4) {
      targetDayOfWeek = !isOwer11Pm.value ? currentDayOfWeek + 1 : 1;
      lastDayToOrder = !isOwer11Pm.value ? currentDayOfWeek : 7;
    } else if (currentDayOfWeek === 5 || currentDayOfWeek === 6) {
      targetDayOfWeek = 1;
      lastDayToOrder = 7;
    } else {
      targetDayOfWeek = !isOwer11Pm.value
        ? currentDayOfWeek + 1
        : currentDayOfWeek + 2;

      lastDayToOrder = !isOwer11Pm.value
        ? currentDayOfWeek
        : currentDayOfWeek + 1;
    }

    let orderTimeEnd = moment()
      .tz("Europe/Madrid")
      .day(lastDayToOrder)
      .hour(11)
      .minute(0)
      .second(0);

    if (targetDayOfWeek) {
      if (nowInMadrid.value.isAfter(orderTimeEnd)) {
        orderTimeEnd.add(1, "week");
      }
      const duration = moment.duration(orderTimeEnd.diff(nowInMadrid.value));
      const hours = duration.days() * 24 + duration.hours();
      const minutes = duration.minutes();

      const timerObj = {
        hours: hours,
        hoursFormatted: hours.toString().padStart(2, "0"),
        minutes: minutes,
        minutesFormatted: minutes.toString().padStart(2, "0"),
        fullDayOfWeek: moment()
          .locale("en")
          .weekday(targetDayOfWeek)
          .format("dddd"),
        shortDayOfWeek: moment()
          .locale("en")
          .weekday(targetDayOfWeek)
          .format("ddd"),
      };

      return timerObj;
    } else {
      return false;
    }
  });

  const setCurrentTimeInMadrid = () => {
    nowInMadrid.value = moment().tz("Europe/Madrid");
  };

  setInterval(() => {
    setCurrentTimeInMadrid();
  }, 60000);

  return {
    currentIsoWeekday,
    remainingOrderTime,
    isOwer11Pm,
  };
}
