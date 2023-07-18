import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { DISH_PRICES, DAYS } from "../constants.js";
import axios from "axios";

export default function usePriceCalculation() {
  const route = useRoute();
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;

  const days = DAYS;
  const errorDays = ref(DAYS);
  const prices = ref(DISH_PRICES);
  const dishesArray = ref([]);

  const totalPriceByDays = computed(() => {
    let prices = {};
    dishesArray.value.forEach((dayItem) => {
      let priceByDay = calculatePriceByTypes(dayItem);
      prices[dayItem.day] = priceByDay;
    });
    return prices;
  });

  const errorInDays = computed(() => {
    return errorDays.value.find((obj) => obj.error === true);
  });

  const activeOrderBtn = computed(() => {
    let oderBtnstate = false;
    for (const key in totalPriceByDays.value) {
      let errorDaysIndex = errorDays.value.findIndex(
        (item) => item.title === key
      );
      if (
        totalPriceByDays.value[key].mainCount > 0 ||
        totalPriceByDays.value[key].vegetariansCount > 0 ||
        totalPriceByDays.value[key].breakfastsCount > 0 ||
        totalPriceByDays.value[key].sidesCount > 0
      ) {
        let mains = totalPriceByDays.value[key].mainCount;
        let vegetarians = totalPriceByDays.value[key].vegetariansCount;
        let breakfasts = totalPriceByDays.value[key].breakfastsCount;
        let sides = totalPriceByDays.value[key].sidesCount;

        if (
          (!mains && !vegetarians && !sides && breakfasts < 2) ||
          (!mains && !vegetarians && sides && breakfasts < 2)
        ) {
          oderBtnstate = false;
          errorDays.value[errorDaysIndex].error = true;
        } else {
          oderBtnstate = true;
          errorDays.value[errorDaysIndex].error = false;
        }
      } else {
        errorDays.value[errorDaysIndex].error = false;
      }
    }

    return oderBtnstate && !errorInDays.value;
  });

  const calculatePriceByTypes = (day) => {
    const mainDishes = [];
    const vegetarians = [];
    const breakfasts = [];
    const sides = [];
    day.dishes.forEach((dish) => {
      if (dish.dish_type === "main") {
        // TODO create function for
        for (let i = 0; i < dish.quantity; i++) {
          mainDishes.push({
            dish_id: dish.dish_id,
            dish_name: dish.dish_name,
            dish_type: dish.dish_type,
            quantity: 1,
          });
        }
      }

      if (dish.dish_type === "vegetarian") {
        for (let i = 0; i < dish.quantity; i++) {
          vegetarians.push({
            dish_id: dish.dish_id,
            dish_name: dish.dish_name,
            dish_type: dish.dish_type,
            quantity: 1,
          });
        }
      }

      if (dish.dish_type === "breakfast") {
        for (let i = 0; i < dish.quantity; i++) {
          breakfasts.push({
            dish_id: dish.dish_id,
            dish_name: dish.dish_name,
            dish_type: dish.dish_type,
            quantity: 1,
          });
        }
      }

      if (dish.dish_type === "side") {
        for (let i = 0; i < dish.quantity; i++) {
          sides.push({
            dish_id: dish.dish_id,
            dish_name: dish.dish_name,
            dish_type: dish.dish_type,
            quantity: 1,
          });
        }
      }
    });

    let totalCost = 0;
    if (mainDishes.length) {
      mainDishes.forEach((dish, index) => {
        let cost = 0;
        if (index === 0) {
          cost = prices.value?.main_1 || 0;
        } else if (index === 1) {
          cost = prices.value?.main_2 || 0;
        } else {
          cost = prices.value?.main_3 || 0;
        }
        dish.price = cost;
        totalCost += cost * dish.quantity;
      });

      breakfasts.forEach((dish) => {
        let cost = prices.value?.breakfast_2 || 0;
        dish.price = cost;
        totalCost += cost * dish.quantity;
      });

      vegetarians.forEach((dish) => {
        let cost = prices.value?.vegetarian_2 || 0;
        dish.price = cost;
        totalCost += cost * dish.quantity;
      });

      sides.forEach((dish) => {
        let cost = prices.value?.side || 0;
        dish.price = cost;
        totalCost += cost * dish.quantity;
      });
    } else if (vegetarians.length) {
      vegetarians.forEach((dish, index) => {
        let cost =
          index === 0
            ? prices.value?.vegetarian_1
              ? prices.value.vegetarian_1
              : 0
            : prices.value?.vegetarian_2
            ? prices.value.vegetarian_2
            : 0;
        dish.price = cost;
        totalCost += cost;
      });

      breakfasts.forEach((dish) => {
        let cost = prices.value?.breakfast_2 || 0;
        dish.price = cost;
        totalCost += cost * dish.quantity;
      });

      sides.forEach((dish) => {
        let cost = prices.value?.side || 0;
        dish.price = cost;
        totalCost += cost * dish.quantity;
      });
    } else if (breakfasts.length) {
      breakfasts.forEach((dish, index) => {
        let cost =
          index === 0
            ? prices.value?.breakfast_1
              ? prices.value.breakfast_1
              : 0
            : prices.value?.breakfast_1
            ? prices.value.breakfast_2
            : 0;
        dish.price = cost;
        totalCost += cost;
      });

      sides.forEach((dish) => {
        let cost = prices.value?.side || 0;
        dish.price = cost;
        totalCost += cost * dish.quantity;
      });
    } else {
      sides.forEach((dish) => {
        let cost = prices.value?.side || 0;
        dish.price = cost;
        totalCost += cost * dish.quantity;
      });
    }

    let totalObj = {
      total: totalCost,
      mainCount: mainDishes.length,
      mainDishes: mainDishes,
      vegetariansCount: vegetarians.length,
      vegetarians: vegetarians,
      breakfastsCount: breakfasts.length,
      breakfasts: breakfasts,
      sidesCount: sides.length,
      sides: sides,
    };

    return totalObj;
  };

  const totalPrice = computed(() => {
    let sum = 0;
    for (const key in totalPriceByDays.value) {
      // console.log(totalPriceByDays.value[key].total, 'key');
      sum += parseFloat(totalPriceByDays.value[key].total);
    }
    return sum;
  });

  const setDishTypeByMealType = (dishMeal) => {
    if (dishMeal > 0 && dishMeal <= 5) {
      return "breakfast";
    } else if (dishMeal > 5 && dishMeal <= 10) {
      return "main";
    } else if (dishMeal > 10 && dishMeal <= 15) {
      return "side";
    } else if (dishMeal > 15) {
      return "vegetarian";
    }
  };

  const createDishesArrayByDays = (dishesFromMenu) => {
    let dishes = [];
    days.forEach((day) => {
      let groups = ["breakfast", "dinner", "sides", "four"];
      if (dishesFromMenu[day.name]) {
        let dayDishesArray = [];

        groups.forEach(function (group) {
          if (dishesFromMenu[day.name]?.[group]) {
            dishesFromMenu[day.name][group].forEach((item) => {
              if (item.count > 0) {
                let dishObj = {
                  dish_id: item.id,
                  dish_name: item.name,
                  quantity: item.count,
                  // photos: item.photos,
                  calories: item.calories,
                  carbohydrates: item.carbohydrates,
                  fats: item.fats,
                  proteins: item.proteins,
                  dish_meal: item.dish_meal,
                  dish_type: setDishTypeByMealType(item.dish_meal),
                  dish_count: item.dish_count,
                  menu_dish_id: item.menu_dish_id,
                  // allergens: item.allergens,
                  // ingredients_description: item.ingredients_description,
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
          dishes: dayDishesArray,
        };
        dishes.push(dayObj);
      }
    });
    setDishesArray(dishes);
    return dishes;
  };

  const setDishesArray = (dishes) => {
    dishesArray.value = dishes;
  };

  const getDishPriceByType = (type) => {
    switch (type) {
      case "breakfast":
        return prices.value.breakfast_1;
      case "main":
        return prices.value.main_1;
      case "vegetarian":
        return prices.value.vegetarian_1;
      case "side":
        return prices.value.side;
      default:
        return null;
    }
  };

  onMounted(async () => {
    if (route.params.userId) {
      try {
        const { data: response } = await axios.get(
          `${baseUrl}api/get-client-prices/${route.params.userId}`
        );
        const { data: pricesData } = response;
        prices.value = pricesData;
        // console.log(prices.value, "prices");
      } catch (e) {
        console.log(e);
      }
    }
  });

  return {
    errorDays,
    prices,
    totalPrice,
    createDishesArrayByDays,
    setDishTypeByMealType,
    setDishesArray,
    totalPriceByDays,
    activeOrderBtn,
    getDishPriceByType,
  };
}
