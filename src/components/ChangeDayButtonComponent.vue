<script setup>
import { ref } from "vue";
const props = defineProps({
  modelValue: {
    type: Number,
  },
  type: {
    type: String,
  },
});
const counter = ref(props.modelValue);
const type = ref(props.type);

const emits = defineEmits(["update:modelValue", "changeCount"]);

const changeCounter = () => {
  counter.value -= 1;
  emits("update:modelValue", counter.value);
  emits("changeCount");
};
</script>
<template>
  <button
    class="change-day-btn"
    :class="[type === 'next' ? 'change-day-btn_next' : 'change-day-btn_prev']"
    @click="changeCounter"
  ></button>
</template>
