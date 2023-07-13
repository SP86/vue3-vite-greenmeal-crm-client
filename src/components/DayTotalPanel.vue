<script setup>
import { computed } from "vue";
const props = defineProps({
  totalPrice: {
    type: Number,
    default: () => 0,
  },
  currentDay: {
    type: Object,
  },
  totalMacronutrients: {
    type: Object,
  },
});

const totalCaloriesByDay = computed(() => {
  return props.currentDay?.title &&
    props.totalMacronutrients[props.currentDay.title]?.totalCalories
    ? props.totalMacronutrients[props.currentDay.title].totalCalories
    : 0;
});

const totalProteinsByDay = computed(() => {
  return props.currentDay?.title &&
    props.totalMacronutrients[props.currentDay.title]?.totalProteins
    ? props.totalMacronutrients[props.currentDay.title].totalProteins
    : 0;
});

const totalFatsByDay = computed(() => {
  return props.currentDay?.title &&
    props.totalMacronutrients[props.currentDay.title]?.totalFats
    ? props.totalMacronutrients[props.currentDay.title].totalFats
    : 0;
});

const totalСarbohydratesByDay = computed(() => {
  return props.currentDay?.title &&
    props.totalMacronutrients[props.currentDay.title]?.totalСarbohydrates
    ? props.totalMacronutrients[props.currentDay.title].totalСarbohydrates
    : 0;
});
</script>

<template>
  <div class="day-total-card">
    <div class="day-total-card__title">
      Total <span v-if="currentDay?.short">({{ currentDay.short }}):</span>
    </div>
    <ul>
      <li>
        <span>{{ totalCaloriesByDay }}</span>
        <span>kcal</span>
      </li>
      <li>
        <span>{{ totalProteinsByDay }}</span>
        <span>prots</span>
      </li>
      <li>
        <span>{{ totalFatsByDay }}</span>
        <span>fats</span>
      </li>
      <li>
        <span>{{ totalСarbohydratesByDay }} </span>
        <span>carbs</span>
      </li>
      <li class="_total">
        <span>{{ totalPrice }}</span>
        <i>€</i>
      </li>
    </ul>
  </div>
</template>
