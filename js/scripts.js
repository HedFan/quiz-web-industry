var contentSlider;
var url = parseUri(window.location.href);

$(window).on('load', function(){
    if (typeof(contentSlider) === 'object')
        contentSlider.resize();

    // подрубаем AOS анимации
    AOS.init({
        once: true,
        offset: 200
    });

    //прячем прелодер
    $('#preloader').fadeOut(300);

    setTimeout(function () {
        $('img.lazyload').trigger("appear");
    }, 1000);




    var loginBlock = JSON.parse($('#login-block-info').html());

    if (loginBlock) {
        if (loginBlock.hasOwnProperty('AUTH')) {
            $('.js_login-block--logout, .js_login-block--profile').removeClass('d-none');
            $('.js_login-block--login').addClass('d-none');
        }

        if (loginBlock.hasOwnProperty('BASKET')) {
            $('.js_login-block--basket-full').removeClass('d-none');
            $('.js_login-block--basket-empty').addClass('d-none');
        }
    }

});
$(document).ready(function ($) {
    // Включаем прелодер
    
    $('.js_to-top').click(function () {
        $('html, body').animate({
            scrollTop: 0
        }, 1000);
    });
    
    $('img.lazyload').show().lazyload({
        threshold: 200,
        effect : "fadeIn"
    });
    
    setTimeout(function(){
        $('img.lazyload').trigger('appear');
    },5000);
    
    $('.fancyDefault').fancybox();
    
    $('body').on('click','a.js_anchor-scroll',function (e) {
        var my_link = $(this);
        var scroll_to = $(my_link.attr('href'));
        $('html, body').animate({
            scrollTop: scroll_to.offset().top
        }, 1000);
        e.preventDefault();
        return false;
    });
    
    $.datepicker.setDefaults($.datepicker.regional['ru']);
    
    $('body').on('keyup change', 'input.error, textarea.error', function() {
       $(this).removeClass('error').prev('.group-item__error').remove();
    });
    
    
    // загрузка кастомизированной карты
    if ($('#js_map-holder').length > 0) {
        GM_main.init();
    }
    
    if ($('body').find('.js_content-slider').length > 0) {
        contentSlider = new ContentSlider($('.js_content-slider'));
        contentSlider.init();
    }
    /* Табы */
    var minHeightPaymentBox = 0;
    $("#order-tabs").tabs({
        activate: function( event, ui ) {
            $('.ui-tabs-tab').removeClass('ui-tabs-tab-prev ui-tabs-tab-next ui-tabs-tab-error');
    
            $('.ui-tabs-active').prevAll('.ui-tabs-tab').addClass('ui-tabs-tab-prev');
            $('.ui-tabs-active').nextAll('.ui-tabs-tab').addClass('ui-tabs-tab-next');
    
            /* валидация всех табов */
            $('.ui-tabs-tab-prev').each(function () {
                var currentStep = $(this).attr('aria-controls');
                selectorSteps(currentStep, 2);
            });
    
    
            if (ui.newTab.attr('aria-controls') == 'tabs-5') {
                /* размер информационного блока оплаты */
    
                if ($(document).width() > 991) {
                    var tmpHeight = 0,
                        count = $('#tabs-5').find('.order-payment__hidden-info').length;
    
                    $('.js_order-payment-info').append('<div class="tmpDiv"></div>');
    
                    $('.order-payment__hidden-info').each(function () {
    
                        $('.js_order-payment-info .tmpDiv').html($(this).html());
                        tmpHeight = $('.js_order-payment-info .tmpDiv').innerHeight();
    
    
                        if (tmpHeight > minHeightPaymentBox)
                            minHeightPaymentBox = tmpHeight;
    
                        if (!--count) {
                            $('.js_order-payment-info .tmpDiv').remove();
                            // $('.js_order-payment-info').height(minHeightPaymentBox + 65);
                            $('.js_order-payment-info').css('min-height', minHeightPaymentBox + 65);
                        }
                    });
                }
    
            }
        }
    });
    $(".js__order-tabs-disable").tabs( "disable" );
    /* Табы */
    
    /* переключатель шагов вперед */
    $('.js_order-next-step').click(function (e) {
        e.preventDefault();
        var currentStep = $(this).parents('.order-tab').attr('id');
    
        selectorSteps(currentStep);
    
    });
    
    function selectorSteps(currentStep, validatorType) {
        validatorType = validatorType || 1;
    
        if (currentStep == 'tabs-1') {
            if (validatorType == 1)
                $("#order-tabs").tabs("option", "active", 1);
            $('html, body').animate({
                scrollTop: $("#order-form").offset().top-50
            }, 300);
        } else if (currentStep == 'tabs-2') {
            var data = {};
            $('#tabs-2').find('input').each(function () {
                data[$(this).attr('name')] = $(this).val();
            });
            validator(data, 2, validatorType);
        } else if (currentStep == 'tabs-3') {
            var data = {};
            $('#tabs-3').find('input').each(function () {
                data[$(this).attr('name')] = $(this).val();
            });
            $('#tabs-3').find('textarea').each(function () {
                data[$(this).attr('name')] = $(this).val();
            });
            $('#tabs-3').find('select').each(function () {
                data[$(this).attr('name')] = $(this).find('option:selected').val();
            });
    
            validator(data, 3, validatorType);
        } else if (currentStep == 'tabs-4') {
            var data = {};
            $('#tabs-4').find('input[type="text"]').each(function () {
                data[$(this).attr('name')] = $(this).val();
            });
            $('#tabs-4').find('input[type="hidden"]').each(function () {
                data[$(this).attr('name')] = $(this).val();
            });
            $('#tabs-4').find('input[type="checkbox"]').each(function () {
                data[$(this).attr('name')] = $(this).val();
            });
            $('#tabs-4').find('select').each(function () {
                data[$(this).attr('name')] = $(this).find('option:selected').val();
            });
            validator(data, 4, validatorType);
        }
    }
    
    function validator(data, nextStep, validatorType) {
        validatorType = validatorType || 1;
    
        $.ajax({
            url: 'ajax.php',
            type: 'POST',
            dataType: 'json',
            data: {data: data, action: 'validator'},
        })
            .done(function (data) {
    
                if (validatorType == 1) {
                    if (data.result.status === true) {
                        $("#order-tabs").tabs("option", "active", nextStep);
                    } else {
                        var msg;
                        for (key in data.result.errors) {
                            if (!$('[name="'+key+'"]').hasClass('error'))
                                $('[name="'+key+'"]').addClass('error').before('<span class="group-item__error">'+ data.result.errors[key] +'</span>');
                        }
    
                        if (data.result.hasOwnProperty('popup')) {
                            showModalMessage(data.result.popup);
                        }
    
                        if (data.result.hasOwnProperty('user')) {
                            if ($('body').find('#popupLogIn').length > 0) {
                                $('body').find('#popupLogIn').remove();
                            }
                            $('body').append(data.result.user.html);
                            $('#popupLogIn').modal("show");
                        }
                    }
                    $('html, body').animate({
                        scrollTop: $("#order-form").offset().top-50
                    }, 300);
    
                } else {
                    if (data.result.status === false) {
                        $("#order-tabs .order-tabs-list li:eq("+ (nextStep - 1) +")").addClass('ui-tabs-tab-error');
                    }
                }
            })
            .fail(function () {
    
            });
    }
    
    /* переключатель шагов вперед */
    
    /* переключатель шагов назад */
    $('.js_order-prev-step').click(function (e) {
        e.preventDefault();
        var currentStep = $(this).parents('.order-tab').attr('id'),
            prevStep = $('.ui-tabs-tab[aria-controls="'+currentStep+'"]').index() - 1;
    
        $("#order-tabs").tabs("option", "active", prevStep);
    
        $('html, body').animate({
            scrollTop: $("#order-form").offset().top-50
        }, 300);
    });
    /* переключатель шагов назад */
    
    
    /* календарик */
    if ($( document ).width() < 576) {
        $('.js_datepicker').datepicker({
            numberOfMonths: [1, 1],
            minDate: 1
        });
    } else {
        $('.js_datepicker').datepicker({
            numberOfMonths: 2,
            minDate: 1
        });
    }
    /* календарик */
    
    /* время звоков и смс */
    $('.js_order-radio-button input').change(function () {
        var day = $(this).val(),
            timeStart = $(this).parents('.js_order-sender-time-holder').find('.js_order-spinner input:eq(0)').val(),
            timeEnd = $(this).parents('.js_order-sender-time-holder').find('.js_order-spinner input:eq(1)').val(),
            input = $(this).parents('.js_order-sender-time-holder').find('input[type="hidden"]');
    
        if (timeStart > timeEnd)
            timeStart = timeEnd;
    
        input.val(day + ', c ' + timeStart + ' до ' + timeEnd);
    });
    
    $('.js_order-sender-time-holder .js_order-spinner input').change(senderTimeChange);
    $('.js_order-sender-time-holder .js_order-spinner input').on( "spinchange", senderTimeChange);
    
    function senderTimeChange() {
        var day = $(this).parents('.js_order-sender-time-holder').find("input[type='radio']:checked").val(),
            timeStart = $(this).parents('.js_order-sender-time-holder').find('.js_order-spinner input:eq(0)').val(),
            timeEnd = $(this).parents('.js_order-sender-time-holder').find('.js_order-spinner input:eq(1)').val(),
            input = $(this).parents('.js_order-sender-time-holder').find('input[type="hidden"]');
    
        if (timeStart > timeEnd)
            timeStart = timeEnd;
    
        input.val(day + ', c ' + timeStart + ' до ' + timeEnd);
    }
    /* время звоков и смс */
    
    /* спинер (не тот, что в руках крутят) */
    $('.js_order-spinner input').spinner({
        min: 0,
        max: 24,
        spin: function(event, ui) {
        },
        change: function (event, ui) {
    
            var timeStart = $(this).parents('.js_order-spinner').find('input:eq(0)'),
                timeStartVal = parseInt(timeStart.val()),
                timeEnd = $(this).parents('.js_order-spinner').find('input:eq(1)'),
                timeEndVal = parseInt(timeEnd.val());
    
            if (timeStartVal < 0)
                timeStart.val(0);
            else if (timeStartVal > 24)
                timeStart.val(24);
    
            if (timeEndVal < 0)
                timeEnd.val(0);
            else if (timeEndVal > 24)
                timeEnd.val(24);
    
            if (timeStartVal > timeEndVal)
                timeStart.val(timeEnd.val());
    
        },
        stop: function( event, ui ) {
    
        }
    });
    /* спинер (не тот, что в руках крутят) */
    
    
    /* переключалки радиокнопок */
    $('.js_order-collapse-radio').each(function () {
        if (!$(this).find('input[type="radio"]').is(':checked')) {
            $(this).find('.js_order-collapse-radio-box').hide();
        }
    });
    $('.js_order-collapse-radio input[type="radio"]').change(function () {
        if ($(this).is(':checked')) {
            $('.js_order-collapse-radio').find('.js_order-collapse-radio-box').hide();
            $(this).parents('.js_order-collapse-radio').find('.js_order-collapse-radio-box').show();
        }
    });
    /* переключалки радиокнопок */
    
    /* время доставки */
    $('.js_delivery-time').change(deliveryTimeChange);
    $('.js_delivery-time').on( "spinchange", deliveryTimeChange);
    
    function deliveryTimeChange() {
        var timeStart = parseInt($('.js_delivery-time:eq(0)').val()),
            timeEnd = parseInt($('.js_delivery-time:eq(1)').val());
    
        if (timeStart > timeEnd)
            timeStart = timeEnd;
    
        $('input[name="date-no-call-time"]').val(timeStart + ' - ' + timeEnd);
    }
    /* время доставки */
    
    
    
    /* оформление заказа */
    $('#order-form').submit(function (e) {
        e.preventDefault();
    
        var data = $(this).serialize(),
            url = $(this).attr('action'),
            method = $(this).attr('method');
    
        $.ajax({
            url: url,
            method: method,
            data: data,
            dataType: "json"
        })
            .done(function (data) {
    
                if (data.status == true) {
                    window.location = "/lk/zakazy/payment.php?ORDER_ID="+data.order+"&PAYMENT_ID="+data.payment;
                    // alert('Новый заказ №' + data.order + ' оформлен');
                } else if ((data.status == false) && (data.hasOwnProperty('user'))) {
                    if (!$('body').find('#popupLogIn').length > 0) {
                        $('body').append(data.user.html);
                    }
                    $('#popupLogIn').modal("show");
                } else {
                    var msg;
                    for (key in data.errors) {
                        msg += key + ": " + data.errors[key] + "\n\r";
                    }
                    alert(msg);
                }
            })
            .fail(function () {
            })
            .always(function () {
            });
    });
    
    /* оформление заказа */
    
    
    /* изменение количества в корзине */
    var quantityChangeTimer;
    $('.js_order-form-quantity span').click(function (e) {
        e.preventDefault();
        var input = $(this).siblings('input'),
            value = parseInt(input.val()),
            direction = $(this).text(),
            productId = $(this).parents('.basket-item').data('item-id');
    
        if (direction === '+')
            value++;
        else if (direction === '-')
            value--;
    
        if (value === 0)
            value = 1;
    
        input.val(value);
        quantityChange(productId);
    });
    
    $('.js_order-form-quantity input').change(function (e) {
        var productId = $(this).parents('.basket-item').data('item-id');
    
        if ((parseInt($(this).val()) < 1) || (isNaN($(this).val())) )
            $(this).val(1);
        quantityChange(productId);
    });
    
    function quantityChange(productId) {
        clearTimeout(quantityChangeTimer);
        quantityChangeTimer = setTimeout(function () {
            var value = $('#order-form').find('div[data-item-id="' + productId + '"] input').val(),
                priceBox = $('#order-form').find('div[data-item-id="' + productId + '"] .js_price');
            $.ajax({
                url: "ajax.php",
                method: "POST",
                data: {productId: productId, value: value, 'action': 'quantity'},
                dataType: "json"
            })
    
                .done(function (data) {
                    priceBox.html(data['ITEM_PRICE']);
                    $('.js_total-price').html(data['FULL_PRICE']);
                })
                .fail(function () {
                })
                .always(function () {
                });
        }, 500);
    }
    /* изменение количества в корзине */
    
    
    /* удаление товара */
    $('.js_delete-product').click(function() {
        var productRow = $(this).parents('.basket-item'),
            productId = $(this).parents('.basket-item').data('item-id');
        $.ajax({
            url: "ajax.php",
            method: "POST",
            data: {productId: productId, 'action': 'delete'},
            dataType: "json"
        })
    
            .done(function (data) {
                if (data['PRODUCT_COUNT'] === 0) {
                    location.reload();
                } else {
                    productRow.remove();
                    $('.js_total-price').html(data['FULL_PRICE']);
                }
            })
            .fail(function () {
            })
            .always(function () {
            });
    });
    /* удаление товара */
    
    /* поле для купона */
    $('.js_cupon-field').click(function () {
        $(this).parent().toggleClass('hidden').find('input').focus();
    });
    $('.js_cupon-field').change(function() {
        $('.js_cupon-field').val($(this).val());
    });
    /* поле для купона */
    
    /* способы оплаты*/
    $('.js_order-payment').change(function () {
       var paymentInfo = $(this).siblings('.order-payment__hidden-info').html();
       $('.js_order-payment-info .order-payment__info-holder').html(paymentInfo);
    
       /* костыль для safari */
       setTimeout(function () {
           if ($('.js_order-payment-info .order-payment__info-holder').height() > minHeightPaymentBox) {
               minHeightPaymentBox = $('.js_order-payment-info .order-payment__info-holder').outerHeight();
               $('.js_order-payment-info').css('min-height', minHeightPaymentBox + 65);
           }
       }, 1);
    });
    /* способы оплаты*/
    
    /* согласие */
    $('#policy-input').change(function (e) {
       if ($(this).prop("checked")) {
           $('#order-form-submit').prop('disabled', false).removeClass('disabled');
       } else {
           $('#order-form-submit').prop('disabled', true).addClass('disabled');
       }
    });
    /* согласие */
    
    $('body').on('click', '.js_order-change-mail', function (e) {
        e.preventDefault();
        $('#message-modal').modal("hide");
        $('#popupLogIn').modal("hide");
        $('input[name="sender-email"]').focus();
    });
    // напоминалки в личном кабинете
    
    $('.js_lk-reminder-delete').click(function() {
        if (confirm("Точно удалить?")) {
            var reminderItem = $(this).parents('.js_lk-reminder-item'),
                reminderId = reminderItem.data('event-id');
            $.ajax({
              url: 'ajax.php',
              type: 'POST',
              dataType: 'json',
              data: {action: 'delete', reminderId: reminderId},
            })
            .done(function(data) {
                if (data.status === true) {
                    reminderItem.remove();
                    alert(data.message);
    
                } else {
                    alert(data.error);
                }
            })
            .fail(function() {
              console.log("error");
            })
            .always(function() {
              console.log("complete");
            });
        }
    });
    
    $('.js_datepicker-reminder').datepicker({
        changeMonth: true,
        changeYear: true,
        minDate: 1
    });
    // профиль в личном кабинете
    $('#lk-profile button[type="reset"]').click(function (e) {
        e.preventDefault();
        window.location.href = '/lk/profil/';
    });
    
    $('#lk-profile').submit(function (e) {
       e.preventDefault();
    
       var formData = $(this).serialize();
    
       $.ajax({
         url: 'ajax.php',
         type: 'POST',
         dataType: 'json',
         data: formData,
       })
       .done(function(data) {
         if (data.status === true)
             alert(data.message);
         else
             alert(JSON.stringify(data.error));
       })
       .fail(function() {
         console.log("error");
       })
       .always(function() {
         console.log("complete");
       });
    });
    $('.js_slider-landing .js_slider-list').slick({
        dots: true,
        dotsClass: 'slider-landing__dots',
        customPaging : function(slider, i) {
            return '<span class="slider-landing__dot-item"></span>';
        },
        prevArrow: $('.js_slider-landing .js_to-left'),
        nextArrow: $('.js_slider-landing .js_to-right'),
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        pauseOnDotsHover: true,
    });
    $('body').on('click','.js_show-form-contacts',function () {
        $('#modal-contacts').modal('show');
    });
    
    $('body').on('submit', '.order-form form', function (e) {
        e.preventDefault();
        form_send('.order-form', 'json');
        return false;
    });
    $('#custom-bouquet').submit(function (e) {
        e.preventDefault();
    
    
        var data = $(this).serialize();
    
        $.ajax({
            url: 'ajax.php',
            type: 'POST',
            dataType: 'json',
            data: data,
        })
            .done(function (data) {
                if (data.status === true) {
                    $('.js_message-form').html(data['message']);
                    $('#custom-bouquet').slideUp();
                } else {
                    $('.js_message-form').html(data['error_message']);
    
                    udpdateCaptcha($('#custom-bouquet'));
    
                    $('html, body').animate({
                        scrollTop: $('.js_message-form').offset().top
                    }, 300);
                }
            })
            .fail(function () {
                console.log("error");
            })
            .always(function () {
                console.log("complete");
            });
    
    });
    
    $('.js_datepicker-custom-bouquet').datepicker({
        changeMonth: true,
        changeYear: true,
        minDate: 1
    });
    if ( (url.queryKey.hasOwnProperty('set_filter')) || (url.queryKey.hasOwnProperty('del_filter')) ) {
        $('html, body').animate({
            scrollTop: $("#catalog").offset().top
        }, 0);
    }
    
    if (!url.queryKey.hasOwnProperty('set_filter')) {
        Cookies.set('filterValuesID', false);
        $('.filter__values--active').removeClass('filter__values--active');
    }
    
    $('.js__filter-title').click(function (e) {
        e.preventDefault();
        var id = $(this).data('filter-title'),
            valuesBox = $('.js__filter-values').find('div[data-filter-values="' + id + '"]');
    
        if ($(this).hasClass('filter__item-holder--active')) {
            closeFilterTab(id);
        } else {
            $('.js__filter-title').each(function (e) {
                let id = $(this).data('filter-title');
                closeFilterTab(id);
            });
    
            $('.filter__values--active').removeClass('filter__values--active');
    
            $(this).addClass('filter__item-holder--active');
            valuesBox.addClass('filter__values--active');
    
            if ($(window).width() < 576) {
                $('html, body').animate({
                    scrollTop: $('.js__filter-values').offset().top
                }, 300);
            }
    
        }
    
        filterBottonDisplay();
    });
    
    $('#del_filter').click(function () {
        Cookies.set('filterValuesID', false);
    });
    
    
    var filterValuesID = Cookies.get('filterValuesID');
    
    if (filterValuesID !== undefined) {
        $('.js__filter-title[data-filter-title="' + filterValuesID + '"]').addClass('filter__item-holder--active');
    
    }
    
    $('.js__filter-values input').change(function (e) {
        let id = $(this).parents('.filter__values').data('filter-values');
    
        filterTabSetSelected(id);
    });
    
    $('.js__filter-values').on('click', '.disabled', function(e) {
        e.preventDefault();
    });
    
    
    
    function filterTabSetSelected(index) {
        let titleBox = $('.js__filter-title[data-filter-title="' + index + '"]');
    
        if ($('.js__filter-values .filter__values[data-filter-values="' + index + '"] input:checked').length > 0) {
            titleBox.addClass('filter__item-holder--selected');
            Cookies.set('filterValuesID', index);
        }
    }
    
    
    function filterBottonDisplay() {
        if ($('.filter__item-list').find('.filter__item-holder--active').length > 0) {
            $('.filter__buttons').addClass('filter__buttons--active');
        } else {
            $('.filter__buttons').removeClass('filter__buttons--active');
        }
    }
    
    function closeFilterTab(index) {
        let titleBox = $('.js__filter-title[data-filter-title="' + index + '"]');
    
        if ($('.js__filter-values .filter__values[data-filter-values="' + index + '"] input:checked').length > 0) {
            titleBox.addClass('filter__item-holder--selected');
        } else {
            titleBox.removeClass('filter__item-holder--selected');
        }
    
        titleBox.removeClass('filter__item-holder--active');
        $('.js__filter-values .filter__values[data-filter-values="' + index + '"]').removeClass('filter__values--active');
    }
    advantageListSort();
    $('.js_mobile-menu-trigger').click(function (e) {
        e.preventDefault();
        $('.js_slide-menu').slideToggle();
    });
    
    $('.js_add-menu-parent').click(function (e) {
        e.preventDefault();
        $(this).next('.add-menu__sub-menu').slideToggle();
    });
    $('.js__catalog-detail-price-radio').change(function (e) {
        let link = $(this).siblings('a').attr('href');
        $('.js__catalog-detail-price-radio').parents('.catalog-detail__price-list__item').removeClass('active');
        $(this).parents('.catalog-detail__price-list__item').addClass('active');
        $('.js_catalog-detail-buy-button a').attr('href', link);
    });
    
    /* выбор второго SKU на детальной странице каталога */
    if ($('body').find('.catalog-detail__price-list__item').length > 2) {
        $('.catalog-detail__price-list__item:eq(1) label').click();
    } else if ($('body').find('.catalog-detail__price-list__item').length === 1) {
        $('.catalog-detail__price-list__item:eq(0) label').click();
    }
    
    $('.js_additional-catalog-list-item').click(function (e) {
        e.preventDefault();
        $('.js_additional-catalog-list-item').removeClass('active');
        $(this).addClass('active');
    });
    $('.js_additional-catalog-list-item-link').click(function (e) {
        e.stopPropagation();
    });
    
    $('.catalog-detail__price-list').on('click', '.catalog-detail__price-list__item.active', function (e) {
        e.preventDefault();
        var id = $(this).find('input[name="order-product"]').val();
        metricsClick('buketToBasket', 'click', 'buketToBasket');
        window.location.href = $(this).find('a').attr('href');
    });
    // Форма оставить отзыв
    $('.js_btn-review').on('click', function () {
        $('#popap-feedback').modal('show');
    });
    $('#popap-feedback .popap-close').on('click', function () {
        $('#popap-feedback').modal('hide');
    });
    
    $(document).on('submit', '#js_consult-form form', function (e) {
        e.preventDefault();
        form_send('#js_consult-form', 'json');
        return false;
    });
    
    // форма купить в один клик
    $('.js_buy-one-click').on('click', function () {
        var id = $(this).attr('data-id');
        metricsClick('buyOneClick', 'click', 'buyOneClick');
        $('#one-click-form').modal('show');
        var buket = $(this).data('buket');
        $('.js_one-click-buket').val(buket);
        $('.js_one-click-link').val(location.href);
    });
    $('#one-click-form .popap-close').on('click', function () {
        $('#one-click-form').modal('hide');
    });
    
    $('body').on('submit', '#js_one-click-form form', function (e) {
        e.preventDefault();
        form_send('#js_one-click-form', 'json');
        return false;
    });
    
    // Форма в модалке с посадочной
    $(document).on('click', '.js_open-landing-form', function (e) {
        var serviceName = $(this).data('name'),
            serviceLink = $(this).data('link');
        $('#modal-landing-call').modal('show');
        $('#service-name').val(serviceName);
        $('#service-link').val(serviceLink);
    });
    
    $('body').on('submit', '#js_landing-call-form form', function (e) {
        e.preventDefault();
        form_send('#js_landing-call-form', 'json');
        return false;
    });
    
    $('body').on('submit', '#js_landing-service-form form', function (e) {
        e.preventDefault();
        form_send('#js_landing-service-form', 'json');
        return false;
    });
    
    /**
     *  Формы в разделе Обучение (мастер-классы)
     */
    $('.js_school-record').on('click', function (e) {
        e.preventDefault();
        var mkName = this.getAttribute('data-name');
        var mkLink = this.getAttribute('data-link');
        document.getElementById('mk-name').value = mkName;
        document.getElementById('mk-link').value = mkLink;
        $('#modal-school-order').modal('show');
    });
    $('.js_school-review').on('click', function (e) {
        e.preventDefault();
        var mkName = this.getAttribute('data-name');
        var mkLink = this.getAttribute('data-link');
        document.getElementById('mk-name-review').value = mkName;
        document.getElementById('mk-link-review').value = mkLink;
        $('#modal-school-review').modal('show');
    });
    $('#modal-school-review .popap-close').on('click', function () {
        $('#modal-school-review').modal('hide');
    });
    $('#modal-school-order .popap-close').on('click', function () {
        $('#modal-school-order').modal('hide');
    });
    
    $('body').on('submit', '#modal-school-order form', function (e) {
        e.preventDefault();
        form_send('#modal-school-order', 'json');
        return false;
    });
    
    $('body').on('submit', '#modal-school-review form', function (e) {
        e.preventDefault();
        form_send('#modal-school-review', 'json');
        return false;
    });
    /**
     *  Формы в разделе Портфолио
     */
    $('.js_portfolio-call').on('click', function (e) {
        e.preventDefault();
        var pfName = this.getAttribute('data-name');
        var pfLink = this.getAttribute('data-link');
        document.getElementById('pf-name-call').value = pfName;
        document.getElementById('pf-link-call').value = pfLink;
        $('#modal-portfolio-call').modal('show');
    });
    $('#modal-portfolio-call .popap-close').on('click', function () {
        $('#modal-portfolio-call').modal('hide');
    });
    
    $('body').on('submit', '#modal-portfolio-call form', function (e) {
        e.preventDefault();
        form_send('#modal-portfolio-call', 'json');
        return false;
    });
});
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};


function dump(text, title) {
    console.log('–––––––––––––––');
    if (title) {
        console.log(title + ":");
    }
    if (text) {
        console.log(text);
    }
    console.log('–––––––––––––––');
}

function randomInteger(min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
}

function simple_ajax(url) {
    var data = {
        "ID": "1"
    }
    $.ajax({
        url: url,
        type: "POST",
        dataType: "HTML",
        data: data,
    })
        .done(function (data) {
            console.log('запрос прошел');
            console.log(data);
        })
        .fail(function () {
            console.log('запрос не прошел');
        }).always(function () {
        console.log('simple_ajax сработал');
    });
}


//  загрузка файла в битрикс, через input[type=file]
function loadFile(event, callback) {
    event.stopPropagation();
    event.preventDefault();

    var files = event.target.files;
    var data = new FormData();

    $.each(files, function (key, value) {
        data.append(key, value);
    });

    data_ret = $.ajax({
        url: '/ajax/loadFile.php?files',
        type: 'POST',
        data: data,
        cache: false,
        async: false,
        dataType: 'json',
        processData: false,
        contentType: false,
    }).done(function (answer) {

    }).fail(function (answer) {
    }).always(function (answer) {
        callback();
    });

    return jQuery.parseJSON(data_ret.responseText);
}

//отправка формы
// form_selector - селектор блока
// answer_type - ожидаемый тип ответа ( html, json )
// предпологается что внутри этого блока есть:
// .js_message-box - для вывода ответа
// form  - форма данные из которой отправляются
// все инпуты оформлены в .js_group-item и у них есть data-req и data-reqmess
// есть action и method
function form_send(form_selector, answer_type) {

    var my_form_holder = $(form_selector);
    var my_form = my_form_holder.find('form');
    var result_block = my_form_holder.find('.js_message-box');

    my_form.find('.js_group-item').removeClass('group-item--failed-input');
    result_block.removeClass('fail');
    var fine = 1;
    var data = my_form.serialize();
    let formReturn = false;

    if (!answer_type) {
        var answer_type = 'json';
    } else {
        var answer_type = answer_type;
    }

    if (!my_form.attr('method')) {
        var method = 'POST';
    } else {
        var method = my_form.attr('method');
    }

    if (!my_form.attr('action')) {
        var url = '/ajax/simple.php';
    } else {
        var url = my_form.attr('action');
    }

    result_block.html('');

    my_form.find('.js_group-item').each(function () {
        var my_item = $(this);
        var my_input = $(this).find('input:not(":file"),textarea,select');
        var req = my_item.data('req');
        var reqmess = my_item.data('reqmess');
        var textError = $(this).find('.js_text-error');

        if (my_input.is(':checkbox')) {
            if (parseInt(req) == 1 && !my_input.is(':checked')) {
                my_item.addClass('group-item--failed-input');
                textError.html(reqmess);
                textError.show();
                fine = 0;
            }
            else {
                my_item.removeClass('group-item--failed-input');
                textError.empty();
                textError.hide();
            }
        } else if (my_input.is('select')) {
            if (parseInt(req) == 1 && my_input.val() == null) {
                my_item.addClass('group-item--failed-input');
                textError.html(reqmess);
                textError.show();
                fine = 0;
            }
        } else if (my_input.val() == null && parseInt(req) == 1) {
            my_item.addClass('group-item--failed-input');
            textError.html(reqmess);
            textError.show();
            fine = 0;
        }

        else if (parseInt(req) == 1 && my_input.val() == '') {

            my_item.addClass('group-item--failed-input');
            textError.html(reqmess);
            textError.show();
            fine = 0;
        }

        my_input.on('keypress', (function () {
            my_item.removeClass('group-item--failed-input');
            textError.empty();
            textError.hide();
        }));

        my_item.on('change', (function () {
            textError.empty();
            textError.hide();
            my_item.removeClass('group-item--failed-input');
        }));


    });

    if (fine) {
        $.ajax({
            url: url,
            type: method,
            dataType: answer_type,
            data: data,
        })
            .done(function (answer) {
                result_block.html('');
                if (answer.status == 1) {
                    result_block.html(answer.message);
                    my_form[0].reset();
                    my_form.slideUp();
                    setTimeout(function () {
                        $('#popap-feedback').modal('hide');

                    }, 4000);
                } else {
                    result_block.html(answer.message);
                }

            })
            .fail(function () {
                console.log("error");
                result_block.html("Произошла ошибка при отправке, попробуйте позже");

                formReturn = false;

                //функционал для обращения в конкретный инпут (по атрибуту name )
                //
                // var failed_input = 'name';
                // var failed_text_new = 'Не верно е имя ( слишком короткое )';
                // var failed_field = my_form_holder.find('[name="'+failed_input+'"]').parent();
                // дальше либо пишем в data-reqmess и выводим, либо сразу в поле ошибки

            }).always(function () {
            udpdateCaptcha(my_form_holder);
        });


    } else {
        result_block.addClass('fail');
        formReturn = false;
    }
    return formReturn;
}

// обновляем капчу у формы
function udpdateCaptcha(selector) {
    var my_form_holder = selector;
    var data = {
        "ID": "1"
    }
    var url = "/ajax/ajax-update-captcha.php";
    $.ajax({
        url: url,
        type: "POST",
        dataType: "HTML",
        data: data,
    })
        .done(function (data) {
            my_form_holder.find('.js_recaptcha-holder').html(data);
            Recaptchafree.reset();
        })
        .fail(function () {
            console.log('запрос не прошел');
        }).always(function () {
        console.log('simple_ajax сработал');
    });


}


// кастомизированная карта гугла - https://habrahabr.ru/post/324880/
var GM_main = {
    init: function () {
        this.initCache();
        this.initMap();
    },
    initCache: function () {
        this.$body = $('body');
        this.$popupContent = $('.marker1');
    },
    initMap: function () {

        var coordinates = {lat: 59.940646, lng: 30.391026},
            cordMarker1 = {lat: 59.940646, lng: 30.391026},
            popupContent = this.$popupContent.html(),
            zoom = 17,

            map = new google.maps.Map(document.getElementById('js_map-holder'), {
                center: coordinates,
                zoom: zoom,
                scrollwheel: false
            }),

            infowindow1 = new google.maps.InfoWindow({
                content: "Санкт-Петербург ул. Новгородская, д. 23 БЦ Базель, офис 314"
            }),

            marker1 = new google.maps.Marker({
                position: cordMarker1,
                map: map,
            });


        marker1.addListener('click', function () {
            infowindow1.open(map, marker1);
        });


    }
};
// полифилы для гугл карты
function PointerEventsPolyfill(options) {
    // set defaults
    this.options = {
        selector: '*',
        mouseEvents: ['click', 'dblclick', 'mousedown', 'mouseup'],
        usePolyfillIf: function () {
            if (navigator.appName == 'Microsoft Internet Explorer') {
                var agent = navigator.userAgent;
                if (agent.match(/MSIE ([0-9]{1,}[\.0-9]{0,})/) != null) {
                    var version = parseFloat(RegExp.$1);
                    if (version < 11)
                        return true;
                }
            }
            return false;
        }
    };
    if (options) {
        var obj = this;
        $.each(options, function (k, v) {
            obj.options[k] = v;
        });
    }

    if (this.options.usePolyfillIf())
        this.register_mouse_events();
}
// singleton initializer
PointerEventsPolyfill.initialize = function (options) {
    if (PointerEventsPolyfill.singleton == null)
        PointerEventsPolyfill.singleton = new PointerEventsPolyfill(options);
    return PointerEventsPolyfill.singleton;
};
// handle mouse events w/ support for pointer-events: none
PointerEventsPolyfill.prototype.register_mouse_events = function () {
    // register on all elements (and all future elements) matching the selector
    $(document).on(this.options.mouseEvents.join(" "), this.options.selector, function (e) {
        if ($(this).css('pointer-events') == 'none') {
            // peak at the element below
            var origDisplayAttribute = $(this).css('display');
            $(this).css('display', 'none');

            var underneathElem = document.elementFromPoint(e.clientX, e.clientY);

            if (origDisplayAttribute)
                $(this)
                    .css('display', origDisplayAttribute);
            else
                $(this).css('display', '');

            // fire the mouse event on the element below
            e.target = underneathElem;
            $(underneathElem).trigger(e);

            return false;
        }
        return true;
    });
};


function showModalMessage(body, title) {
    if (title === undefined) {
        $('#message-modal .modal-header').hide();
    } else {
        $('#message-modal .modal-header').show().find('.modal-title').html(title);
    }

    if (body === undefined) {
        $('#message-modal .modal-body').hide();
    } else {
        $('#message-modal .modal-body').show().html(body);
    }

    $('#message-modal').modal("show");
}


function ContentSlider(container) {

    this.container = container;

    this.itemsCount = this.container.find('.content-slider__item').length;
    this.nextPictureWidthMarig = 0;
    this.prevPictureWidthMarig = 0;
    this.halfWidthBox = 320;
    this.visiblePartPicture = 54;
    this.animationSpeed = 500;


    var self = this;

    this.init = function() {

        self.setSize();

        var containreHeight = 0,
            itemHeight = 0;

        self.container.find('.content-slider__item').each(function () {
            itemHeight = $(this).height();
            if (itemHeight > containreHeight) {
                containreHeight = itemHeight;
                container.css('min-height', containreHeight);
            }
        });

        if (self.container.find('.active').length === 0) {
            if (this.itemsCount > 3) {
                self.container.find('.content-slider__item').eq(0).addClass('active');
                self.container.prepend(self.container.find('.content-slider__item').eq(self.itemsCount - 1));
                self.container.find('.active').prev().addClass('prev');
                self.container.find('.active').next().addClass('next');
            } else if (this.itemsCount == 3) {
                self.container.find('.content-slider__item').eq(0).addClass('active');
                self.container.prepend(self.container.find('.content-slider__item').eq(self.itemsCount - 1));
                self.container.find('.active').prev().addClass('prev');
                self.container.find('.active').next().addClass('next');
            } else {
                self.container.find('.content-slider__item').eq(0).addClass('active');
                self.container.find('.active').prev().addClass('prev');
                self.container.find('.active').next().addClass('next');
            }
        }

        self.container.find('.active').css({
            'left': '50%',
            'margin-left': '-' + self.halfWidthBox + 'px'
        });

        self.prevPictureWidthMarig = -1 * (self.halfWidthBox + self.container.find('.prev').find('.content-slider__picture img').width() / 2 - self.visiblePartPicture);
        self.container.find('.prev').css({
            'left': '0%',
            'margin-left': self.prevPictureWidthMarig
        });

        self.nextPictureWidthMarig = -1 * (self.halfWidthBox - self.container.find('.next').find('.content-slider__picture img').width() / 2 + self.visiblePartPicture);
        self.container.find('.next').css({
            'left': '100%',
            'margin-left': self.nextPictureWidthMarig
        });

        self.container.on('click', '.next .content-slider__picture img', self.next);
        self.container.on('click', '.prev .content-slider__picture img', self.prev);


        self.swipeInit();

    };

    this.next = function(e) {
        e.preventDefault();

        if (self.container.hasClass('on-progress'))
            return false;
        self.container.addClass('on-progress');


        var tmpWidth = 0; // workaround


        if (self.itemsCount > 3) {
            // проверяем, хватает ли элементов справа
            if (self.container.find('.next').next().length === 0)
                self.container.append(self.container.find('.content-slider__item').eq(0));
            self.container.find('.prev').prev().css('left', '200%')
        } else if (self.itemsCount == 3) {
            // проверяем, хватает ли элементов справа
            if (self.container.find('.next').next().length === 0) {
                tmpWidth = self.container.find('.content-slider__item').eq(0).find('img').width();

                self.container.find('.content-slider__item').eq(0)
                    .addClass('remove')
                    .clone()
                    .removeClass('remove prev')
                    .css({
                        'left': "200%",
                        'margin-left': 0
                    }).appendTo( self.container );

            }
            self.container.find('.prev').prev().css('left', '200%');

        } else {
            if (self.container.find('.next').length === 0)
                return false;
        }


        self.container.find('.prev').addClass('animated').css('left', '-100%');
        self.container.find('.prev .content-slider__item-content').css('opacity', '0');

        self.prevPictureWidthMarig = -1 * (self.halfWidthBox + self.container.find('.active .content-slider__picture img').width() / 2 - self.visiblePartPicture);

        self.container.find('.active').addClass('animated').css({
            'left': '0',
            'margin-left': self.prevPictureWidthMarig
        });
        self.container.find('.active .content-slider__item-content').css('opacity', '0');


        self.container.find('.next').addClass('animated').css({
            'left': '50%',
            'margin-left': '-' + self.halfWidthBox + 'px'
        });
        self.container.find('.next .content-slider__item-content').css('opacity', '1');



        self.container.find('.next').next().css('left', '200%');

        if (tmpWidth > 0)
            self.nextPictureWidthMarig = -1 * (self.halfWidthBox - tmpWidth / 2 + self.visiblePartPicture);
        else
            self.nextPictureWidthMarig = -1 * (self.halfWidthBox - self.container.find('.next').next().find('.content-slider__picture img').width() / 2 + self.visiblePartPicture);


        self.container.find('.next').next().addClass('animated').css({
            'left': '100%',
            'margin-left': self.nextPictureWidthMarig
        });

        setTimeout(function () {
            self.container.find('.remove').remove();

            self.setClass('prev');

            self.swipeInit();

        }, self.animationSpeed);


    };

    this.prev = function(e) {
        e.preventDefault();


        if (self.container.hasClass('on-progress'))
            return false;
        self.container.addClass('on-progress');

        var tmpWidth = 0; // workaround


        if (self.itemsCount > 3) {
            // проверяем, хватает ли элементов слева
            if (self.container.find('.prev').prev().length === 0)
                self.container.prepend(self.container.find('.content-slider__item').eq(self.itemsCount - 1));
            self.container.find('.prev').prev().css('left', '-100%');
        } else if (self.itemsCount == 3) {

            // проверяем, хватает ли элементов справа
            if (self.container.find('.prev').prev().length === 0) {

                tmpWidth = self.container.find('.content-slider__item').eq(self.itemsCount - 1).find('img').width();

                self.container.find('.content-slider__item').eq(self.itemsCount - 1)
                    .addClass('remove')
                    .clone()
                    .removeClass('remove prev next')
                    .css({
                        'left': '-100%',
                        'margin-left': 0
                    }).prependTo( self.container );

            }

        } else {
            if (self.container.find('.prev').length === 0)
                return false;
        }


        self.container.find('.next').addClass('animated').css('left', '200%');
        self.container.find('.next .content-slider__item-content').css('opacity', '0');

        self.nextPictureWidthMarig = -1 * (self.halfWidthBox - self.container.find('.active .content-slider__picture img').width() / 2 + self.visiblePartPicture);
        self.container.find('.active').addClass('animated').css({
            'left': '100%',
            'margin-left': self.nextPictureWidthMarig
        });
        self.container.find('.active .content-slider__item-content').css('opacity', '0');


        self.container.find('.prev').addClass('animated').css({
            'left': '50%',
            'margin-left': '-' + self.halfWidthBox + 'px'
        });
        self.container.find('.prev .content-slider__item-content').css('opacity', '1');

        if (tmpWidth > 0) {
            self.prevPictureWidthMarig = -1 * (self.halfWidthBox + tmpWidth / 2 - self.visiblePartPicture);
        } else {
            self.prevPictureWidthMarig = -1 * (self.halfWidthBox + self.container.find('.prev').prev().find('.content-slider__picture img').width() / 2 - self.visiblePartPicture);
        }
        self.container.find('.prev').prev().addClass('animated').css({
            'left': '0%',
            'margin-left': self.prevPictureWidthMarig
        });

        setTimeout(function () {
            self.container.find('.remove').remove();

            self.setClass('next');

            self.swipeInit();

        }, self.animationSpeed);

    };

    this.setSize = function() {
        if ($( window ).width() < 576) {
            self.visiblePartPicture = 15;
            self.halfWidthBox = this.container.find('.content-slider__item').eq(1).width() * 0.5;
        } else if ( ($( window ).width() >= 576) && ($( window ).width() < 768)) {
            self.visiblePartPicture = 30;
            self.halfWidthBox = this.container.find('.content-slider__item').eq(1).width() * 0.5;
        } else if ($( window ).width() >= 768) {
            self.visiblePartPicture = 30;
            self.halfWidthBox = this.container.find('.content-slider__item').eq(1).width() * 0.5;
        }
    };

    this.resize = function() {
        self.container.off('click', '.next .content-slider__picture img');
        self.container.off('click', '.prev .content-slider__picture img');

        self.setSize();
        self.init();
    };

    this.swipeInit = function() {
        self.container.swipe( {
            swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
                if (direction == 'left') {
                    self.next(event);
                } else if (direction == 'right') {
                    self.prev(event);
                }

            }
        });
    };

    this.setClass = function (direction) {
        self.container.find('.content-slider__item').removeClass('animated next prev');

        if (direction == 'next')
            self.container.find('.active').removeClass('active').prev().addClass('active');
        else if (direction == 'prev')
            self.container.find('.active').removeClass('active').next().addClass('active');


        self.container.find('.active').prev().addClass('prev');
        self.container.find('.active').next().addClass('next');

        self.container.removeClass('on-progress');
    };
}

function advantageListSort() {
    if ($('body').find('#advantages-add').length === 0)
        return false;

    if ( ($(window).width() >= 768) && ($(window).width() < 992) ) {
        if ($('.js_advantage-part-2').find('.advantages-list__item-holder').length === 3) {
            let box = $('.js_advantage-part-2 .advantages-list__item-holder').first();
            $('.js_advantage-part-1').append(box);
        }
    } else {
        if ($('.js_advantage-part-1').find('.advantages-list__item-holder').length === 3) {
            let box = $('.js_advantage-part-1 .advantages-list__item-holder').last();
            $('.js_advantage-part-2').prepend(box);
        }
    }
}


function metricsClick(ya_id, ga_type, ga_id) {
    if(typeof(yaCounter48275270) != 'undefined') {
        yaCounter48275270.reachGoal(ya_id);
        ga('send', 'event', ga_type, ga_id);
        return true;
    }
}
var scrollPos = 0;
$(window).on('scroll', function(){
    var st = $(this).scrollTop();
    if (st > scrollPos){
        $('.js_to-top ').removeClass('show');
    } else {
        if(st > 100){
            $('.js_to-top ').addClass('show');
        }
    }
    scrollPos = st;
});
$(window).on('resize', function(){
    clearTimeout(window.resizedFinished);
    window.resizedFinished = setTimeout(function () {
        AOS.refresh();

        if (typeof(contentSlider) === 'object')
            contentSlider.resize();

        advantageListSort();
    }, 250);
});
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
tag.async = "true";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var textualAddblockVideo;
function onYouTubeIframeAPIReady() {
    textualAddblockVideo = new YT.Player('textual-addblock__video-holder', {
        height: '418',
        width: '778',
        videoId: 'wPoFo8Jcv-g',
        events: {
            'onReady': onPlayerReady
        }
    });

    function onPlayerReady(){
        $('.textual-addblock__video-holder .video-holder__btn').click(function(e){
            $(this).parent('.video-holder__prev').fadeOut(1000);
            textualAddblockVideo.playVideo();
        });
    }

}
//# sourceMappingURL=scripts.js.map
