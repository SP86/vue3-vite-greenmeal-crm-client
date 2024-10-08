<script setup>
import DaysListComponent from "@/components/DaysListComponent.vue";
import DayTotalPanel from "@/components/DayTotalPanel.vue";
import OrderDeadlinePanel from "@/components/OrderDeadlinePanel.vue";
import DishSlider from "@/components/DishSliderComponent.vue";
import Order from "@/components/OrderComponent.vue";
import Popup from "@/components/PopupComponent.vue";
import useGlobalFunctions from "@/composable/globalFunctions";

import { ref, computed, watch, onMounted, provide, watchEffect } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { usePricesStore } from "@/stores/prices";
import { useOrderStore } from "@/stores/order";

import usePriceCalculation from "@/composable/priceCalculation";
import useMacronutrientsCalculation from "@/composable/macronutrientsCalculation";
import { DAYS, TEST_PROGRAM_DATA } from "../constants.js";
const { isMenuOff } = useGlobalFunctions();

const route = useRoute();
const pricesStore = usePricesStore();
const orderStore = useOrderStore();

const {
  totalPrice,
  totalPriceByDays,
  setDishTypeByMealType,
  createDishesArrayByDays,
  activeOrderBtn,
  errorDays,
} = usePriceCalculation();

const { macronutrientsDishesByDays, totalMacronutrientByDays } =
  useMacronutrientsCalculation();

const apiUrl = import.meta.env.VITE_APP_API_URL;
const menuAlias = import.meta.env.VITE_MENU_ALIAS;

provide("totalPriceByDays", totalPriceByDays);

const responceData = ref({});
const menuPage = ref(true);
const days = DAYS;
const currentDayName = ref("");
const menuItems = ref({});
const isShowPopup = ref(false);

const fixedPanel = ref(null);
const orderButton = ref(null);

const isMenuPageActive = computed(() => {
  return !orderStore.isOrderPageActive;
});

const getCurrentDayName = computed(() => {
  return days.find((day) => {
    return day.name === currentDayName.value;
  });
});

provide("currentDay", getCurrentDayName);

const getClientName = computed(() => {
  return responceData.value?.client?.full_name;
});

const getTotalDayPrice = computed(() => {
  let totalByDay = 0;
  if (getCurrentDayName.value) {
    if (totalPriceByDays.value) {
      totalByDay = totalPriceByDays.value[getCurrentDayName.value.title];
    }
  }
  return totalByDay?.total ? totalByDay.total : 0;
});

//TODO add actual days (dates) to get them in to createDishesArrayByDays
const showOrderPage = () => {
  // orderStore.setItemsToOrder(createDishesArrayByDays(menuItems.value));

  let dishes = [];
  days.forEach((day) => {
    let groups = ["breakfast", "dinner", "plain", "sides", "four"];
    if (menuItems.value[day.name]) {
      let dayDishesArray = [];

      groups.forEach(function (group) {
        if (menuItems.value[day.name]?.[group]) {
          menuItems.value[day.name][group].forEach((item) => {
            if (item.count > 0) {
              let dishObj = {
                dish_id: item.id,
                dish_name: item.name,
                quantity: item.count,
                photos: item.photos,
                calories: item.calories,
                carbohydrates: item.carbohydrates,
                fats: item.fats,
                proteins: item.proteins,
                dish_meal: item.dish_meal,
                dish_type: setDishTypeByMealType(item.dish_meal),
                dish_count: item.dish_count,
                menu_dish_id: item.menu_dish_id,
                allergens: item.allergens,
                ingredients_description: item.ingredients_description,
                label: item.label,
                next_day: false,
                previous_day: false,
              };
              dayDishesArray.push(dishObj);
            }
          });
        }
      });

      let dayObj = {
        day: day.title,
        dayName: day.name,
        date: day.date,
        dishes: dayDishesArray,
      };
      dishes.push(dayObj);
    }
  });

  orderStore.setItemsToOrder(dishes);
  orderStore.setOrderPageState(true);
  window.scrollTo(0, 0);
};

const showMenuPage = async () => {
  menuItems.value = {};
  orderStore.setOrderPageState(false);
  orderStore.clearOrderItems();
  await fetchMenuData();
  window.scrollTo(0, 0);
};

watch(
  () => menuItems.value,
  (menu) => {
    // console.log(menu, "menu");
    const dishesByDays = createDishesArrayByDays(menu);
    macronutrientsDishesByDays.value = dishesByDays;
  },
  {
    deep: true,
    immediate: true,
  }
);

const fetchPrices = async () => {
  if (route.params.userId) {
    await pricesStore.fetchPrices(route.params.userId);
  }
};

const fetchMenuData = async () => {
  await fetchPrices();
  try {
    const { data: response } = await axios.get(
      route.params.userId ? apiUrl + route.params.userId : apiUrl + menuAlias
    );
    const { data: programData } = response;

    // const programData = TEST_PROGRAM_DATA;

    menuItems.value = setProgram(programData);
    responceData.value = programData;
    // console.log(programData, "programData");
  } catch (e) {
    console.log(e);
  }
};

onMounted(async () => {
  await fetchMenuData();
});

function setProgram(program) {
  let dishes = [];
  let dishesObj = {};
  if (program?.id) {
    days.forEach((day) => {
      if (program[day.name]) {
        let dishArray = [];
        dishArray = setDishesByDishMeal(program[day.name]["menu_dishes"]);
        dishes.push({
          menuTitle: day.name,
          dishes: dishArray,
        });
      }
    });

    const arrayToObject = (array) =>
      array.reduce((obj, item) => {
        obj[item.menuTitle] = {
          breakfast: item.dishes.breakfast,
          dinner: item.dishes.dinner,
          plain: item.dishes.plain,
          sides: item.dishes.sides,
          four: item.dishes.four,
        };
        return obj;
      }, {});

    dishesObj = arrayToObject(dishes);
  }

  return dishesObj;
}

function setDishesByDishMeal(menuDishes) {
  let breakfast = [];
  let dinner = [];
  let sides = [];
  let four = [];
  let plain = [];
  menuDishes.forEach((menuDishesItem) => {
    let dishItem = {
      id: menuDishesItem.dish.id,
      name: menuDishesItem.dish.name,
      photos: menuDishesItem.dish.photos,
      calories: menuDishesItem.dish.calories,
      carbohydrates: menuDishesItem.dish.carbohydrates,
      fats: menuDishesItem.dish.fats,
      proteins: menuDishesItem.dish.proteins,
      allergens: menuDishesItem.dish.allergens,
      count: 0,
      dish_meal: menuDishesItem.dish_meal,
      dish_type: setDishTypeByMealType(menuDishesItem.dish_meal),
      dish_count: menuDishesItem.dish_count,
      menu_dish_id: menuDishesItem.id,
      ingredients_description: menuDishesItem.dish.ingredients_description,
      label: menuDishesItem.dish.label,
    };
    if (menuDishesItem.dish_meal > 0 && menuDishesItem.dish_meal <= 9) {
      breakfast.push(dishItem);
    } else if (menuDishesItem.dish_meal > 9 && menuDishesItem.dish_meal <= 19) {
      dinner.push(dishItem);
    } else if (
      menuDishesItem.dish_meal > 19 &&
      menuDishesItem.dish_meal <= 29
    ) {
      plain.push(dishItem);
    } else if (
      menuDishesItem.dish_meal > 29 &&
      menuDishesItem.dish_meal <= 39
    ) {
      sides.push(dishItem);
    } else if (menuDishesItem.dish_meal > 39) {
      four.push(dishItem);
    }
  });

  const dishesByType = {
    breakfast: breakfast,
    dinner: dinner,
    sides: sides,
    four: four,
    plain: plain,
  };

  return dishesByType;
}

const pageHeight = computed(() => {
  return window.innerHeight;
});

function handleScroll() {
  window.addEventListener("scroll", () => {
    const menuDays = document.getElementById("menu-days");
    const buttonPosition = orderButton.value.getBoundingClientRect().top - 50;
    const stickyPosition = menuDays.getBoundingClientRect().top - 64;
    if (!menuPage.value || !document.body.contains(menuDays)) return;
    if (buttonPosition < pageHeight.value || stickyPosition > -64) {
      fixedPanel.value.classList.remove("_show");
    } else {
      fixedPanel.value.classList.add("_show");
    }
  });
}

function handleResize() {
  handleScroll();
}

window.onload = () => handleResize();
window.onresize = () => handleResize();
</script>

<template>
  <div v-if="isMenuPageActive">
    <div class="menu-page">
      <div class="menu-page__header" id="menu-header">
        <DaysListComponent
          :days="days"
          :error-days="errorDays"
          :total-price="totalPrice"
          @update-day="currentDayName = $event"
          :total-macronutrient-by-days="totalMacronutrientByDays"
          :client-name="getClientName"
        />
      </div>
      <div v-if="menuItems[currentDayName]" class="menu-page__wrap">
        <div
          v-if="menuItems[currentDayName].breakfast.length"
          class="menu-page__body _container"
        >
          <!-- {{ menuItems }} -->
          <h2 class="menu-page__subtitle">Breakfast</h2>
          <DishSlider
            :dishes="menuItems[currentDayName].breakfast"
            :key="'breakfast_' + currentDayName"
          />
        </div>

        <div
          v-if="
            menuItems[currentDayName]?.dinner &&
            menuItems[currentDayName].dinner.length
          "
          class="menu-page__body _container"
        >
          <h2 class="menu-page__subtitle">Main dishes</h2>
          <DishSlider
            :dishes="menuItems[currentDayName].dinner"
            :key="'dinner_' + currentDayName"
          />
        </div>

        <div
          v-if="
            menuItems[currentDayName]?.plain &&
            menuItems[currentDayName].plain.length
          "
          class="menu-page__body _container"
        >
          <h2 class="menu-page__subtitle">Plain meals</h2>
          <DishSlider
            :dishes="menuItems[currentDayName].plain"
            :key="'plain_' + currentDayName"
          />
        </div>

        <div
          v-if="
            menuItems[currentDayName]?.sides &&
            menuItems[currentDayName].sides.length
          "
          class="menu-page__body _container"
        >
          <h2 class="menu-page__subtitle">Sides</h2>
          <DishSlider
            :dishes="menuItems[currentDayName].sides"
            :key="'sides_' + currentDayName"
          />
        </div>

        <div
          v-if="
            menuItems[currentDayName]?.four &&
            menuItems[currentDayName].four.length
          "
          class="menu-page__body _container"
        >
          <h2 class="menu-page__subtitle">Vegetarian dishes</h2>
          <DishSlider
            :dishes="menuItems[currentDayName].four"
            :key="'four_' + currentDayName"
          />
        </div>
      </div>
      <div class="fixed-sidebar fixed-sidebar_right" v-if="route.params.userId">
        <OrderDeadlinePanel v-show="!isMenuOff" />
        <DayTotalPanel
          v-if="getCurrentDayName?.short"
          class="menu-page__day-total"
          :total-price="getTotalDayPrice"
          :current-day="getCurrentDayName"
          :total-macronutrients="totalMacronutrientByDays"
        />
      </div>
    </div>
    <div class="fixed-total-panel" ref="fixedPanel">
      <OrderDeadlinePanel />
      <div v-show="totalPrice">
        Total: € {{ Math.floor(totalPrice * 100) / 100 }}
      </div>
    </div>
    <div
      v-show="menuItems[currentDayName]"
      class="order-page__body menu-page__order-btn"
    >
      <div class="order-page__buttons">
        <button
          ref="orderButton"
          v-show="route.params.userId && !isMenuOff"
          :disabled="!activeOrderBtn"
          type="button"
          class="button button--success _fw"
          @click="showOrderPage"
        >
          <span>Order | Total: € {{ Math.floor(totalPrice * 100) / 100 }}</span>
        </button>
      </div>
    </div>
  </div>
  <div v-else>
    <Order :days="days" @order-change="showMenuPage()" />
  </div>
  <Popup v-if="isShowPopup" v-model="isShowPopup">
    <template #title>Happy New Year!</template>
    <template #content>
      <p>The first delivery day is Wednesday, January 3</p>
    </template>
  </Popup>
</template>
