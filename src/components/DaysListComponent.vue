<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import moment from "moment";
import DayTotalPanel from "@/components/DayTotalPanel.vue";
import OrderDeadlinePanel from "@/components/OrderDeadlinePanel.vue";
import useDatesCalculation from "@/composable/datesCalculation";
import useGlobalFunctions from "@/composable/globalFunctions";

const props = defineProps({
  days: { type: Object, required: true },
  errorDays: { type: Object, required: false },
  totalPrice: { type: [Number, String], required: false },
  totalMacronutrientByDays: { type: Object, required: true },
  clientName: { type: [String, null], required: false },
});

const currentDayName = ref("");
const { currentIsoWeekday, isOwer11Pm } = useDatesCalculation();
const { isClientMenu } = useGlobalFunctions();

const emits = defineEmits(["updateDay"]);

const currentDay = computed(() => {
  let day = currentIsoWeekday.value;
  if (!isClientMenu.value) {
    return 1;
  }

  if (day === 4) {
    return !isOwer11Pm.value ? day + 1 : 1;
  } else if (day === 5 || day === 6) {
    return 1;
  } else if (day === 7) {
    return !isOwer11Pm.value ? 1 : 2;
  } else {
    return !isOwer11Pm.value ? day + 1 : day + 2;
  }

  // if (day < 4) {
  //   return !isOwer11Pm.value ? day + 1 : day + 2;
  // } else if (day === 4) {
  //   return !isOwer11Pm.value ? day + 1 : 1;
  // } else if (day === 7) {
  //   return !isOwer11Pm.value ? 1 : 2;
  // } else {
  //   return 1;
  // }
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

    if (
      (currentIsoWeekday.value === 4 && isOwer11Pm.value) ||
      currentIsoWeekday.value > 4
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
    <div v-if="clientName" class="menu-page__client-name">
      Hello, {{ clientName }}
    </div>
    <h1 class="menu-page__title">Menu</h1>
    <div id="menu-days" class="menu-page__days">
      <ul class="days-list">
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
          <span>{{ moment(day.date).format("DD") }}</span>
          <span>{{ day.short }}</span>
        </li>
      </ul>
      <DayTotalPanel
        :current-day="currentDayObj"
        :total-macronutrients="totalMacronutrientByDays"
      />
    </div>
    <OrderDeadlinePanel />
  </div>
</template>
