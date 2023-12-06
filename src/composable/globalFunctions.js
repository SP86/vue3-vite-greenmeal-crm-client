import { computed } from "vue";
import { useRoute } from "vue-router";

export default function useGlobalFunctions() {
  const route = useRoute();

  const isClientMenu = computed(() => {
    return route.params.userId ? true : false;
  });
  return {
    isClientMenu,
  };
}
