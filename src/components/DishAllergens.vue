<script setup>
const props = defineProps({
  allergens: { type: [String, null], required: true },
});

const checkIcon = (val) => {
  return props.allergens.includes(val);
};
</script>

<template>
  <div
    v-if="
      allergens &&
      (checkIcon(allergens, 'dairy') ||
        checkIcon(allergens, 'seafood') ||
        checkIcon(allergens, 'nuts') ||
        checkIcon(allergens, 'gluten') ||
        checkIcon(allergens, 'meat'))
    "
    class="dish__allergens"
  >
    <div
      v-if="checkIcon('dairy')"
      class="dish__allergen-icon dish__allergen-icon_dairy"
    >
      <img src="@/assets/img/icons/dairy.png" alt="dairy" />
    </div>
    <div
      v-if="checkIcon('spicy')"
      class="dish__allergen-icon dish__allergen-icon_spicy"
    >
      <img src="@/assets/img/icons/spicy.png" alt="spicy" />
    </div>
    <div
      v-if="checkIcon('seafood')"
      class="dish__allergen-icon dish__allergen-icon_seafood"
    >
      <img src="@/assets/img/icons/seafood.png" alt="seafood" />
    </div>
    <div
      v-if="checkIcon('nuts')"
      class="dish__allergen-icon dish__allergen-icon_nuts"
    >
      <img src="@/assets/img/icons/nuts.png" alt="nuts" />
    </div>
    <div
      v-if="checkIcon('gluten')"
      class="dish__allergen-icon dish__allergen-icon_gluten"
    >
      <img src="@/assets/img/icons/gluten.png" alt="gluten" />
    </div>
    <div
      v-if="checkIcon('meat')"
      class="dish__allergen-icon dish__allergen-icon_meat"
    >
      <img src="@/assets/img/icons/meat.png" alt="meat" />
    </div>
    <div
      v-if="checkIcon('onion')"
      class="dish__allergen-icon dish__allergen-icon_onion"
    >
      <img src="@/assets/img/icons/onion.png" alt="onion" />
    </div>
    <div
      v-if="checkIcon('mushrooms')"
      class="dish__allergen-icon dish__allergen-icon_mushrooms"
    >
      <img src="@/assets/img/icons/mushrooms.png" alt="mushrooms" />
    </div>
    <div
      v-if="checkIcon('pepper')"
      class="dish__allergen-icon dish__allergen-icon_pepper"
    >
      <img src="@/assets/img/icons/pepper.png" alt="pepper" />
    </div>
  </div>
</template>
