<script setup>
import DishCount from "@/components/DishCountComponent.vue";
import { ref, watch, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  item: { type: Object, required: true },
});

const route = useRoute();
const infoBox = ref(null);
const item = ref(props.item);
const baseUrl = import.meta.env.VITE_APP_BASE_URL;
const isOpen = ref(false);

const checkIcon = (alergents, val) => {
  return alergents.includes(val);
};

const getPhoto = (photo) => {
  if (photo === null || photo === "null") {
    return "@/assets/img/no-photo-dish.png";
  } else {
    return (
      baseUrl +
      "storage/dishes/" +
      photo.replace(/[\[\]']+/g, "").replace(/^"(.+)"$/, "$1")
    );
  }
};

watch(isOpen, async () => {
  await nextTick(() => isOpen.value && infoBox.value.focus());
});

onMounted(() => {
  //   console.log("onMounted Info");
  //   window.addEventListener("click", (event) => {
  //     if (!this.$el.contains(event.target)) {
  //       isOpen.value = false;
  //     }
  //   });
});
</script>
<template>
  <div>
    <div class="dish__title">{{ item.name }}</div>
    <div
      :style="'background: url(' + getPhoto(item.photos) + ')'"
      class="dish__body"
    >
      <div
        ref="infoBox"
        class="dish__info"
        tabindex="-1"
        @keydown.esc="isOpen = false"
        :class="{ dish__info_active: isOpen }"
      >
        <div class="dish__desc">
          {{ item.ingredients_description.replace(/<\/?[^>]+(>|$)/g, "") }}
        </div>
        <div class="dish__icons">
          <img
            src="@/assets/img/icons/dairy.png"
            alt="dairy"
            :class="[
              item.allergens && checkIcon(item.allergens, 'dairy') && '_active',
            ]"
          />
          <img
            src="@/assets/img/icons/seafood.png"
            alt="seafood"
            :class="[
              item.allergens &&
                checkIcon(item.allergens, 'seafood') &&
                '_active',
            ]"
          />
          <img
            src="@/assets/img/icons/nuts.png"
            alt="nuts"
            :class="[
              item.allergens && checkIcon(item.allergens, 'nuts') && '_active',
            ]"
          />
          <img
            src="@/assets/img/icons/spicy.png"
            alt="spicy"
            :class="[
              item.allergens && checkIcon(item.allergens, 'spicy') && '_active',
            ]"
          />
          <img
            src="@/assets/img/icons/gluten.png"
            alt="gluten"
            :class="[
              item.allergens &&
                checkIcon(item.allergens, 'gluten') &&
                '_active',
            ]"
          />
          <img
            src="@/assets/img/icons/meat.png"
            alt="meat"
            :class="[
              item.allergens && checkIcon(item.allergens, 'meat') && '_active',
            ]"
          />
        </div>
      </div>
    </div>
    <div class="dish__actions">
      <DishCount v-if="route.params.userId" v-model="item.count" />
      <div class="dish__info-btn" @click="isOpen = !isOpen">
        <img src="@/assets/img/icons/info.svg" alt="info" />
      </div>
    </div>
  </div>
</template>
