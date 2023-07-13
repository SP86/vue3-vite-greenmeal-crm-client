import { ref, computed } from "vue";

export default function useMacronutrientsCalculation() {
  const macronutrientsDishesByDays = ref([]);

  const getCountOfMacronutrient = (macronutrient, count) => {
    const value =
      macronutrient && count
        ? Math.round(((macronutrient * count) / 100) * 1000) / 1000
        : 0;

    return Number.isInteger(value) ? value : value.toFixed(1);
  };

  const totalMacronutrientByDays = computed(() => {
    let total = {};
    macronutrientsDishesByDays.value.forEach((dayItem) => {
      let totalCaloriesByDay = 0;
      let totalProteinsByDay = 0;
      let totalСarbohydratesByDay = 0;
      let totalFatsByDay = 0;
      dayItem.dishes.forEach((dish) => {
        totalCaloriesByDay +=
          getCountOfMacronutrient(dish.calories, dish.dish_count) *
          dish.quantity;
        totalProteinsByDay +=
          getCountOfMacronutrient(dish.proteins, dish.dish_count) *
          dish.quantity;
        totalСarbohydratesByDay +=
          getCountOfMacronutrient(dish.carbohydrates, dish.dish_count) *
          dish.quantity;
        totalFatsByDay +=
          getCountOfMacronutrient(dish.fats, dish.dish_count) * dish.quantity;
      });

      let totalObj = {
        totalCalories: Number.isInteger(totalCaloriesByDay)
          ? totalCaloriesByDay
          : totalCaloriesByDay.toFixed(1),
        totalProteins: Number.isInteger(totalProteinsByDay)
          ? totalProteinsByDay
          : totalProteinsByDay.toFixed(1),
        totalСarbohydrates: Number.isInteger(totalСarbohydratesByDay)
          ? totalСarbohydratesByDay
          : totalСarbohydratesByDay.toFixed(1),
        totalFats: Number.isInteger(totalFatsByDay)
          ? totalFatsByDay
          : totalFatsByDay.toFixed(1),
      };
      total[dayItem.day] = totalObj;
    });

    return total;
  });

  return {
    getCountOfMacronutrient,
    macronutrientsDishesByDays,
    totalMacronutrientByDays,
  };
}
