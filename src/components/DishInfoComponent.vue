<script setup>
import DishCount from "@/components/DishCountComponent.vue";
import DishAllergens from "@/components/DishAllergens.vue";
import { ref, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import useMacronutrientsCalculation from "@/composable/macronutrientsCalculation";

const props = defineProps({
  item: { type: Object, required: true },
});

const { getCountOfMacronutrient } = useMacronutrientsCalculation();

const route = useRoute();
const infoBox = ref(null);
const item = ref(props.item);
const baseUrl = import.meta.env.VITE_APP_BASE_URL;
const checkPhoto = false;
const isOpen = ref(false);

const getPhoto = (photo) => {
  if (photo === null || photo === "null") {
    return "img/no-photo-dish.png";
  } else {
    if (checkPhoto) {
      const photoFullUrl =
        baseUrl +
        "storage/dishes/" +
        photo.replace(/[\[\]']+/g, "").replace(/^"(.+)"$/, "$1");
      let image = doesFileExist(photoFullUrl);
      if (image) {
        return photoFullUrl;
      } else {
        return "img/no-photo-dish.png";
      }
    } else {
      return (
        baseUrl +
        "storage/dishes/" +
        photo.replace(/[\[\]']+/g, "").replace(/^"(.+)"$/, "$1")
      );
    }
  }
};

const doesFileExist = (urlToFile) => {
  // console.log("doesFileExist");
  let xhr = new XMLHttpRequest();
  xhr.open("HEAD", urlToFile, false);
  xhr.send();

  if (xhr.status == "404") {
    return false;
  } else {
    return true;
  }
};

watch(isOpen, async () => {
  await nextTick(() => isOpen.value && infoBox.value.focus());
});
</script>
<template>
  <div>
    <div class="dish__title">{{ item.name }}</div>
    <div
      :style="'background: url(' + getPhoto(item.photos) + ')'"
      class="dish__body"
      :class="{ dish__body_active: isOpen }"
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
        <DishAllergens
          :allergens="item.allergens"
          class="dish__allergens_desktop"
        />
      </div>
      <DishAllergens
        :allergens="item.allergens"
        class="dish__allergens_mobile"
      />
    </div>
    <div class="dish__macronutrients macronutrients">
      <div class="macronutrients__item">
        <div class="macronutrients__label">kcal</div>
        <div class="macronutrients__value">
          {{ getCountOfMacronutrient(item.calories, item.dish_count) }}
        </div>
      </div>
      <div class="macronutrients__item">
        <div class="macronutrients__label">prots</div>
        <div class="macronutrients__value">
          {{ getCountOfMacronutrient(item.proteins, item.dish_count) }}
        </div>
      </div>
      <div class="macronutrients__item">
        <div class="macronutrients__label">fats</div>
        <div class="macronutrients__value">
          {{ getCountOfMacronutrient(item.fats, item.dish_count) }}
        </div>
      </div>
      <div class="macronutrients__item">
        <div class="macronutrients__label">carbs</div>
        <div class="macronutrients__value">
          {{ getCountOfMacronutrient(item.carbohydrates, item.dish_count) }}
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
