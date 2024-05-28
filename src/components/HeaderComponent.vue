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
        <a
          href="https://greenmeal.es/privacidad/"
          class="menu-header__link"
          target="_blank"
          >Política de privacidad</a
        >
      </li>
      <li class="menu-header__item">
        <a
          href="https://greenmeal.es/terminos/"
          class="menu-header__link"
          target="_blank"
          >Términos de Uso y Aviso Legal</a
        >
      </li>
      <li class="menu-header__item">
        <a
          href="https://greenmeal.es/politica-de-cookies/"
          class="menu-header__link"
          target="_blank"
          >Política de cookies</a
        >
      </li>
      <!-- <li class="menu-header__item">
        <a href="javascript:void(0);" class="menu-header__link">FAQ</a>
      </li> -->
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
        <li>
          <a href="https://greenmeal.es/privacidad/" target="_blank"
            >Política de privacidad</a
          >
        </li>
        <li>
          <a href="https://greenmeal.es/terminos/" target="_blank"
            >Términos de Uso y Aviso Legal</a
          >
        </li>
        <li>
          <a href="https://greenmeal.es/politica-de-cookies/" target="_blank"
            >Política de cookies</a
          >
        </li>
        <!-- <li><a href="#">FAQ</a></li> -->
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
