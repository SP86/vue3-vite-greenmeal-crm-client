<script setup>
import { ref } from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
  },
});

const emits = defineEmits(["update:modelValue", "changeCount"]);

const counter = ref(props.modelValue);

const changeCounter = (num) => {
  counter.value += +num;
  !isNaN(counter.value) && counter.value > 0
    ? counter.value
    : (counter.value = 0);
  emits("update:modelValue", counter.value);
  emits("changeCount");
};
</script>
<template>
  <div class="dish__counter">
    <button
      class="btn btn--minus"
      @click="changeCounter('-1')"
      type="button"
      name="button"
    >
      <img src="@/assets/img/icons/minus.svg" />
    </button>
    <input
      class="dish-quantity"
      type="text"
      readonly="readonly"
      name="name"
      :value="counter"
    />
    <button
      class="btn btn--plus"
      @click="changeCounter('1')"
      type="button"
      name="button"
    >
      <img src="@/assets/img/icons/plus.svg" />
    </button>
  </div>
</template>
