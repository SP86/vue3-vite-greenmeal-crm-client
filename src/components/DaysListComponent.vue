<script setup>
import moment from "moment";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import DayTotalPanel from "@/components/DayTotalPanel.vue";

const route = useRoute();
const currentDayName = ref("");

const props = defineProps({
  days: { type: Object, required: true },
  errorDays: { type: Object, required: false },
  totalPrice: { type: [Number, String], required: false },
  totalMacronutrientByDays: { type: Object, required: true },
});

const emits = defineEmits(["updateDay"]);

const isSwitchToNextDay = computed(() => {
  // const currentTime = new Date();
  // const currentHour = currentTime.getHours();

  // return currentHour >= 11;

  const currentTime = new Date();
  const options = { timeZone: "Europe/Madrid", hour: "numeric" };
  const formatter = new Intl.DateTimeFormat("es-ES", options);
  const currentHour = parseInt(formatter.format(currentTime), 10);
  console.log(currentHour);

  return currentHour >= 11;
});

const isClientMenu = computed(() => {
  return route.params.userId ? true : false;
});

// const currentDay = computed(() => {
//   let current;
//   moment().isoWeekday() > 4
//     ? (current = !isSwitchToNextDay.value ? 1 : 2)
//     : (current = !isSwitchToNextDay.value
//         ? moment().isoWeekday() + 1
//         : moment().isoWeekday() + 2);
//   return current;
// });

const currentDay = computed(() => {
  let day = moment().isoWeekday();
  if (!isClientMenu.value) {
    return 1;
  }

  if (day < 4) {
    return !isSwitchToNextDay.value ? day + 1 : day + 2;
  } else if (day === 4) {
    return !isSwitchToNextDay.value ? day : 1;
  } else if (day === 7) {
    return !isSwitchToNextDay.value ? 1 : 2;
  } else {
    return 1;
  }
});

const dayErrorsArray = computed(() => {
  return props.errorDays
    .filter((obj) => obj.error === true)
    .map((obj) => obj.title);
});

const currentDayObj = computed(() => {
  return props.days.find((day) => day.name === currentDayName.value);
});

const changeDay = (day) => {
  if (day.show) {
    currentDayName.value = day.name;
  }
  emits("updateDay", currentDayName.value);
};

const handleScroll = () => {
  let menuDays = document.getElementById("menu-days");
  if (document.body.contains(menuDays)) {
    let sticky = menuDays.offsetTop + 64;
    window.pageYOffset >= sticky
      ? menuDays.classList.add("sticky")
      : menuDays.classList.remove("sticky");
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  currentDayName.value = props.days.find(
    (day) => day.id === currentDay.value
  ).name;

  props.days.forEach((day) => {
    if (isClientMenu.value && day.id >= currentDay.value && day.id <= 7) {
      day.show = true;
    } else if (!isClientMenu.value) {
      day.show = true;
    }

    // if (currentDay.value === 1) {
    //   day.date = moment()
    //     .isoWeekday(day.id)
    //     .add(7, "days")
    //     .format("YYYY-MM-DD");
    // }

    if (
      (moment().isoWeekday() === 4 && isSwitchToNextDay.value) ||
      moment().isoWeekday() > 4
    ) {
      day.date = moment()
        .isoWeekday(day.id)
        .add(7, "days")
        .format("YYYY-MM-DD");
    }
  });
  emits("updateDay", currentDayName.value);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
<template>
  <div class="_container">
    <h1 class="menu-page__title">Menu</h1>
    <div class="menu-page__date">
      {{ moment(props.days[0].date).format("DD.MM") }} -
      {{ moment(props.days[5].date).format("DD.MM") }}
    </div>
    <div id="menu-days" class="menu-page__days">
      <ul>
        <li
          v-for="day in props.days"
          :key="day.id"
          :class="{
            active: day.name === currentDayName && day.show,
            disabled: !day.show,
            error: dayErrorsArray.includes(day.title),
          }"
          @click="changeDay(day)"
        >
          <span>{{ day.short }}</span>
        </li>
      </ul>
      <DayTotalPanel
        :current-day="currentDayObj"
        :total-macronutrients="totalMacronutrientByDays"
      />
    </div>
  </div>
</template>
