import { computed } from "vue";
import { useRoute } from "vue-router";

export default function useGlobalFunctions() {
  const route = useRoute();
  const isMenuOff = false;

  const isClientMenu = computed(() => {
    return route.params.userId ? true : false;
  });
  return {
    isMenuOff,
    isClientMenu,
  };
}
