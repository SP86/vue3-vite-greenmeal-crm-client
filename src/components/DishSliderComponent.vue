<script setup>
import DishInfo from "@/components/DishInfoComponent.vue";
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  dishes: { type: Array, required: true },
});

const pagewidth = ref(window.innerWidth);
const pageOffset = ref(0);

const windowWidth = computed(() => {
  return pagewidth.value;
});

const hideDividerLine = computed(() => {
  let menuDays = document.getElementById("menu-days");
  if (document.body.contains(menuDays)) {
    let sticky = menuDays.offsetTop + 64;

    if (windowWidth.value > 767.98) {
      return pageOffset.value <= sticky ? false : true;
    } else {
      return false;
    }
  } else {
    return false;
  }
});

const handleScroll = () => {
  pageOffset.value = window.pageYOffset;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", () => {
    pagewidth.value = window.innerWidth;
  });

  new Swiper(".dishes-slider", {
    freeMode: false,
    loop: false,
    grabCursor: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
    },
    scrollbar: {
      el: ".swiper-scrollbar",
      draggable: true,
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      540: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      720: {
        slidesPerView: "auto",
        spaceBetween: 30,
      },
      1024: {
        watchOverflow: true,
        slidesPerView: "auto",
        spaceBetween: 40,
      },
    },
  });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <div class="swiper dishes-slider menu-page__swiper">
    <div class="menu-page__dishes swiper-wrapper">
      <div
        v-for="item in props.dishes"
        :key="item.id"
        class="dish swiper-slide"
        :class="{ active: item.count > 0 }"
      >
        <DishInfo :item="item" />
      </div>
    </div>
    <div class="swiper-pagination"></div>
    <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>
    <div class="swiper-scrollbar"></div>
  </div>
  <div
    v-if="dishes.length < 4"
    class="menu-page__divider"
    :class="{ line: !hideDividerLine }"
  ></div>
  <div
    v-else
    class="menu-page__divider-empty"
    :class="{ line: !hideDividerLine }"
  ></div>
</template>
