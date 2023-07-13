<script setup>
import DishCount from "@/components/DishCountComponent.vue";
import Modal from "@/components/ModalComponent.vue";
import ChangeDay from "@/components/ChangeDayButtonComponent.vue";

import { ref, watch, onMounted } from "vue";
import axios from "axios";
import { useRoute } from "vue-router";
import usePriceCalculation from "@/composable/priceCalculation";
import useMacronutrientsCalculation from "@/composable/macronutrientsCalculation";

const route = useRoute();
const { totalPrice, setDishesArray, totalPriceByDays, activeOrderBtn } =
  usePriceCalculation();

const {
  getCountOfMacronutrient,
  macronutrientsDishesByDays,
  totalMacronutrientByDays,
} = useMacronutrientsCalculation();

const baseUrl = import.meta.env.VITE_APP_BASE_URL;
const disabledBtn = ref(false);
const showModal = ref(false);
const orderComplete = ref(false);
const orderId = ref(null);
const pdfLink = ref("");
const comment = ref("");

const props = defineProps({
  items: {
    type: Array,
    default: function () {
      return [];
    },
  },
  days: { type: Object, required: true },
});

const items = ref(props.items);

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

const getDishPrice = (dishes = [], id) => {
  const filteredDishes = dishes.filter((dish) => dish.dish_id === id);

  const totalPrice = filteredDishes.reduce((total, dish) => {
    return total + dish.quantity * dish.price;
  }, 0);

  // return totalPrice > 0 ? `€ ${Math.floor(totalPrice * 100) / 100}` : "";
  return `€ ${Math.floor(totalPrice * 100) / 100}`;
};

const emits = defineEmits(["orderChange"]);

// const changeOrder = (day, id, quantity) => {
//   items.value.forEach((item) => {
//     if (item.day === day) {
//       item.dishes.forEach(() => {
//         if (quantity < 1) {
//           item.dishes = item.dishes.filter((e) => e.dish_id !== id);
//         }
//       });
//     }
//   });
// };

const saveOrder = async () => {
  disabledBtn.value = !disabledBtn.value;

  console.log(items.value, "items.value");

  let orderResponse;
  try {
    const { data: response } = await axios.post(
      baseUrl + "api/save-order/" + route.params.userId,
      {
        days: items.value,
        comment: comment.value,
      }
    );
    // console.log(response, "response");
    const { data: orderDetails } = response;
    orderResponse = orderDetails;
  } catch (e) {
    console.log(e);
  }

  console.log(orderResponse, "orderResponse");
  if (orderResponse?.id) {
    orderId.value = orderResponse.id;
    pdfLink.value = orderResponse.pdf_link;
    showModal.value = !showModal.value;
    orderComplete.value = !orderComplete.value;
  } else {
    alert("Oops something went wrong");
  }
  disabledBtn.value = !disabledBtn.value;
};

const setToNexDay = (dish, day, type) => {
  // get index of current day
  const dayIndex = items.value
    .map((item) => {
      return item.day;
    })
    .indexOf(day);
  const nexDayIndex = dayIndex < 5 ? dayIndex + 1 : 0;
  const prevDayIndex = dayIndex > 1 ? dayIndex - 1 : 0;

  const dishesByNextDay = items.value[nexDayIndex].dishes;
  const dishesByPrevtDay = items.value[prevDayIndex].dishes;

  //check if new dish exists in dishes list of next day
  const newDishInNextDayList = items.value[nexDayIndex].dishes.find(
    (item) => item.dish_id === dish.dish_id
  );

  const oldDishInPrevDayList = items.value[prevDayIndex].dishes.find(
    (item) => item.dish_id === dish.dish_id
  );

  if (type === "next") {
    if (newDishInNextDayList) {
      newDishInNextDayList.quantity += 1;
      newDishInNextDayList.next_day = false;
      newDishInNextDayList.previous_day = true;
    } else {
      //get new Dish for copy
      const newDish = JSON.parse(JSON.stringify(dish));
      newDish.quantity = 1;
      newDish.next_day = false;
      newDish.previous_day = true;
      dishesByNextDay.push(newDish);
    }
  } else {
    if (oldDishInPrevDayList) {
      oldDishInPrevDayList.quantity += 1;
      oldDishInPrevDayList.next_day = true;
      oldDishInPrevDayList.previous_day = false;
    } else {
      const oldDish = JSON.parse(JSON.stringify(dish));
      oldDish.quantity = 1;
      oldDish.next_day = true;
      oldDish.previous_day = false;
      dishesByPrevtDay.push(oldDish);
    }
  }

  //remove dish with quantity<1 if we send dish to next day
  items.value.forEach((item) => {
    if (item.day === day) {
      item.dishes.forEach((dishItem) => {
        if (dishItem.quantity < 1) {
          item.dishes = item.dishes.filter((e) => e.dish_id !== dish.dish_id);
        }
      });
    }
  });
};

const changeOrder = () => {
  emits("orderChange", items.value);
};

watch(
  () => items.value,
  (items) => {
    setDishesArray(items);
    macronutrientsDishesByDays.value = items;
  },
  {
    deep: true,
    immediate: true,
  }
);

onMounted(async () => {
  const dishesByMonday = await items.value.find(
    (item) => item.dayName === "menu_for_monday"
  ).dishes;

  await dishesByMonday.forEach((item) => {
    item.next_day = true;
  });

  const dishesByTuesday = await items.value.find(
    (item) => item.dayName === "menu_for_tuesday"
  ).dishes;

  await dishesByTuesday.forEach((item) => {
    item.next_day = true;
  });

  const dishesByWednesday = await items.value.find(
    (item) => item.dayName === "menu_for_wednesday"
  ).dishes;

  await dishesByWednesday.forEach((item) => {
    item.next_day = true;
  });

  const dishesByThursday = await items.value.find(
    (item) => item.dayName === "menu_for_thursday"
  ).dishes;

  await dishesByThursday.forEach((item) => {
    item.next_day = true;
  });

  const dishesByFriday = await items.value.find(
    (item) => item.dayName === "menu_for_friday"
  ).dishes;

  await dishesByFriday.forEach((item) => {
    item.next_day = true;
  });

  const dishesBySaturday = await items.value.find(
    (item) => item.dayName === "menu_for_saturday"
  ).dishes;

  await dishesBySaturday.forEach((item) => {
    item.previous_day = true;
  });
});
</script>
<template>
  <div class="order-page">
    <div class="order-page__header" v-show="!orderComplete">
      <div class="_container">
        <h1 class="order-page__title">Your order</h1>
      </div>
    </div>
    <div
      v-if="items.length"
      class="order-page__dishes-wrap"
      :class="{ '_complete-order': orderComplete }"
    >
      <div class="order-pdf-title" v-show="orderComplete">Your order:</div>
      <div class="order-page__body" v-for="item in items" :key="item.day">
        <div class="order-page__day-dishes" v-if="item.dishes.length">
          <div class="order-page__day-title">{{ item.day }}</div>

          <div v-if="item.dishes">
            <div v-for="dish in item.dishes" :key="dish.id" class="order-item">
              <div class="order-item__picture">
                <img :src="getPhoto(dish.photos)" />
              </div>
              <div
                class="order-item__body"
                :class="{ complete: orderComplete }"
              >
                <div class="order-item__title">
                  <h2>{{ dish.dish_name }}</h2>
                  <ul class="order-item__macronutrients">
                    <li>{{ dish.dish_count }} g</li>
                    <li>
                      {{
                        getCountOfMacronutrient(dish.proteins, dish.dish_count)
                      }}
                      p
                    </li>
                    <li>
                      {{ getCountOfMacronutrient(dish.fats, dish.dish_count) }}
                      f
                    </li>
                    <li>
                      {{
                        getCountOfMacronutrient(
                          dish.carbohydrates,
                          dish.dish_count
                        )
                      }}
                      c
                    </li>
                    <li>
                      {{
                        getCountOfMacronutrient(dish.calories, dish.dish_count)
                      }}
                      kcal
                    </li>
                  </ul>
                </div>
                <div class="order-item__total">
                  <div>
                    {{
                      getCountOfMacronutrient(dish.calories, dish.dish_count)
                    }}
                    kcal
                  </div>
                  <div>
                    <span v-if="dish.dish_type === 'main'">
                      {{
                        getDishPrice(
                          totalPriceByDays[item.day].mainDishes,
                          dish.dish_id
                        )
                      }}
                    </span>
                    <span v-else-if="dish.dish_type === 'vegetarian'">
                      {{
                        getDishPrice(
                          totalPriceByDays[item.day].vegetarians,
                          dish.dish_id
                        )
                      }}
                    </span>
                    <span v-else-if="dish.dish_type === 'breakfast'">
                      {{
                        getDishPrice(
                          totalPriceByDays[item.day].breakfasts,
                          dish.dish_id
                        )
                      }}
                    </span>
                    <span v-else-if="dish.dish_type === 'side'">
                      {{
                        getDishPrice(
                          totalPriceByDays[item.day].sides,
                          dish.dish_id
                        )
                      }}
                    </span>
                  </div>
                </div>
                <div class="order-item__actions">
                  <div v-if="!orderComplete" class="order-item__count-wrap">
                    <DishCount v-model="dish.quantity" :key="dish.quantity" />
                    <ChangeDay
                      v-if="dish.next_day || dish.previous_day"
                      v-model="dish.quantity"
                      :key="dish.quantity"
                      :type="dish.next_day ? 'next' : 'prev'"
                      @changeCount="
                        setToNexDay(
                          dish,
                          item.day,
                          dish.next_day ? 'next' : 'prev'
                        )
                      "
                    />
                  </div>
                  <div class="order-item__ordered-count" v-else>
                    {{ dish.quantity }}
                  </div>
                  <div class="order-item__price">
                    <span v-if="dish.dish_type === 'main'">
                      {{
                        getDishPrice(
                          totalPriceByDays[item.day].mainDishes,
                          dish.dish_id
                        )
                      }}
                    </span>
                    <span v-else-if="dish.dish_type === 'vegetarian'">
                      {{
                        getDishPrice(
                          totalPriceByDays[item.day].vegetarians,
                          dish.dish_id
                        )
                      }}
                    </span>
                    <span v-else-if="dish.dish_type === 'breakfast'">
                      {{
                        getDishPrice(
                          totalPriceByDays[item.day].breakfasts,
                          dish.dish_id
                        )
                      }}
                    </span>
                    <span v-else-if="dish.dish_type === 'side'">
                      {{
                        getDishPrice(
                          totalPriceByDays[item.day].sides,
                          dish.dish_id
                        )
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="day-price order-item__title">
            <div class="day-price__day">
              Total ({{ item.day.toLowerCase() }}):
            </div>
            <div class="day-price__calories">
              {{ totalMacronutrientByDays[item.day].totalCalories }} kcal
            </div>
            <div class="day-price__price">
              €
              {{
                Math.floor(Number(totalPriceByDays[item.day].total) * 100) / 100
              }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="totalPrice" class="order-page__body order-total">
        <div class="order-total__wrap">
          <div class="order-total__title">Total (week):</div>
          <div class="order-total__value">
            € {{ Math.floor(Number(totalPrice) * 100) / 100 }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="!orderComplete" class="order-page__body">
      <textarea
        v-model="comment"
        class="input order-page__comment"
        placeholder="Leave a comment (optional)"
      ></textarea>
    </div>
    <div v-else-if="orderComplete && comment !== ''" class="order-page__body">
      <div class="complete-comment-label">Your comment:</div>
      <p>{{ comment }}</p>
    </div>
    <div class="order-page__body" v-if="!orderComplete">
      <div class="order-page__buttons">
        <button
          type="button"
          :disabled="disabledBtn || !activeOrderBtn"
          class="button button--success _fw"
          @click="saveOrder"
        >
          <span>Confirm</span>
        </button>
        <button
          type="button"
          class="button button--default _fw"
          @click="changeOrder"
          :disabled="disabledBtn"
        >
          <span>Change</span>
        </button>
      </div>
    </div>
  </div>
  <Modal
    v-if="showModal"
    v-model="showModal"
    :order-id="orderId"
    :pdf-link="pdfLink"
  />
</template>
<style scoped>
.complete-comment-label {
  margin-bottom: 16px;
  color: #383836;
  opacity: 0.8;
  font-weight: 500;
}
</style>
