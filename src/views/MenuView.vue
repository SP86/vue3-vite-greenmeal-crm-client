<script setup>
import DaysListComponent from "@/components/DaysListComponent.vue";
import DayTotalPanel from "@/components/DayTotalPanel.vue";
import DishSlider from "@/components/DishSliderComponent.vue";
import Order from "@/components/OrderComponent.vue";

import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

import usePriceCalculation from "@/composable/priceCalculation";
import useMacronutrientsCalculation from "@/composable/macronutrientsCalculation";
import { DAYS } from "../constants.js";

const route = useRoute();
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

const menuPage = ref(true);
const days = DAYS;
const currentDayName = ref("");
const menuItems = ref({});
const orderItems = ref([]);

const fixedPanel = ref(null);
const orderButton = ref(null);

const getCurrentDayName = computed(() => {
  return days.find((day) => {
    return day.name === currentDayName.value;
  });
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

const setProgram = (program) => {
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
          sides: item.dishes.sides,
          four: item.dishes.four,
        };
        return obj;
      }, {});

    dishesObj = arrayToObject(dishes);
  }

  return dishesObj;
};

const setDishesByDishMeal = (menuDishes) => {
  let breakfast = [];
  let dinner = [];
  let sides = [];
  let four = [];
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
    };
    if (menuDishesItem.dish_meal > 0 && menuDishesItem.dish_meal <= 5) {
      breakfast.push(dishItem);
    } else if (menuDishesItem.dish_meal > 5 && menuDishesItem.dish_meal <= 10) {
      dinner.push(dishItem);
    } else if (
      menuDishesItem.dish_meal > 10 &&
      menuDishesItem.dish_meal <= 15
    ) {
      sides.push(dishItem);
    } else if (menuDishesItem.dish_meal > 15) {
      four.push(dishItem);
    }
  });

  const dishesByType = {
    breakfast: breakfast,
    dinner: dinner,
    sides: sides,
    four: four,
  };

  return dishesByType;
};

const setDishesAfterChanges = (dishes) => {
  let breakfast = [];
  let dinner = [];
  let sides = [];
  let four = [];
  dishes.forEach((newDish) => {
    let dishItem = {
      id: newDish.dish_id,
      name: newDish.dish_name,
      photos: newDish.photos,
      calories: null,
      carbohydrates: null,
      fats: null,
      proteins: null,
      allergens: newDish.allergens,
      count: newDish.quantity,
      dish_meal: newDish.dish_meal,
      dish_type: setDishTypeByMealType(newDish.dish_meal),
      dish_count: newDish.dish_count,
      menu_dish_id: newDish.menu_dish_id,
      ingredients_description: newDish.ingredients_description,
    };
    if (newDish.dish_meal > 0 && newDish.dish_meal <= 5) {
      breakfast.push(dishItem);
    } else if (newDish.dish_meal > 5 && newDish.dish_meal <= 10) {
      dinner.push(dishItem);
    } else if (newDish.dish_meal > 10 && newDish.dish_meal <= 15) {
      sides.push(dishItem);
    } else if (newDish.dish_meal > 15) {
      four.push(dishItem);
    }
  });

  const dishesByType = {
    breakfast: breakfast,
    dinner: dinner,
    sides: sides,
    four: four,
  };

  return dishesByType;
};

const showOrderPage = () => {
  let dishes = [];
  days.forEach((day) => {
    let groups = ["breakfast", "dinner", "sides", "four"];
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

  orderItems.value = dishes;
  menuPage.value = !menuPage.value;
  window.scrollTo(0, 0);
};

const changeDishesCountInMenu = (day, dishesFromOrder, dishType) => {
  menuItems.value[day][dishType].forEach((item, index) => {
    item.count = 0;
    const findItem = dishesFromOrder[day][dishType].find(
      (dish) => dish.id === item.id
    );
    if (findItem) {
      menuItems.value[day][dishType][index].count = findItem.count;
    }
  });
};

const showMenuPage = async (dishesFromOrder) => {
  const menuFromOrder = await dishesFromOrder.reduce(
    (acc, cur) => ({
      ...acc,
      [cur.dayName]: setDishesAfterChanges(cur.dishes),
    }),
    {}
  );

  days.forEach((day) => {
    const dishTypes = ["breakfast", "dinner", "four", "sides"];
    dishTypes.forEach((type) => {
      changeDishesCountInMenu(day.name, menuFromOrder, type);
    });
  });

  menuPage.value = !menuPage.value;
  window.scrollTo(0, 0);
};

watch(
  () => menuItems.value,
  (menu) => {
    const dishesByDays = createDishesArrayByDays(menu);
    macronutrientsDishesByDays.value = dishesByDays;
  },
  {
    deep: true,
    immediate: true,
  }
);

const pageHeight = computed(() => {
  return window.innerHeight;
});

onMounted(async () => {
  try {
    const { data: response } = await axios.get(
      route.params.userId ? apiUrl + route.params.userId : apiUrl + menuAlias
    );
    const { data: programData } = response;
    menuItems.value = setProgram(programData);
    // console.log(programData, "programData");
  } catch (e) {
    console.log(e);
  }
});

function handleScroll() {
  window.addEventListener("scroll", () => {
    if (!menuPage.value) return;
    const buttonPosition = orderButton.value.getBoundingClientRect().top - 50;
    if (buttonPosition < pageHeight.value) {
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
  <div v-if="menuPage">
    <div class="menu-page">
      <div class="menu-page__header" id="menu-header">
        <DaysListComponent
          :days="days"
          :error-days="errorDays"
          :total-price="totalPrice"
          @update-day="currentDayName = $event"
          :total-macronutrient-by-days="totalMacronutrientByDays"
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
          v-if="menuItems[currentDayName].dinner.length"
          class="menu-page__body _container"
        >
          <h2 class="menu-page__subtitle">Main dishes</h2>
          <DishSlider
            :dishes="menuItems[currentDayName].dinner"
            :key="'dinner_' + currentDayName"
          />
        </div>

        <div
          v-if="menuItems[currentDayName].sides.length"
          class="menu-page__body _container"
        >
          <h2 class="menu-page__subtitle">Sides</h2>
          <DishSlider
            :dishes="menuItems[currentDayName].sides"
            :key="'sides_' + currentDayName"
          />
        </div>

        <div
          v-if="menuItems[currentDayName].four.length"
          class="menu-page__body _container"
        >
          <h2 class="menu-page__subtitle">Vegetarian dishes</h2>
          <DishSlider
            :dishes="menuItems[currentDayName].four"
            :key="'four_' + currentDayName"
          />
        </div>
      </div>
      <DayTotalPanel
        v-if="route.params.userId && getCurrentDayName?.short"
        class="menu-page__day-total"
        :total-price="getTotalDayPrice"
        :current-day="getCurrentDayName"
        :total-macronutrients="totalMacronutrientByDays"
      />
    </div>
    <div class="fixed-total-panel" v-show="totalPrice" ref="fixedPanel">
      Total: € {{ Math.floor(totalPrice * 100) / 100 }}
    </div>
    <div
      v-show="menuItems[currentDayName]"
      class="order-page__body menu-page__order-btn"
    >
      <div class="order-page__buttons">
        <button
          ref="orderButton"
          v-show="route.params.userId"
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
    <Order
      :items="orderItems"
      :days="days"
      @order-change="showMenuPage($event)"
    />
  </div>
</template>
