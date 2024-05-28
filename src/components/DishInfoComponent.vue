<script setup>
import { inject } from "vue";
import DishCount from "@/components/DishCountComponent.vue";
import DishAllergens from "@/components/DishAllergens.vue";
import { ref, watch, nextTick, computed } from "vue";
import usePriceCalculation from "@/composable/priceCalculation";
import useMacronutrientsCalculation from "@/composable/macronutrientsCalculation";
import useGlobalFunctions from "@/composable/globalFunctions";

const totalPrices = inject("totalPriceByDays");
const currentDay = inject("currentDay");

const props = defineProps({
  item: { type: Object, required: true },
});

const { getStartDishPriceByType, prices } = usePriceCalculation();
const { isClientMenu, isMenuOff } = useGlobalFunctions();
const { getCountOfMacronutrient } = useMacronutrientsCalculation();

const infoBox = ref(null);
const item = ref(props.item);
const baseUrl = import.meta.env.VITE_APP_BASE_URL;
const checkPhoto = false;
const isOpen = ref(false);

const totalPricesByDay = computed(() => {
  return totalPrices.value[currentDay.value.title];
});

const getPrices = computed(() => {
  let pricesObj = {
    oldPrice: 0,
    newPrice: 0,
  };
  const dishItemType = props.item.dish_type;
  if (!totalPricesByDay.value.allDishesCount) {
    pricesObj = {
      oldPrice: getStartDishPriceByType(dishItemType),
      newPrice: getStartDishPriceByType(dishItemType),
    };
  } else {
    if (totalPricesByDay.value.mainCount) {
      if (dishItemType === "main") {
        if (totalPricesByDay.value.mainCount === 1) {
          pricesObj = {
            oldPrice: prices.value.main_1,
            newPrice: prices.value.main_2,
          };
        } else {
          pricesObj = {
            oldPrice: prices.value.main_2,
            newPrice: prices.value.main_3,
          };
        }
      }

      if (dishItemType === "vegetarian") {
        pricesObj = {
          oldPrice: prices.value.vegetarian_1,
          newPrice: prices.value.vegetarian_2,
        };
      }

      if (dishItemType === "breakfast") {
        pricesObj = {
          oldPrice: prices.value.breakfast_1,
          newPrice: prices.value.breakfast_2,
        };
      }

      if (dishItemType === "side") {
        pricesObj = {
          oldPrice: prices.value.side_1,
          newPrice: prices.value.side_1,
        };
      }
    } else if (totalPricesByDay.value.vegetariansCount) {
      if (dishItemType === "main") {
        pricesObj = {
          oldPrice: prices.value.main_1,
          newPrice: prices.value.main_1,
        };
      }

      if (dishItemType === "vegetarian") {
        pricesObj = {
          oldPrice: prices.value.vegetarian_1,
          newPrice: prices.value.vegetarian_2,
        };
      }

      if (dishItemType === "breakfast") {
        pricesObj = {
          oldPrice: prices.value.breakfast_1,
          newPrice: prices.value.breakfast_2,
        };
      }

      if (dishItemType === "side") {
        pricesObj = {
          oldPrice: prices.value.side_1,
          newPrice: prices.value.side_1,
        };
      }
    } else if (totalPricesByDay.value.breakfastsCount) {
      if (dishItemType === "main") {
        pricesObj = {
          oldPrice: prices.value.main_1,
          newPrice: prices.value.main_1,
        };
      }

      if (dishItemType === "vegetarian") {
        pricesObj = {
          oldPrice: prices.value.vegetarian_1,
          newPrice: prices.value.vegetarian_1,
        };
      }

      if (dishItemType === "breakfast") {
        pricesObj = {
          oldPrice: prices.value.breakfast_1,
          newPrice: prices.value.breakfast_2,
        };
      }
      if (dishItemType === "side") {
        pricesObj = {
          oldPrice: prices.value.side_1,
          newPrice: prices.value.side_1,
        };
      }
    } else if (totalPricesByDay.value.sidesCount) {
      if (dishItemType === "main") {
        pricesObj = {
          oldPrice: prices.value.main_1,
          newPrice: prices.value.main_1,
        };
      }

      if (dishItemType === "vegetarian") {
        pricesObj = {
          oldPrice: prices.value.vegetarian_1,
          newPrice: prices.value.vegetarian_1,
        };
      }

      if (dishItemType === "breakfast") {
        pricesObj = {
          oldPrice: prices.value.breakfast_1,
          newPrice: prices.value.breakfast_1,
        };
      }

      if (dishItemType === "side") {
        pricesObj = {
          oldPrice: prices.value.side_1,
          newPrice: prices.value.side_2,
        };
      }
    }

    if (totalPricesByDay.value.sidesCount) {
      if (dishItemType === "side") {
        pricesObj = {
          oldPrice: prices.value.side_1,
          newPrice: prices.value.side_2,
        };
      }
    }
  }

  return pricesObj;
});

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
    <div class="dish__title" :data-dish-id="item.id">{{ item.name }}</div>
    <div
      :style="'background-image: url(' + getPhoto(item.photos) + ')'"
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
      <DishCount v-if="isClientMenu && !isMenuOff" v-model="item.count" />
      <div v-if="isClientMenu && !isMenuOff" class="dish__price">
        <div
          v-if="
            !totalPricesByDay.allDishesCount ||
            getPrices.newPrice !== getPrices.oldPrice
          "
          :class="{ 'line-through': totalPricesByDay.allDishesCount }"
        >
          € {{ getPrices.oldPrice }}
        </div>
        <div v-if="totalPricesByDay.allDishesCount">
          € {{ getPrices.newPrice }}
        </div>
      </div>
      <div class="dish__info-btn" @click="isOpen = !isOpen">
        <img src="@/assets/img/icons/info.svg" alt="info" />
      </div>
    </div>
  </div>
</template>
