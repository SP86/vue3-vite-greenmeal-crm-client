<script setup>
import { computed, onMounted } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
  },
  orderId: {
    type: Number,
  },
  pdfLink: {
    type: String,
  },
});

const emits = defineEmits(["update:modelValue"]);

const baseUrl = import.meta.env.VITE_APP_BASE_URL;

const propModel = computed({
  get: function () {
    return props.modelValue;
  },
  set: function (e) {
    emits("update:modelValue", e);
  },
});

const closeModal = () => {
  propModel.value = !propModel.value;
};

onMounted(() => {
  document.addEventListener("keydown", function (t) {
    "Escape" === t.key && closeModal();
  });
});
</script>
<template>
  <div class="modal">
    <div class="modal__inner success-modal">
      <div class="success-modal__title">Thank you!</div>
      <div class="success-modal__msg">
        Your order is in progress. We'll send it soon.
      </div>
      <div class="success-modal__buttons-wrap">
        <a
          :href="baseUrl + '/storage/' + pdfLink"
          target="_blank"
          class="button button--success _fw"
        >
          <span>.PDF</span>
        </a>
        <button
          type="button"
          class="button button--default _fw"
          @click="closeModal"
        >
          <span>Close</span>
        </button>
      </div>
    </div>
  </div>
</template>
