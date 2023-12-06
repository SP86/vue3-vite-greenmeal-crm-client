import { ref } from "vue";
import { defineStore } from "pinia";
import axios from "axios";

export const usePricesStore = defineStore("pricesStore", () => {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const prices = ref({});

  async function fetchPrices(userId) {
    try {
      const { data: response } = await axios.get(
        `${baseUrl}api/get-client-prices/${userId}`
      );
      const { data: pricesData } = response;
      setPrices(pricesData);
    } catch (e) {
      console.log(e);
    }
  }

  function setPrices(items) {
    prices.value = items;
  }

  return { prices, fetchPrices };
});
