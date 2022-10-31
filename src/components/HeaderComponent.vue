<template>
  <div class="header _container">
    <div class="header__logo">
      <a href="/">
        <img src="@/assets/img/logo.svg" alt="" />
      </a>
    </div>

    <div class="header__divider"></div>

    <ul class="header__menu menu-header">
      <li class="menu-header__item">
        <a href="#" class="menu-header__link">How it works</a>
      </li>
      <li class="menu-header__item">
        <router-link to="/adam" class="menu-header__link"
          >Meal plans</router-link
        >
        <!-- <a href="#" class="menu-header__link">Meal plans</a> -->
      </li>
      <li class="menu-header__item">
        <a href="#" class="menu-header__link">Reviews</a>
      </li>
      <li class="menu-header__item">
        <a href="#" class="menu-header__link">FAQ</a>
      </li>
    </ul>

    <div class="header__divider"></div>

    <div class="header__email contact-email">
      <i class="icon-mail"></i>
      Marbella
    </div>

    <div class="header__divider"></div>

    <div class="header__phone contact-phone">
      <i></i>
      <a href="tel:+34 698 97 99 99">+34 698 97 99 99</a>
    </div>

    <div class="header__divider"></div>
    <div class="header__social social-links">
      <a href="#" class="social-links__item" target="_blank">
        <div class="social-links__icon">
          <img src="@/assets/img/icons/instagram.svg" />
        </div>
      </a>
      <a href="#" class="social-links__item" target="_blank">
        <div class="social-links__icon">
          <img src="@/assets/img/icons/facebook.svg" />
        </div>
      </a>
    </div>
  </div>
  <div id="mobile-menu" class="mobile-menu hide">
    <div class="mobile-menu__wrapper">
      <ul>
        <li><a href="#">How it works</a></li>
        <li><a href="#">Meal plans</a></li>
        <li><a href="#">Reviews</a></li>
        <li><a href="#">FAQ</a></li>
      </ul>
      <div class="hr"></div>
      <div class="contact-phone">
        <div>Contact us</div>
        <i></i>
        <a href="tel:+34 698 97 99 99">+34 698 97 99 99</a>
      </div>
      <div class="social-links">
        <a href="#" class="social-links__item" target="_blank">
          <div class="social-links__icon">
            <img src="@/assets/img/icons/instagram.svg" />
          </div>
        </a>
        <a href="#" class="social-links__item" target="_blank">
          <div class="social-links__icon">
            <img src="@/assets/img/icons/facebook.svg" />
          </div>
        </a>
      </div>
    </div>
  </div>
</template>
