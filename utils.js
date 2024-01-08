import ERRORS from "./errors.js";

class Utils {

    get testInitData() {
        return "query_id=AAHUWZZ3AAAAANRZlnfYKkqY&user=%7B%22id%22%3A2006342100%2C%22first_name%22%3A%22%D0%AE%D1%80%D1%96%D0%B9%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22lyubchak%22%2C%22language_code%22%3A%22uk%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1697117294&hash=dc39d00ad19160a006b7737be6ee9c6def17a723302b9985ad5aa088c8b6fef2";
    }

    set UserRole(value) {
        this._value = value;
    }

    get UserRole() {
        return this._value;
    }

    #latestMainCallback = null;
    #latestBackCallback = null;

    loadScreen = (screenName) => {

        document.querySelector('div.success-screen')?.remove();
        
        let screen = document.getElementById(screenName);
    
        if(typeof screen !== 'undefined' && screen !== null) {
    
            document.querySelectorAll("section").forEach(scr => {
                if(screen === scr)
                    return;
            
                scr.style.display = "none";
            });
            
            screen.style.removeProperty("display");

            window.dispatchEvent(new CustomEvent("screenChanged"));

            this.initTextarea();
        }
    }
    
    getNoun = (number, one, two, five) => {
        let n = Math.abs(number);
        n %= 100;
        if (n >= 5 && n <= 20) {
          return five;
        }
        n %= 10;
        if (n === 1) {
          return one;
        }
        if (n >= 2 && n <= 4) {
          return two;
        }
        return five;
    }
    
    
    nl2br = (str, is_xhtml = false) => {
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br ' + '/>' : '<br>'; // Adjust comment to avoid issue on phpjs.org display
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    }

    get SearchParams() {
        
        const queryString = window.location.search;

        if(queryString == null || typeof queryString === 'undefined'){
            console.error("Query params not set!");
            return null;
        }

        const params = new URLSearchParams(queryString);

        return params;
    }

    
    getISODate(formattedDate) {
        if(formattedDate == null || typeof formattedDate === 'undefined')
            return '';

        return new Date(formattedDate.replace(/(.*)\.(.*)\.(.*)/, '$3-$2-$1'));
    }

    hideNav = () => {
        document.querySelector("nav").style.display = "none";
    }
    
    showNav = () => {
        document.querySelector("nav").style.removeProperty("display");
    }

    hideTeamButton = () => {
        document.querySelector("div[data-route='teamMembers']").style.display = "none";
    }

    showTeamButton = () => {
        document.querySelector("div[data-route='teamMembers']").style.removeProperty("display");
    }

    
    get #MainButton() {
        var btn = document.getElementById('mainButton');
        var newBtn = btn.cloneNode(true);

        btn.parentNode.replaceChild(newBtn, btn);
        return newBtn;
    }

    showMainButton = function(caption, callBack) {

        var btn = this.isTelegramClient ? window.Telegram.WebApp.MainButton : this.#MainButton;

        if(this.#latestMainCallback !== callBack) {
            window.Telegram.WebApp.MainButton.offClick(this.#latestMainCallback);
            this.#latestMainCallback = callBack;
        }

        if(this.isTelegramClient) 
        {
            btn.setText(caption);
            btn.onClick(this.#latestMainCallback);

            if(!btn.isVisible)
                btn.show();
        }        
        else 
        {            
            btn.hidden = false;
            btn.textContent = caption; 

            setTimeout(function() {
                btn.onclick = callBack;
            }, 320);
        }
    }

    
    showBackButton = function(callBack) {

        let btn = window.Telegram.WebApp.BackButton;

        if(this.#latestBackCallback !== callBack) {
            btn.offClick(this.#latestBackCallback);
            this.#latestBackCallback = callBack;
        }

        btn.onClick(this.#latestBackCallback);

        if(!btn.isVisible) {
            btn.show();
        }
    }

    hideBackButton = function () {
        return window.Telegram.WebApp.BackButton.hide();
    }


    MainBtn = (caption) => {
        return window.Telegram.WebApp.MainButton.setText(caption);
    }


    hideMainButton = () => {

        if(this.isTelegramClient) 
        {
            let btn = window.Telegram.WebApp.MainButton;
            btn.offClick(() => {});
            btn.hide();
        } 
        else 
        {
            let btn = document.getElementById("mainButton");

            btn.onclick = null;
            btn.textContent = '';
            btn.hidden = true;
        }
    }

    throwError = (errorCode) => {

        if(errorCode == '' || ERRORS[errorCode] == null || typeof ERRORS[errorCode] === 'undefined')
            return console.error(`Utils.throwError: errorCode is not specified`);

        const error = new Error(ERRORS[errorCode]);
        error.code = errorCode;

        throw error;
    }


    checkInputs = () => {
        let textInputs = document.querySelectorAll(`textarea, input[type="text"]`);

        textInputs.forEach(input => {
            input.setAttribute('maxlength', 256);

            input.onchange = () => {
                let bindedRadios = document.querySelectorAll(
                    `input[type='radio'][name='${input.name}']`);

                if(input.value !== '') {
                    bindedRadios.forEach(radio => {
                        radio.checked = false;
                        radio.setAttribute("disabled", true);
                    });
                }
                else {
                    bindedRadios.forEach(radio => {
                        radio.checked = false;
                        radio.removeAttribute("disabled");
                    });
                }
            }
        });

        // document.querySelectorAll("input[type='radio']").forEach(radio => {
        //     radio.onclick = () => {
        //         //e.preventDefault();
        //         document.querySelectorAll(`input[name='${radio.name}']`).forEach(r => {

        //             if(r == radio)
        //                 return;

        //             if(r.checked)
        //                 r.checked = false;
        //         });

        //         if(radio.checked) 
        //         {
        //             radio.checked = false;
        //         }
        //         else 
        //         {
        //             radio.checked = true;
        //         }
        //     }
        // });


    }

    initTextarea() {
        
        let tx = document.querySelectorAll("textarea, input[type='text']");

        for (let i = 0; i < tx.length; i++) {
            tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
            tx[i].addEventListener("input", function() {
                this.style.height = 0;
                this.style.height = (this.scrollHeight) + "px";
            });
            tx[i].addEventListener("change", function() {
                this.value = this.value.replace(/^\s*$(?:\r\n?|\n)/gm, "");
                this.value = this.value.trim();
                this.style.height = 0;
                this.style.height = (this.scrollHeight) + "px";
                this.blur();
            });

            tx[i].addEventListener("blur focusout", function() {
                document.activeElement.blur();
            });

            tx[i].addEventListener("touchleave", function() {
                document.activeElement.blur();
                document.elementFromPoint(i.x, i.y);
            });

            tx[i].addEventListener("mouseleave", function(e) {
                window.Telegram?.WebApp?.showAlert("Keyboard must hide...");
                alert("keyboard hide...");
                e.target.blur();
            });

        }
    }

    formDataToJSON(formData) {
        var object = {};

        formData.forEach((value, key) => {
            // Reflect.has in favor of: object.hasOwnProperty(key)
            if(!Reflect.has(object, key)){
                object[key] = value;
                return;
            }
            if(!Array.isArray(object[key])){
                object[key] = [object[key]];    
            }
            object[key].push(value);
        });

        return JSON.stringify(object);
    }

    getMonthsDifferenceByDays(daysCount) {
        let startDate = new Date();
        let now = new Date();

        startDate.setDate(new Date().getDate() - daysCount);

        let months = (now.getFullYear() - startDate.getFullYear()) * 12;
        months -= startDate.getMonth();
        months += now.getMonth();
        
        return months <= 0 ? 1 : months;
    }

    expandCards(cardType) {
    
        let expander = document.querySelector(`.expand-more[data-type=${cardType}`);
        let expIcon, expLabel;
    
        if(typeof expander !== 'undefined' && expander !== null) {
            expIcon = expander.querySelector("svg");
            expLabel = expander.querySelector("p");
        }
    
        if(typeof expLabel !== 'undefined' && expLabel !== null)
            expLabel.textContent = 'Розгорнути';
        
        let cards = document.querySelector(
            `.cards[data-type="${cardType}"]`);
    
        if(cards.classList.contains("expanded")) 
        {
            if(typeof expIcon !== 'undefined' && expIcon !== null) {
                expIcon.classList.remove('rotate-180');
                expIcon.classList.add('rotate-0');
            }
    
            cards.classList.remove('expanded');
            
            if(typeof expLabel !== 'undefined' && expLabel !== null)
                expLabel.textContent = 'Розгорнути';
        } 
        else 
        {
            if(typeof expIcon !== 'undefined' && expIcon !== null) {
                expIcon.classList.remove('rotate-0');
                expIcon.classList.add('rotate-180');
            }
           
            cards.classList.add('expanded');
    
            if(typeof expLabel !== 'undefined' && expLabel !== null)
                expLabel.textContent = 'Згорнути';
        }
    }


    showAnimation = (type, text, hideAfterPlay = true) => {

        let el = document.createElement("div");
        el.classList.add('success-screen');

        let emoji = null;

        switch(type) {
            case "thumb": emoji = './icons/thumb.webm'; break;
            case "party": emoji = './icons/party.webm'; break;
            default: emoji = './icons/thumb.webm'; break;
        }
        
        let gif = document.createElement("video");
        gif.setAttribute("autoplay", true);
        gif.src = emoji; 
        el.appendChild(gif);
        
        let textEl = document.createElement("span");
        textEl.innerText = text;
        el.appendChild(textEl);

        document.body.appendChild(el);

        el.animate([
            { opacity: 0 },
            { opacity: 1 }
        ], {
            duration: 400,
            iterations: 1
        });
        
        if(hideAfterPlay) {

            setTimeout(function() {
                el.animate([
                    { opacity: 1 },
                    { opacity: 0 }
                ], {
                    duration: 400,
                    iterations: 1
                });

                setTimeout(function() {
                    el.removeChild(gif);
                    el.removeChild(textEl);
                    gif.remove();
                    textEl.remove();
                    document.body.removeChild(el);
                    el.remove();
                }, 400);
            }, 2000);
        }
    }


    get isTelegramClient() {
        return window?.Telegram?.WebApp?.initData !== '';
    }

    Average = (numbers) => {
        return (numbers.reduce((acc, number) => acc + number, 0) / numbers.length).toFixed(1);
    }
}

const utils = new Utils();

export default utils;