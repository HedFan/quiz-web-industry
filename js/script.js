var cart = document.querySelectorAll('.js_card-item'),
    cartOne = document.querySelector('.js_card-item'),
    carts = document.querySelector('.js_play-arena'),
    btnGroup = document.querySelector('.js_card-btn'),
    nextBtn = document.querySelector('.js_next-btn'),
    showBtn = document.querySelector('.js_dtn-show'),
    imgCart = document.querySelector('.js_cart_img'),
    textBlock = document.querySelector('.js_text-block');

var text = 'Press and hold COMPARE or SHIFT to compare';




carts.onclick = function () {
    deselectAll();
    btnGroup.classList.add('show');
    textBlock.innerHTML = text;
};
for (var i = 0; i < cart.length; i++) {
    cart[i].onclick = function () {
        this.classList.add('select');
        this.classList.remove('unselect')
    }
}
rand();

function deselectAll() {
    for (var i = 0; i < carts.children.length; i++) {
        if (carts.children[i].classList.contains('select')) {

            // carts.children[i].classList.remove('select');
        }
        else {
            carts.children[i].classList.add('unselect');
        }

    }
}

showBtn.addEventListener("mousedown", function () {
    showBtnFunc()
});
showBtn.addEventListener("mouseup", function () {
    showBtnFunc()
});

function showBtnFunc() {
    for (var i = 0; i < carts.children.length; i++) {
        if (carts.children[i].classList.contains('select')) {
            carts.children[i].classList.add('unselect');
            carts.children[i].classList.remove('select');
        } else if (carts.children[i].classList.contains('unselect')) {
            carts.children[i].classList.remove('unselect');
            carts.children[i].classList.add('select');
        }
    }
}

nextBtn.onclick = function () {
    rand()
};

function rand() {
    var fileContent = 'images/photo.json';
    getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    var text2 = 'Select the design that is most correct';
    textBlock.innerHTML = text2;
    btnGroup.classList.remove('show');

    var arr = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': fileContent,
        'dataType': "json",
        'success': function (data) {
            arr = data;
        }

    });
    var lengthArr = arr.contents.length;

    var pp = getRandomInt(0, lengthArr-1);
    var tt1;
    var tt2;


    for (var i = 0; i < lengthArr; i++) {
        tt1 = "     <div class=\"card-item js_card-item\">\n" +
            "                    <img class=\"js_cart_img\" src=" + arr.contents[pp].RightPhoto + " alt=\"\">\n" +
            "                </div>";
        tt2 = "     <div class=\"card-item js_card-item\">\n" +
            "                    <img class=\"js_cart_img\" src=" + arr.contents[pp].WrongPhoto + " alt=\"\">\n" +
            "                </div>";
    }


    var cartsRand = getRandomInt(0, 1);
    var cartsA1 = [tt2, tt1];
    var cartsA2 = [tt1, tt2];
    var cartsAnswer = cartsA1, cartsA2;

    carts.innerHTML = tt1 + tt2;

    for (var i=0; i < cart.length; i++) {
        cart[i].onclick = function () {
            this.classList.remove('select');
            this.classList.remove('unselect');
        }
    }


}