<script setup>
import DaysListComponent from "@/components/DaysListComponent.vue";
import DishSlider from "@/components/DishSliderComponent.vue";
import Order from "@/components/OrderComponent.vue";

import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import moment from "moment";

const route = useRoute();

const apiUrl = import.meta.env.VITE_APP_API_URL;
const menuAlias = import.meta.env.VITE_MENU_ALIAS;

const menuPage = ref(true);
const days = [
  {
    id: 1,
    name: "menu_for_monday",
    short: "Mo",
    title: "Monday",
    date: moment().isoWeekday(1).format("YYYY-MM-DD"),
    show: false,
  },
  {
    id: 2,
    name: "menu_for_tuesday",
    short: "Tu",
    title: "Tuesday",
    date: moment().isoWeekday(2).format("YYYY-MM-DD"),
    show: false,
  },
  {
    id: 3,
    name: "menu_for_wednesday",
    short: "We",
    title: "Wednesday",
    date: moment().isoWeekday(3).format("YYYY-MM-DD"),
    show: false,
  },
  {
    id: 4,
    name: "menu_for_thursday",
    short: "Th",
    title: "Thursday",
    date: moment().isoWeekday(4).format("YYYY-MM-DD"),
    show: false,
  },
  {
    id: 5,
    name: "menu_for_friday",
    short: "Fr",
    title: "Friday",
    date: moment().isoWeekday(5).format("YYYY-MM-DD"),
  },
  {
    id: 6,
    name: "menu_for_saturday",
    short: "Sa",
    title: "Saturday",
    date: moment().isoWeekday(6).format("YYYY-MM-DD"),
    show: false,
  },
];
const currentDayName = ref("");
const menuItems = ref({});
const orderItems = ref([]);

const activeOrderBtn = computed(() => {
  let dishes = [];
  days.forEach((day) => {
    let groups = ["breakfast", "dinner", "sides", "four"];

    if (menuItems.value[day.name]) {
      groups.forEach((group) => {
        if (
          menuItems.value[day.name]?.[group] &&
          menuItems.value[day.name][group]
        ) {
          menuItems.value[day.name][group].forEach((item) => {
            if (item.count > 0) {
              dishes.push(item.id);
            }
          });
        }
      });
    }
  });

  return dishes.length > 0 ? true : false;
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
                dish_meal: item.dish_meal,
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

onMounted(async () => {
  try {
    const { data: response } = await axios.get(
      route.params.userId ? apiUrl + route.params.userId : apiUrl + menuAlias
    );
    const { data: programData } = response;
    menuItems.value = setProgram(programData);
  } catch (e) {
    console.log(e);
  }
});
</script>

<template>
  <div v-if="menuPage">
    <div class="menu-page">
      <div class="menu-page__header" id="menu-header">
        <DaysListComponent :days="days" @updateDay="currentDayName = $event" />
      </div>

      <div v-if="menuItems[currentDayName]">
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
    </div>
    <div v-if="menuItems[currentDayName]" class="order-page__body">
      <div class="order-page__buttons">
        <button
          v-if="route.params.userId"
          :disabled="!activeOrderBtn"
          type="button"
          class="button button--success _fw"
          @click="showOrderPage"
        >
          <span>Order</span>
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
