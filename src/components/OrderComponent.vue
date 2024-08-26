<script setup>
import DishCount from "@/components/DishCountComponent.vue";
import Modal from "@/components/ModalComponent.vue";
import ChangeDay from "@/components/ChangeDayButtonComponent.vue";
import Popup from "@/components/PopupComponent.vue";
import Payment from "@/components/PaymentComponent.vue";

import {
  ref,
  unref,
  computed,
  reactive,
  watch,
  onMounted,
  onBeforeUnmount,
} from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import moment from "moment";
import usePriceCalculation from "@/composable/priceCalculation";
import useMacronutrientsCalculation from "@/composable/macronutrientsCalculation";
import useDatesCalculation from "@/composable/datesCalculation";
import { useOrderStore } from "@/stores/order";

const { currentIsoWeekday, isOwer11Pm } = useDatesCalculation();
const { totalPrice, setDishesArray, totalPriceByDays, activeOrderBtn } =
  usePriceCalculation();
const orderStore = useOrderStore();
const {
  getCountOfMacronutrient,
  macronutrientsDishesByDays,
  totalMacronutrientByDays,
} = useMacronutrientsCalculation();

defineProps({
  days: { type: Object, required: true },
});
const emits = defineEmits(["orderChange"]);

const items = ref([]);
const baseUrl = import.meta.env.VITE_APP_BASE_URL;
const disabledBtn = ref(false);
const route = useRoute();
const router = useRouter();
const showModal = ref(false);
const isShowPopup = ref(false);
const popup = reactive({
  title: null,
  message: null,
});
const orderComplete = ref(false);
const orderId = ref(null);
const pdfLink = ref("");
const paymentFormRef = ref(null);
const paymentMethod = ref("redsys");
const paymentData = reactive({
  post_url: null,
  Ds_SignatureVersion: null,
  Ds_MerchantParameters: null,
  Ds_Signature: null,
});
const comment = ref("");
const isOrderEmpty = ref(false);

const isPaymentData = computed(() => {
  return Object.values(paymentData).every((value) => value !== null);
});

const isAdamUser = computed(() => {
  return route.params.userId === "adam";
});

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

const saveOrder = async () => {
  if (!(await checkIsMenuActual())) return false;

  disabledBtn.value = !disabledBtn.value;

  let orderResponse = {};
  try {
    const { data: response } = await axios.post(
      baseUrl + "api/save-order/" + route.params.userId,
      {
        days: items.value,
        payment_method: paymentMethod.value,
        comment: comment.value,
      }
    );
    console.log(response, "response");
    const { data: orderDetails } = response;

    Object.assign(orderResponse, unref(orderDetails.client_order));
    Object.assign(paymentData, unref(orderDetails.payment_data));
  } catch (e) {
    console.log(e);
  }

  // console.log(orderResponse, "orderResponse");
  if (orderResponse?.id) {
    orderId.value = orderResponse.id;
    // pdfLink.value = orderResponse.pdf_link;
    // showModal.value = !showModal.value;
    orderComplete.value = !orderComplete.value;

    if (["redsys", "revolut"].includes(paymentMethod.value)) {
      paymentFormRef.value?.submit();
    }

    if (["eden", "bank", "cash"].includes(paymentMethod.value)) {
      router.push({
        name: "completed-order",
        query: {
          client: orderResponse.client.alias,
          order_id: orderResponse.id,
        },
      });
    }
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

watch(
  () => items.value,
  (items) => {
    setDishesArray(items);
    macronutrientsDishesByDays.value = items;
    // orderStore.setItemsToOrder(items);
  },
  {
    deep: true,
    immediate: true,
  }
);

const checkIsMenuActual = async () => {
  items.value = orderStore.orderItems;

  let changesMade = false;
  let currentDay = currentIsoWeekday.value;
  let cutoffDay = currentDay;

  if (currentDay === 1) {
    cutoffDay = isOwer11Pm.value ? 2 : 1;
  } else if (currentDay === 2) {
    cutoffDay = isOwer11Pm.value ? 3 : 2;
  } else if (currentDay === 3) {
    cutoffDay = isOwer11Pm.value ? 4 : 3;
  } else if (currentDay === 4 && !isOwer11Pm.value) {
    cutoffDay = 4;
  } else {
    cutoffDay = 7;
  }

  items.value.forEach((item) => {
    if (moment(item.date).isBefore(moment().isoWeekday(cutoffDay))) {
      if (item.dishes.length > 0) {
        item.dishes = [];
        changesMade = true;
      }
    }
  });

  if (changesMade) {
    const allDishesEmpty = items.value.every(
      (item) => item.dishes.length === 0
    );

    if (allDishesEmpty) {
      isOrderEmpty.value = true;
    }

    isShowPopup.value = true;
    popup.title = "Your menu has been updated";
    popup.message = "The deadline for one or few menus has passed";

    return false;
  } else {
    return true;
  }
};

const closePopup = () => {
  if (isOrderEmpty.value) {
    emits("orderChange");
  }
};

const paymentButtonClick = () => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
  window.removeEventListener("unload", handleUnload);
  paymentFormRef.value.submit();
  emits("orderChange");
};

onMounted(async () => {
  await checkIsMenuActual();

  const dayProperties = {
    menu_for_monday: { key: "next_day", value: true },
    menu_for_tuesday: { key: "next_day", value: true },
    menu_for_wednesday: { key: "next_day", value: true },
    menu_for_thursday: { key: "next_day", value: true },
    menu_for_friday: { key: "next_day", value: true },
    menu_for_saturday: { key: "previous_day", value: true },
  };

  items.value.forEach((item) => {
    const property = dayProperties[item.dayName];
    if (property?.key && item.dishes) {
      item.dishes.forEach((dish) => {
        dish[property.key] = property.value;
      });
    }
  });

  window.addEventListener("beforeunload", handleBeforeUnload);
  window.addEventListener("unload", handleUnload);
});

const showPayMessage = ref(false);

const handleBeforeUnload = (event) => {
  if (isPaymentData.value && orderComplete.value && isAdamUser.value) {
    event.preventDefault();
    event.returnValue = "";

    isShowPopup.value = true;
    popup.title = "Please select a payment method";
    popup.message = null;

    showPayMessage.value = true;
  }
};

const handleUnload = () => {
  if (orderComplete.value) {
    emits("orderChange");
  }
};

const handleBeforeUnloadClick = () => {
  if (!isAdamUser.value) {
    emits("orderChange");
  } else {
    if (!showPayMessage.value) {
      handleBeforeUnload({ preventDefault: () => {} });
    } else {
      emits("orderChange");
    }
  }
  // if (!showPayMessage.value && isAdamUser.value) {
  //   handleBeforeUnload({ preventDefault: () => {} });
  // } else {
  //   emits("orderChange");
  // }
};

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
  window.removeEventListener("unload", handleUnload);
});
</script>
<template>
  <div class="order-page">
    <div class="order-page__header" v-show="!orderComplete">
      <div class="_container">
        <h1 class="order-page__title">
          Please review your order and scroll down to confirm it
        </h1>
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
          <div
            class="day-price order-item__title"
            :class="{ _complete: orderComplete }"
          >
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
    <div v-if="!orderComplete" class="order-page__body">
      <Payment v-model="paymentMethod" />
    </div>

    <div v-if="!orderComplete" class="order-page__body">
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
          @click="emits('orderChange')"
          :disabled="disabledBtn"
        >
          <span>Change</span>
        </button>
      </div>
    </div>
    <div v-else class="order-page__body">
      <div class="order-page__buttons">
        <template v-if="isPaymentData && isAdamUser">
          <form
            ref="paymentFormRef"
            :action="paymentData.post_url"
            method="POST"
            target="_blank"
          >
            <input
              type="hidden"
              name="Ds_SignatureVersion"
              :value="paymentData.Ds_SignatureVersion"
            />
            <input
              type="hidden"
              name="Ds_MerchantParameters"
              :value="paymentData.Ds_MerchantParameters"
            />
            <input
              type="hidden"
              name="Ds_Signature"
              :value="paymentData.Ds_Signature"
            />
          </form>
          <button
            type="button"
            class="button button--success _fw"
            @click="paymentButtonClick"
          >
            <span>Pay order</span>
          </button>
        </template>
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
          @click="handleBeforeUnloadClick"
        >
          <span>Close</span>
        </button>
      </div>
    </div>
  </div>

  <Modal
    v-if="showModal"
    v-model="showModal"
    :order-id="orderId"
    :pdf-link="pdfLink"
    :is-payment-button="isPaymentData && isAdamUser"
    @submit-payment-button="paymentButtonClick"
  />

  <Popup v-if="isShowPopup" v-model="isShowPopup" @close="closePopup">
    <template #title>{{ popup.title }}</template>
    <template v-if="popup.message" #content>
      <p>{{ popup.message }}</p>
    </template>
  </Popup>
</template>
<style scoped>
.complete-comment-label {
  margin-bottom: 16px;
  color: #383836;
  opacity: 0.8;
  font-weight: 500;
}
</style>
