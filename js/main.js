"use strict";

const carriageButton = document.querySelector("#carriage-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");

const buttonAuth = document.querySelector(".buttonAuth");
const modalAuth = document.querySelector(".modalAuth");
const closeAuth = document.querySelector(".closeAuth");
const logInForm = document.querySelector("#logInForm");
const loginInput = document.querySelector("#login");
const userName = document.querySelector(".userName");
const buttonOut = document.querySelector(".buttonOut");

const cardsRestaratunts = document.querySelector(".cardsRestaurants");
const containerPromo = document.querySelector(".banner");
const restaurants = document.querySelector(".restaurants");
const menu = document.querySelector(".menu");
const logo = document.querySelector(".logo");
const cardsMenu = document.querySelector(".cardsMenu");
const restaurantTitle = document.querySelector(".restaurantTitle");
const rating = document.querySelector(".rating");
const minPrice = document.querySelector(".price");
const category = document.querySelector(".category");
const modalBody = document.querySelector(".modalBody");
const modalPricetag = document.querySelector(".modalPricetag");
const buttonClearcarriage = document.querySelector(".clearcarriage");

let login = localStorage.getItem("admin");

const carriage = [];

//валидация, маска логина
const valid = function (str) {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
};

const getData = async function (url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url}, статус ошибки ${response.status}!`);
  }

  return await response.json();
};

//визивает или убирает модальное окно корзины
function toggleModal() {
  modal.classList.toggle("is-open");
}

function toogleModalAuth() {
  modalAuth.classList.toggle("is-open");
  loginInput.style.borderColor = ""; // убирает Eror-красную рамку в окне авторизации
}

// фунция вибрасивает меня с окна товаров, если я нажимаю на кнопку вийты
function returnMain() {
  containerPromo.classList.remove("hide");
  restaurants.classList.remove("hide");
  menu.classList.add("hide");
}

function authorized() {
  function logOut() {
    login = "";
    localStorage.removeItem("admin");
    buttonAuth.style.display = "";
    userName.style.display = "";
    buttonOut.style.display = "";
    carriageButton.style.display = "";
    buttonOut.removeEventListener("click", logOut);
    checkAuth();
    returnMain();
  }

  console.log("Авторизован");

  userName.textContent = login;

  buttonAuth.style.display = "none";
  userName.style.display = "inline";
  buttonOut.style.display = "flex";
  carriageButton.style.display = "flex";

  buttonOut.addEventListener("click", logOut);
}

function notAuthorized() {
  console.log("Не авторизован");

  function logIn(event) {
    event.preventDefault();

    if (valid(loginInput.value.trim())) {
      login = loginInput.value;

      localStorage.setItem("admin", login);

      toogleModalAuth();
      buttonAuth.removeEventListener("click", toogleModalAuth);
      closeAuth.removeEventListener("click", toogleModalAuth);
      logInForm.removeEventListener("submit", logIn);
      logInForm.reset();
      checkAuth();
    } else {
      loginInput.style.borderColor = "red"; // добавляет Eror-красную рамку в окне авторизации
      loginInput.value = "";
    }
  }

  buttonAuth.addEventListener("click", toogleModalAuth);
  closeAuth.addEventListener("click", toogleModalAuth);
  logInForm.addEventListener("submit", logIn);
}

function checkAuth() {
  if (login) {
    authorized();
  } else {
    notAuthorized();
  }
}

function createCardRestaurant(restaurant) {
  console.log(restaurant);

  const {
    image,
    name,
    stars,
    kitchen,
    price,
    products,
    time_of_delivery: timeOfDelivery, //переписали переменную
  } = restaurant;

  const card = `
        <a class="card cardRestaurant" data-products="${products}"  data-info="${[name, price, stars, kitchen]}">
        <img src="${image}" alt="image" class="cardImage" />
        <div class="cardText">
            <div class="cardHeading">
                <h3 class="cardTitle">${name}</h3>
                <span class="cardTag tag">${timeOfDelivery} мин</span>
            </div>
            <div class="cardInfo">
                <div class="rating">
                ${stars}
                </div>
                <div class="price">От ${price} ₴</div>
                <div class="category">${kitchen}</div>
            </div>
        </div>
        </a>
    `;
  cardsRestaratunts.insertAdjacentHTML("beforeend", card);
}

//формировать карточку товара (пиццы)
function createCardGood({ description, image, name, price, id }) {
  const card = document.createElement("div");
  card.className = "card";
  console.log("card: ", card);
  //card.innerHTML = `
  //нет сериализации/десериализации (как в innerHtml)
  card.insertAdjacentHTML(
    "beforeend",
    `
            <img src="${image}" alt="image" class="cardImage"/>
            <div class="cardText">
                <div class="cardHeading">
                    <h3 class="cardTitle cardTitle-reg">${name}</h3>
                </div>
                <div class="cardInfo">
                    <div class="ingredients">${description}
                    </div>
                </div>
                <div class="card-buttons">
                    <button class="button buttonPrimary button-add-carriage" id="${id}">
                        <span class="button-cardText">В корзину</span>
                        <span class="buttonCarriageIcon"></span>
                    </button>
                    <strong class="card-price-bold">${price} ₴</strong>
                </div>
            </div>
        `
  );

  cardsMenu.insertAdjacentElement("beforeend", card);
}

//откривает меню ресторана
function openGoods(event) {
  const target = event.target;
  const restaurant = target.closest(".cardRestaurant");

  if (restaurant) {
    if (login) {
      const info = restaurant.dataset.info.split(",");

      const [name, price, stars, kitchen] = info;

      cardsMenu.textContent = "";
      //показывает меню при нажатиии на Лого
      containerPromo.classList.add("hide");
      restaurants.classList.add("hide");
      menu.classList.remove("hide");

      restaurantTitle.textContent = name;
      rating.textContent = stars;
      minPrice.textContent = `От ${price} ₴`;
      category.textContent = kitchen;

      getData(`./db/${restaurant.dataset.products}`).then(function (data) {
        data.forEach(createCardGood);
      });
    } else {
      toogleModalAuth();
    }
  }
}

// запускается фенкрия добавления в корзину
function addTocarriage(event) {
  const target = event.target;

  const buttonAddTocarriage = target.closest(".button-add-carriage");

  if (buttonAddTocarriage) {
    const card = target.closest(".card");
    const title = card.querySelector(".cardTitle-reg").textContent;
    const cost = card.querySelector(".card-price-bold").textContent;
    const id = buttonAddTocarriage.id;

    const food = carriage.find(function (item) {
      return item.id === id;
    });

    if (food) {
      food.count += 1;
    } else {
      carriage.push({
        id: id,
        title: title,
        cost: cost,
        count: 1,
      });
    }
  }
}

// создание полей товаров в корзине
function rendercarriage() {
  modalBody.textContent = "";

  carriage.forEach(function ({ id, title, cost, count }) {
    const itemcarriage = `
        <div class="foodRow">
            <span class="foodName">${title}</span>
            <strong class="foodPrice">${cost}</strong>
            <div class="foodCounter">
                <button class="counterButton counter-minus" data-id=${id}>-</button>
                <span class="counter">${count}</span>
                <button class="counterButton counter-plus" data-id=${id}>+</button>
            </div>
        </div>
    `;

    modalBody.insertAdjacentHTML("afterbegin", itemcarriage);
  });

  const totalPrice = carriage.reduce(function (result, item) {
    return result + parseFloat(item.cost) * item.count;
  }, 0);

  modalPricetag.textContent = totalPrice + " ₴";
}

// опреджиление клика миши + или - в корзине

function changeCount(event) {
  const target = event.target;

  if (target.classList.contains("counter-minus")) {
    const food = carriage.find(function (item) {
      return item.id === target.dataset.id;
    });
    food.count--;
    // условие если мунусуем товар до 0 он удаляется из корзини
    if (food.count === 0) {
      carriage.splice(carriage.indexOf(food), 1);
    }
    rendercarriage();
  }

  if (target.classList.contains("counter-plus")) {
    const food = carriage.find(function (item) {
      return item.id === target.dataset.id;
    });
    food.count++;
    rendercarriage();
  }
}

function init() {
  getData("./db/partners.json").then(function (data) {
    data.forEach(createCardRestaurant);
  });

  // навешиваем события  (event)
  carriageButton.addEventListener("click", function () {
    rendercarriage();
    toggleModal();
  });
  // кнопка отмена в Корзине
  buttonClearcarriage.addEventListener("click", function () {
    carriage.length = 0;
    rendercarriage();
  });

  modalBody.addEventListener("click", changeCount);

  cardsMenu.addEventListener("click", addTocarriage);

  close.addEventListener("click", toggleModal);

  cardsRestaratunts.addEventListener("click", openGoods);

  close.addEventListener("click", addTocarriage);

  logo.addEventListener("click", function () {
    // возвращает ресторани и промо при нажатиии на Лого ,скрывает меню
    containerPromo.classList.remove("hide");
    restaurants.classList.remove("hide");
    menu.classList.add("hide");
  });

  checkAuth();

  new Swiper(".swiper-container", {
    loop: true,
    autoplay: true,
    // slidePreview: 3
  });
}

init();
