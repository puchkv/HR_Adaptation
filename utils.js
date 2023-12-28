
class Utils {

    loadScreen = (screenName) => {
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

    showMainButton = (caption) => {

        var btn = this.#MainButton;
        btn.hidden = false;
        btn.textContent = caption;

        return btn;
    }

    hideMainButton = () => {
        document.getElementById("mainButton").onclick = null;
        document.getElementById("mainButton").textContent = '';
        document.getElementById("mainButton").hidden = true;
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
    }

    initTextarea() {
        
        let tx = document.querySelectorAll("textarea, input[type='text']");

        for (let i = 0; i < tx.length; i++) {
            tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
            tx[i].addEventListener("input", function() {
                this.style.height = 0;
                this.style.height = (this.scrollHeight) + "px";
            }, false);
            tx[i].addEventListener("change", function() {
                this.value = this.value.replace(/^\s*$(?:\r\n?|\n)/gm, "");
                this.value = this.value.trim();
                this.style.height = 0;
                this.style.height = (this.scrollHeight) + "px";
            }, false);
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


}

const utils = new Utils();

export default utils;