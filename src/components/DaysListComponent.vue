<script setup>
import moment from "moment";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const currentDayName = ref("");

const props = defineProps({
  days: { type: Object, required: true },
});

const emits = defineEmits(["updateDay"]);

const currentDay = computed(() => {
  let current;
  moment().isoWeekday() > 4
    ? (current = 1)
    : (current = moment().isoWeekday() + 1);
  return current;
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
    if (route.params.userId && day.id >= currentDay.value && day.id < 7) {
      day.show = true;
    } else if (!route.params.userId) {
      day.show = true;
    }

    if (currentDay.value === 1) {
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
    <ul class="menu-page__days" id="menu-days">
      <li
        v-for="day in props.days"
        :key="day.id"
        :class="{
          active: day.name === currentDayName && day.show,
          disabled: !day.show,
        }"
        @click="changeDay(day)"
      >
        <span>{{ day.short }}</span>
      </li>
    </ul>
  </div>
</template>
