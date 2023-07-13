import moment from "moment";

export const DISH_PRICES = {
  main_1: 8,
  main_2: 6,
  main_3: 4,
  breakfast_1: 6,
  breakfast_2: 4,
  vegetarian_1: 6,
  vegetarian_2: 4,
  side: 0,
};

export const DAYS = [
  {
    id: 1,
    name: "menu_for_monday",
    short: "Mo",
    title: "Monday",
    date: moment().isoWeekday(1).format("YYYY-MM-DD"),
    show: false,
    error: false,
  },
  {
    id: 2,
    name: "menu_for_tuesday",
    short: "Tu",
    title: "Tuesday",
    date: moment().isoWeekday(2).format("YYYY-MM-DD"),
    show: false,
    error: false,
  },
  {
    id: 3,
    name: "menu_for_wednesday",
    short: "We",
    title: "Wednesday",
    date: moment().isoWeekday(3).format("YYYY-MM-DD"),
    show: false,
    error: false,
  },
  {
    id: 4,
    name: "menu_for_thursday",
    short: "Th",
    title: "Thursday",
    date: moment().isoWeekday(4).format("YYYY-MM-DD"),
    show: false,
    error: false,
  },
  {
    id: 5,
    name: "menu_for_friday",
    short: "Fr",
    title: "Friday",
    date: moment().isoWeekday(5).format("YYYY-MM-DD"),
    show: false,
    error: false,
  },
  {
    id: 6,
    name: "menu_for_saturday",
    short: "Sa",
    title: "Saturday",
    date: moment().isoWeekday(6).format("YYYY-MM-DD"),
    show: false,
    error: false,
  },
];
