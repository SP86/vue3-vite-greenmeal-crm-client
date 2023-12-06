<script setup>
import { reactive, computed, watch } from "vue";
import useDatesCalculation from "@/composable/datesCalculation";
const { remainingOrderTime } = useDatesCalculation();
</script>
<template>
  <div v-if="remainingOrderTime?.fullDayOfWeek" class="deadline-panel">
    <div class="deadline-panel__title">
      <span class="deadline-panel__full-day">{{
        remainingOrderTime.fullDayOfWeek
      }}</span>
      order deadline
    </div>
    <div
      class="deadline-panel__time"
      :class="{ 'deadline-panel__time_danger': remainingOrderTime.hours < 3 }"
    >
      <div v-if="remainingOrderTime.hours > 0">
        {{
          `${remainingOrderTime.hours} : ${remainingOrderTime.minutesFormatted}`
        }}
      </div>
      <div v-else>{{ remainingOrderTime.minutes }} min.</div>
    </div>
  </div>
</template>
