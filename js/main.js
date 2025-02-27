let inputBox = document.querySelector(".input-box"),
    searchIcon = document.querySelector(".icon"),
    closeIcon = document.querySelector(".close-icon"),
    input = document.querySelector(".input");
searchIcon.addEventListener("click", () => inputBox.classList.add("open"));
closeIcon.addEventListener("click", () => inputBox.classList.remove("open"));
searchIcon.addEventListener("click", () => input.classList.add("open"));
closeIcon.addEventListener("click", () => input.classList.remove("open"));

// ========================================================== Меню бургер ===============================================
let bodyLockStatus = true;
let bodyLock = (delay = 500) => {
    let body = document.querySelector("body");
    if (bodyLockStatus) {
        let lock_padding = document.querySelectorAll("[data-lp]");
        for (let index = 0; index < lock_padding.length; index++) {
            const el = lock_padding[index];
            el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
        }
        body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
        document.documentElement.classList.add("lock");

        bodyLockStatus = false;
        setTimeout(function () {
            bodyLockStatus = true;
        }, delay);
    }
}

let bodyLockToggle = (delay = 500) => {
    if (document.documentElement.classList.contains('lock')) {
        bodyUnlock(delay);
    } else {
        bodyLock(delay);
    }
}

let bodyUnlock = (delay = 500) => {
    let body = document.querySelector("body");
    if (bodyLockStatus) {
        let lock_padding = document.querySelectorAll("[data-lp]");
        setTimeout(() => {
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = '0px';
            }
            body.style.paddingRight = '0px';
            document.documentElement.classList.remove("lock");
        }, delay);
        bodyLockStatus = false;
        setTimeout(function () {
            bodyLockStatus = true;
        }, delay);
    }
}

function menuInit() {
    if (document.querySelector(".icon-menu")) {
        document.addEventListener("click", function (e) {
            if (bodyLockStatus && e.target.closest('.icon-menu')) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
            }
        });
    };
}
function menuOpen() {
    bodyLock();
    document.documentElement.classList.add("menu-open");
}
function menuClose() {
    bodyUnlock();
    document.documentElement.classList.remove("menu-open");
}

menuInit();

// ====================================================================== Dynamic Adaptive =======================================

class DynamicAdapt {
	constructor(type) {
		this.type = type
	}
	init() {
		// масив об'єктів
		this.оbjects = []
		this.daClassname = '_dynamic_adapt_'
		// масив DOM-елементів
		this.nodes = [...document.querySelectorAll('[data-da]')]

		// наповнення оbjects об'єктами
		this.nodes.forEach((node) => {
			const data = node.dataset.da.trim()
			const dataArray = data.split(',')
			const оbject = {}
			оbject.element = node
			оbject.parent = node.parentNode
			оbject.destination = document.querySelector(`${dataArray[0].trim()}`)
			оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : '767'
			оbject.place = dataArray[2] ? dataArray[2].trim() : 'last'
			оbject.index = this.indexInParent(оbject.parent, оbject.element)
			this.оbjects.push(оbject)
		})

		this.arraySort(this.оbjects)

		// масив унікальних медіа-запитів
		this.mediaQueries = this.оbjects
			.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint}px),${breakpoint}`)
			.filter((item, index, self) => self.indexOf(item) === index)

		// навішування слухача на медіа-запит
		// та виклик оброблювача при першому запуску
		this.mediaQueries.forEach((media) => {
			const mediaSplit = media.split(',')
			const matchMedia = window.matchMedia(mediaSplit[0])
			const mediaBreakpoint = mediaSplit[1]

			// масив об'єктів з відповідним брейкпоінтом
			const оbjectsFilter = this.оbjects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint)
			matchMedia.addEventListener('change', () => {
				this.mediaHandler(matchMedia, оbjectsFilter)
			})
			this.mediaHandler(matchMedia, оbjectsFilter)
		})
	}
	// Основна функція
	mediaHandler(matchMedia, оbjects) {
		if (matchMedia.matches) {
			оbjects.forEach((оbject) => {
				// оbject.index = this.indexInParent(оbject.parent, оbject.element);
				this.moveTo(оbject.place, оbject.element, оbject.destination)
			})
		} else {
			оbjects.forEach(({ parent, element, index }) => {
				if (element.classList.contains(this.daClassname)) {
					this.moveBack(parent, element, index)
				}
			})
		}
	}
	// Функція переміщення
	moveTo(place, element, destination) {
		element.classList.add(this.daClassname)
		if (place === 'last' || place >= destination.children.length) {
			destination.append(element)
			return
		}
		if (place === 'first') {
			destination.prepend(element)
			return
		}
		destination.children[place].before(element)
	}
	// Функція повернення
	moveBack(parent, element, index) {
		element.classList.remove(this.daClassname)
		if (parent.children[index] !== undefined) {
			parent.children[index].before(element)
		} else {
			parent.append(element)
		}
	}
	// Функція отримання індексу всередині батьківського єлементу
	indexInParent(parent, element) {
		return [...parent.children].indexOf(element)
	}
	// Функція сортування масиву по breakpoint та place
	// за зростанням для this.type = min
	// за спаданням для this.type = max
	arraySort(arr) {
		if (this.type === 'min') {
			arr.sort((a, b) => {
				if (a.breakpoint === b.breakpoint) {
					if (a.place === b.place) {
						return 0
					}
					if (a.place === 'first' || b.place === 'last') {
						return -1
					}
					if (a.place === 'last' || b.place === 'first') {
						return 1
					}
					return 0
				}
				return a.breakpoint - b.breakpoint
			})
		} else {
			arr.sort((a, b) => {
				if (a.breakpoint === b.breakpoint) {
					if (a.place === b.place) {
						return 0
					}
					if (a.place === 'first' || b.place === 'last') {
						return 1
					}
					if (a.place === 'last' || b.place === 'first') {
						return -1
					}
					return 0
				}
				return b.breakpoint - a.breakpoint
			})
			return
		}
	}
}
const da = new DynamicAdapt("max");
da.init();

// ================================================================ header scroll =====================================================
let addWindowScrollEvent = false;

function headerScroll() {
    addWindowScrollEvent = true;
    const header = document.querySelector('header.header');
    const headerShow = header.hasAttribute('data-scroll-show');
    const headerShowTimer = header.dataset.scrollShow ? header.dataset.scrollShow : 500;
    const startPoint = header.dataset.scroll ? header.dataset.scroll : 1;
    let scrollDirection = 0;
    let timer;
    document.addEventListener("windowScroll", function (e) {
        const scrollTop = window.scrollY;
        clearTimeout(timer);
        if (scrollTop >= startPoint) {
            !header.classList.contains('header-scroll') ? header.classList.add('header-scroll') : null;
            if (headerShow) {
                if (scrollTop > scrollDirection) {
                    // downscroll code
                    header.classList.contains('header-show') ? header.classList.remove('header-show') : null;
                } else {
                    // upscroll code
                    !header.classList.contains('header-show') ? header.classList.add('header-show') : null;
                }
                timer = setTimeout(() => {
                    !header.classList.contains('header-show') ? header.classList.add('header-show') : null;
                }, headerShowTimer);
            }
        } else {
            header.classList.contains('header-scroll') ? header.classList.remove('header-scroll') : null;
            if (headerShow) {
                header.classList.contains('header-show') ? header.classList.remove('header-show') : null;
            }
        }
        scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
    });
}

headerScroll();

setTimeout(() => {
    if (addWindowScrollEvent) {
        let windowScroll = new Event("windowScroll");
        window.addEventListener("scroll", function (e) {
            document.dispatchEvent(windowScroll);
        });
    }
}, 0);

// ============================================================== Swiper ==========================================================
let actionSlider; // Змінна для зберігання екземпляра слайдера

function initSliders() {
    // Перевіряємо, чи є слайдер на сторінці та чи підходить ширина екрану
    if (document.querySelector('.action__slider') && window.innerWidth <= 992 && !actionSlider) { 
        // Створюємо слайдер
        actionSlider = new Swiper('.action__slider', { // Вказуємо клас потрібного слайдера
            observer: true,
            observeParents: true,
            slidesPerView: 1,
            spaceBetween: 10,
            speed: 800,

            // Пагінація
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                320: {
                    slidesPerView: 1,
                    spaceBetween: 10,
                },
                450: {
                    slidesPerView: 2,
                    spaceBetween: 10,
                },
                700: {
                    slidesPerView: 3,
                    spaceBetween: 15,
                },
            },
        });
    } else if (window.innerWidth > 992 && actionSlider) {
        // Знищуємо слайдер, якщо ширина екрана більше 992 пікселів
        actionSlider.destroy(true, true); // Повне знищення слайдера
        actionSlider = null; // Очищаємо змінну
    }
}

window.addEventListener("load", function (e) {
    // Запуск ініціалізації слайдерів
    initSliders();
    
    // Додаємо прослуховувач подій на зміну розміру вікна
    window.addEventListener('resize', function () {
        initSliders(); // Викликаємо функцію при зміні розміру вікна
    });
});

// =============================================================== Form ===================================================================

let gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
    const targetBlockElement = document.querySelector(targetBlock);
    if (targetBlockElement) {
        let headerItem = '';
        let headerItemHeight = 0;
        if (noHeader) {
            headerItem = 'header.header';
            const headerElement = document.querySelector(headerItem);
            if (!headerElement.classList.contains('_header-scroll')) {
                headerElement.style.cssText = `transition-duration: 0s;`;
                headerElement.classList.add('_header-scroll');
                headerItemHeight = headerElement.offsetHeight;
                headerElement.classList.remove('_header-scroll');
                setTimeout(() => {
                    headerElement.style.cssText = ``;
                }, 0);
            } else {
                headerItemHeight = headerElement.offsetHeight;
            }
        }
        let options = {
            speedAsDuration: true,
            speed: speed,
            header: headerItem,
            offset: offsetTop,
            easing: 'easeOutQuad',
        };
        // Закриваємо меню, якщо воно відкрите
        document.documentElement.classList.contains("menu-open") ? menuClose() : null;

        if (typeof SmoothScroll !== 'undefined') {
            // Прокручування з використанням доповнення
            new SmoothScroll().animateScroll(targetBlockElement, '', options);
        } else {
            // Прокручування стандартними засобами
            let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
            targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
            targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
            window.scrollTo({
                top: targetBlockElementPosition,
                behavior: "smooth"
            });
        }
        FLS(`[gotoBlock]: Юхуу...їдемо до ${targetBlock}`);
    } else {
        FLS(`[gotoBlock]: Йой... Такого блоку немає на сторінці: ${targetBlock}`);
    }
};

let formValidate = {
    getErrors(form) {
        let error = 0;
        let formRequiredItems = form.querySelectorAll('*[data-required]');
        if (formRequiredItems.length) {
            formRequiredItems.forEach(formRequiredItem => {
                if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) {
                    error += this.validateInput(formRequiredItem);
                }
            });
        }
        return error;
    },
    validateInput(formRequiredItem) {
        let error = 0;
        if (formRequiredItem.dataset.required === "email") {
            formRequiredItem.value = formRequiredItem.value.replace(" ", "");
            if (this.emailTest(formRequiredItem)) {
                this.addError(formRequiredItem);
                error++;
            } else {
                this.removeError(formRequiredItem);
            }
        } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
            this.addError(formRequiredItem);
            error++;
        } else {
            if (!formRequiredItem.value.trim()) {
                this.addError(formRequiredItem);
                error++;
            } else {
                this.removeError(formRequiredItem);
            }
        }
        return error;
    },
    addError(formRequiredItem) {
        formRequiredItem.classList.add('_form-error');
        formRequiredItem.parentElement.classList.add('_form-error');
        let inputError = formRequiredItem.parentElement.querySelector('.form__error');
        if (inputError) formRequiredItem.parentElement.removeChild(inputError);
        if (formRequiredItem.dataset.error) {
            formRequiredItem.parentElement.insertAdjacentHTML('beforeend', `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
        }
    },
    removeError(formRequiredItem) {
        formRequiredItem.classList.remove('_form-error');
        formRequiredItem.parentElement.classList.remove('_form-error');
        if (formRequiredItem.parentElement.querySelector('.form__error')) {
            formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector('.form__error'));
        }
    },
    formClean(form) {
        form.reset();
        setTimeout(() => {
            let inputs = form.querySelectorAll('input,textarea');
            for (let index = 0; index < inputs.length; index++) {
                const el = inputs[index];
                el.parentElement.classList.remove('_form-focus');
                el.classList.remove('_form-focus');
                formValidate.removeError(el);
            }
            let checkboxes = form.querySelectorAll('.checkbox__input');
            if (checkboxes.length > 0) {
                for (let index = 0; index < checkboxes.length; index++) {
                    const checkbox = checkboxes[index];
                    checkbox.checked = false;
                }
            }
            if (flsModules.select) {
                let selects = form.querySelectorAll('.select');
                if (selects.length) {
                    for (let index = 0; index < selects.length; index++) {
                        const select = selects[index].querySelector('select');
                        flsModules.select.selectBuild(select);
                    }
                }
            }
        }, 0);
    },
    emailTest(formRequiredItem) {
        return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
    }
}

function formFieldsInit(options = { viewPass: false, autoHeight: false }) {
    document.body.addEventListener("focusin", function (e) {
        const targetElement = e.target;
        if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
            if (!targetElement.hasAttribute('data-no-focus-classes')) {
                targetElement.classList.add('_form-focus');
                targetElement.parentElement.classList.add('_form-focus');
            }
            targetElement.hasAttribute('data-validate') ? formValidate.removeError(targetElement) : null;
        }
    });
    document.body.addEventListener("focusout", function (e) {
        const targetElement = e.target;
        if ((targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA')) {
            if (!targetElement.hasAttribute('data-no-focus-classes')) {
                targetElement.classList.remove('_form-focus');
                targetElement.parentElement.classList.remove('_form-focus');
            }
            // Миттєва валідація
            targetElement.hasAttribute('data-validate') ? formValidate.validateInput(targetElement) : null;
        }
    });
    // Якщо увімкнено, додаємо функціонал "Показати пароль"
    if (options.viewPass) {
        document.addEventListener("click", function (e) {
            let targetElement = e.target;
            if (targetElement.closest('[class*="__viewpass"]')) {
                let inputType = targetElement.classList.contains('_viewpass-active') ? "password" : "text";
                targetElement.parentElement.querySelector('input').setAttribute("type", inputType);
                targetElement.classList.toggle('_viewpass-active');
            }
        });
    }
    // Якщо увімкнено, додаємо функціонал "Автовисота"
    if (options.autoHeight) {
        const textareas = document.querySelectorAll('textarea[data-autoheight]');
        if (textareas.length) {
            textareas.forEach(textarea => {
                const startHeight = textarea.hasAttribute('data-autoheight-min') ?
                    Number(textarea.dataset.autoheightMin) : Number(textarea.offsetHeight);
                const maxHeight = textarea.hasAttribute('data-autoheight-max') ?
                    Number(textarea.dataset.autoheightMax) : Infinity;
                setHeight(textarea, Math.min(startHeight, maxHeight))
                textarea.addEventListener('input', () => {
                    if (textarea.scrollHeight > startHeight) {
                        textarea.style.height = `auto`;
                        setHeight(textarea, Math.min(Math.max(textarea.scrollHeight, startHeight), maxHeight));
                    }
                });
            });
            function setHeight(textarea, height) {
                textarea.style.height = `${height}px`;
            }
        }
    }
}
// Валідація форм

/* Відправлення форм */
function formSubmit() {
    const forms = document.forms;
    if (forms.length) {
        for (const form of forms) {
            form.addEventListener('submit', function (e) {
                const form = e.target;
                formSubmitAction(form, e);
            });
            form.addEventListener('reset', function (e) {
                const form = e.target;
                formValidate.formClean(form);
            });
        }
    }
    async function formSubmitAction(form, e) {
        const error = !form.hasAttribute('data-no-validate') ? formValidate.getErrors(form) : 0;
        if (error === 0) {
            const ajax = form.hasAttribute('data-ajax');
            if (ajax) { // Якщо режим ajax
                e.preventDefault();
                const formAction = form.getAttribute('action') ? form.getAttribute('action').trim() : '#';
                const formMethod = form.getAttribute('method') ? form.getAttribute('method').trim() : 'GET';
                const formData = new FormData(form);

                form.classList.add('_sending');
                const response = await fetch(formAction, {
                    method: formMethod,
                    body: formData
                });
                if (response.ok) {
                    let responseResult = await response.json();
                    form.classList.remove('_sending');
                    formSent(form, responseResult);
                } else {
                    alert("Помилка");
                    form.classList.remove('_sending');
                }
            } else if (form.hasAttribute('data-dev')) {	// Якщо режим розробки
                e.preventDefault();
                formSent(form);
            }
        } else {
            e.preventDefault();
            if (form.querySelector('._form-error') && form.hasAttribute('data-goto-error')) {
                const formGoToErrorClass = form.dataset.gotoError ? form.dataset.gotoError : '._form-error';
                gotoBlock(formGoToErrorClass, true, 1000);
            }
        }
    }
    // Дії після надсилання форми
    function formSent(form, responseResult = ``) {
        // Створюємо подію відправлення форми
        document.dispatchEvent(new CustomEvent("formSent", {
            detail: {
                form: form
            }
        }));
        // Показуємо попап, якщо підключено модуль попапів 
        // та для форми вказано налаштування
        setTimeout(() => {
            if (flsModules.popup) {
                const popup = form.dataset.popupMessage;
                popup ? flsModules.popup.open(popup) : null;
            }
        }, 0);
        // Очищуємо форму
        formValidate.formClean(form);
        // Повідомляємо до консолі
        formLogging(`Форму відправлено!`);
    }
    function formLogging(message) {
        FLS(`[Форми]: ${message}`);
    }
}

// FLS (Full Logging System)
function FLS(message) {
    setTimeout(() => {
        console.log(message);
    }, 0);
}


formFieldsInit({
    viewPass: false,
    autoHeight: false
});

formSubmit();

// ============================================================= Parallax ============================================================

/*
Параметри data-атрибутів для налаштування ефекту паралаксу:

1. Для батьківського елемента ([data-prlx-parent]):
   - data-prlx-smooth: Визначає плавність анімації. За замовчуванням 15. Більше значення - більш плавний ефект.
   - data-prlx-center: Визначає точку відліку для паралаксу. Можливі значення:
      * "top": верхня точка екрану
      * "center": центр екрану (за замовчуванням)
      * "bottom": нижня точка екрану
    data-prlx-disable-width="992"  
 
2. Для дочірніх елементів ([data-prlx]):
   - data-axis: Визначає вісь руху. Можливі значення:
      * "v": вертикальний рух (за замовчуванням)
      * "h": горизонтальний рух
   - data-direction: Визначає напрямок руху. Якщо не вказано, рух відбувається в протилежному напрямку прокрутки.
   - data-coefficient: Коефіцієнт швидкості руху. За замовчуванням 5. Менше значення - швидший рух.
   - data-properties: Додаткові CSS властивості трансформації, які будуть додані до елемента.
*/

class Parallax {
    constructor(elements) {
        if (elements.length) {
            this.elements = Array.from(elements).map((el) => (
                new Parallax.Each(el)
            ));
        }
    }
}

Parallax.Each = class {
    constructor(parent) {
        this.parent = parent;
        this.elements = this.parent.querySelectorAll('[data-prlx]');
        this.animation = this.animationFrame.bind(this);
        this.offset = 0;
        this.value = 0;
        this.smooth = parent.dataset.prlxSmooth ? Number(parent.dataset.prlxSmooth) : 15;
        // Set to 0 if attribute is not present, meaning parallax is always enabled
        this.disableWidth = parent.dataset.prlxDisableWidth ? Number(parent.dataset.prlxDisableWidth) : 0;
        this.setEvents();
    }

    setEvents() {
        this.animationID = window.requestAnimationFrame(this.animation);
    }

    animationFrame() {
        const windowWidth = window.innerWidth;

        // Check if parallax should be disabled based on screen width
        if (windowWidth < this.disableWidth) {
            this.elements.forEach(el => {
                el.style.transform = 'none';
            });
            this.animationID = window.requestAnimationFrame(this.animation);
            return;
        }

        const topToWindow = this.parent.getBoundingClientRect().top;
        const heightParent = this.parent.offsetHeight;
        const heightWindow = window.innerHeight;
        const positionParent = {
            top: topToWindow - heightWindow,
            bottom: topToWindow + heightParent,
        }
        const centerPoint = this.parent.dataset.prlxCenter || 'center';

        if (positionParent.top < 30 && positionParent.bottom > -30) {
            switch (centerPoint) {
                case 'top':
                    this.offset = -1 * topToWindow;
                    break;
                case 'center':
                    this.offset = (heightWindow / 2) - (topToWindow + (heightParent / 2));
                    break;
                case 'bottom':
                    this.offset = heightWindow - (topToWindow + heightParent);
                    break;
            }
        }

        this.value += (this.offset - this.value) / this.smooth;
        this.animationID = window.requestAnimationFrame(this.animation);

        this.elements.forEach(el => {
            const parameters = {
                axis: el.dataset.axis || 'v',
                direction: el.dataset.direction ? el.dataset.direction + '1' : '-1',
                coefficient: el.dataset.coefficient ? Number(el.dataset.coefficient) : 5,
                additionalProperties: el.dataset.properties || '',
            }
            this.parameters(el, parameters);
        });
    }

    parameters(el, parameters) {
        if (parameters.axis == 'v') {
            el.style.transform = `translate3D(0, ${(parameters.direction * (this.value / parameters.coefficient)).toFixed(2)}px,0) ${parameters.additionalProperties}`;
        } else if (parameters.axis == 'h') {
            el.style.transform = `translate3D(${(parameters.direction * (this.value / parameters.coefficient)).toFixed(2)}px,0,0) ${parameters.additionalProperties}`;
        }
    }
}

// Ініціалізація паралаксу
if (document.querySelectorAll('[data-prlx-parent]')) {
    new Parallax(document.querySelectorAll('[data-prlx-parent]'));
}