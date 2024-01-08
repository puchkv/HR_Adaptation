import API from './API2.js';
import { initIcons } from './icons.js'

import Utils from './utils.js';
import PollsController from './polls.js';
import TasksController from './tasks.js';
import TeamController from './team.js';
import User from './user.js';
import ERRORS from './errors.js';

window.onload = async () => {

    if(Utils.isTelegramClient) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation()
    }
    
    loading();

    initIcons();

    API.send("GET_ADAPTATION_SCENARIO")
        .then(response => {
            
            if(response instanceof Error) {
                throw response;
            }
            // Отримуємо ІНН поточного юзера
            // для цього ІНН визначаємо рівень доступу
            // HR - бачить таски свого новачка, опитування, може залишати коментар до задачі та оцінювати
            // Mentor - наставник новачка, будь-хто з відділу може бути, зазвичай начальник відділу
            // Newbee - новачок, бачить все, окрім задач, що створені для ментора

            User.GetInn().then(inn => {
                
                User.Inn = inn;
                User.Role = User.GetRole(inn, response.data);

                if(User.isUnknown)
                    Utils.throwError("USER_HAS_NO_ROLE");

                if(typeof response.data.card === 'object') {
                    SetProfileData(response.data.card);
                }
                    
                TasksController.initialize(response.data.tasks, User);
                PollsController.initialize(response.data.polls, User);
                TeamController.initialize({ 
                    mentor: response.data.mentor,
                    head: response.data.head,
                    hr: response.data.hr,
                    colleagues: response.data.colleagues
                });

                CalculateOverallRating(response.data.tasks.filter(t => t.rate != '').map(t=>t.rate));
                UpdateProfileProgress();

                window.dispatchEvent(new Event("app-loaded"));
            });

        })
        .catch(error => {
            console.log(error.code);
            window.dispatchEvent(new CustomEvent('app-failed', { detail: error }));
            return;
        });
    
    initializeComponents();
    
    window.addEventListener("screenChanged", function() {
        document.body.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        });

        let currentScreen = Array.from(document.querySelectorAll('section')).find(s => s.style.display !== 'none').id;
        let mainScreens = ['polls', 'teamMembers', 'tasks'];

        if(mainScreens.indexOf(currentScreen) !== -1) {
            Utils.showNav();
            Utils.hideMainButton();
            Utils.hideBackButton();
        }
        else {
            Utils.hideNav();
        }
    });

    window.addEventListener("app-loaded", function() {
        document.getElementById("loading").remove();
        Utils.loadScreen("tasks"); // entry point
    });

    window.addEventListener("app-failed", function(event) {

        let errCode = event?.detail?.code == '' ? "RESPONSE_FAILED" : event.detail.code;
        
        console.log(errCode);

        let el = document.createElement("section");
        el.id = "error-page";
        el.classList.add('empty-page');

        switch(errCode) {
            case "RESPONSE_FAILED":
                el.innerHTML += `<img src='./icons/empty.webp' />`; break;
            case "TOKEN_NOT_FOUND":
                el.innerHTML += `
                    <video autoplay loop>
                        <source src="./icons/locker.mp4" type="video/mp4" />
                    </video>`; 
                    break;
            case "ROUTE_NOT_FOUND":
                el.innerHTML += `
                    <video autoplay loop>
                    <source src="./icons/eyes.mp4" type="video/mp4" />
                    </video>`; 
                    break;
        }

        el.innerHTML += `<span>${ERRORS[errCode]}</span>`;

        document.body.appendChild(el);
        Utils.loadScreen('error-page');
        Utils.hideMainButton();
        Utils.hideBackButton();

        document.getElementById("loading")?.remove();
    });
    

    window.Telegram.WebApp.MainButton.onClick(function() {
        window.Telegram.WebApp.MainButton.showProgress();
        window.Telegram.WebApp.MainButton.disable();

        setTimeout(function() {
            window.Telegram.WebApp.MainButton.hideProgress();
            window.Telegram.WebApp.MainButton.enable();
        }, 500);
    });

    // IOS - Safari keyboard hide on touch fix
    document.addEventListener("touchend", function(e) {
        if(e?.target?.type !== 'textarea') {
            document.activeElement.blur();
        }
    })
}

const loading = () => {
    
    let el = document.createElement("div");

    el.id = "loading";
    el.innerHTML = `
        <div class="loadingio-spinner-spinner-wfa2piygvs"><div class="ldio-ugwrudymdy">
        <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
        </div></div>    
        <span>Зачекайте, будь ласка</span>
    `;

    document.body.appendChild(el);
}


const SetProfileData = (profileData) => {

    let profileCard = document.createElement("div");
    profileCard.classList.add('profile-header');

    let experience = () => {
        let monthes = Utils.getMonthsDifferenceByDays(profileData.seniority);

        switch(monthes) {
            case 1: return "Перший місяць в компанії 🐣";
            case 2: return "Другий місяць в компанії 🤓";
            case 3: return "Третій місяць в компанії 🥳";
            case 4: return "Четвертий місяць в компанії";
            case 5: return "П'ять місяців в компанії";
            case 6: return "Півроку в компнаії";
            case 7-11: return "Більше півроку в компанії";
            case 12: return "Рік в компанії";
            default: return "Більше року в компанії";
        }
    }

    profileCard.innerHTML = 
        `<div class="profile-photo">
            <img src="${profileData.photo_url === '' ? './icons/profile.svg' : profileData.photo_url}" alt="ProfilePhoto"/>
        </div> 
        <div class="profile-details">
            <div>
                <h2>${profileData.nam} </h2>
                <div id='profile-rating' class="profile-rating" style='display:none'>
                    <span></span>
                    <svg><use href="#star-solid"/></svg>
                </div>
            </div>
            <div>
                <span>${experience()}</span>
            </div>
            <div class="profile-progress">
                <div class="progress-bar">
                    <div class="progress"></div>
                </div> 
                <span></span>
            </div>
        </div>`;

    document.getElementById("tasks")
        .insertBefore(profileCard, document.getElementById("tasks").firstChild);

    document.getElementById("polls")
        .insertBefore(profileCard.cloneNode(true), document.getElementById("polls").firstChild)

}

const CalcProfileProgress = () => {
   
    let tasks = document.querySelectorAll('#tasks>.roulette>.cards>.card');
    let polls = document.querySelectorAll('#polls>.roulette>.cards>.card');

    let count = tasks.length + polls.length;

    let doneTasks = document.querySelectorAll('#tasks>.roulette>.cards>.card[data-done="true"]');
    let donePolls = document.querySelectorAll('#polls>.roulette>.cards>.card[data-done="true"]');
    let doneCount = doneTasks.length + donePolls.length;

    let result = Math.round((doneCount * 100 / count));

    return (isNaN(result) || result <= 0) ? 0 : result;
}


const CalculateOverallRating = (rates) => {

    if(rates == null || typeof rates === 'undefined' || rates.length <= 0)
        return;
    
    let el = document.getElementById('profile-rating');
    let elText = el.querySelector('span');

    el.style.display = 'flex';
    elText.innerText = Utils.Average(rates);
}



const UpdateProfileProgress = () => {
    
    let progressBars = document.querySelectorAll(".progress");
    let progressLabels = document.querySelectorAll(".profile-progress>span");

    let currentProgress = CalcProfileProgress();

    progressLabels.forEach(label => {
        label.textContent = `${currentProgress}%`;
    })

    progressBars.forEach(progress => {
        progress.style.width = `${currentProgress}%`;
    });

}


const init = (element) => {

    element.querySelectorAll(".expand-more").forEach(expander => {

        let expLabel = expander.querySelector("p");
    
        if(typeof expLabel !== 'undefined' && expLabel !== null)
            expLabel.textContent = "Розгорнути";
    
        expander.onclick = () => expandCards(expander.dataset.type);
    });

    // element.querySelectorAll(".radiocheck").forEach(radio => {
    //     radio.onclick = (e) => {
    //         e.target.classList.toggle("checked");
    //     }
    // });

    element.querySelectorAll(".cards").forEach(cardsList => {
        cardsList.onclick = () => {
            if(!cardsList.classList.contains("expanded"))
                expandCards(cardsList.dataset.type);
        }
    });

    element.querySelectorAll(".card[data-task]").forEach(task => {

        task.onclick = (e) => {
            if(typeof task.parentElement !== 'undefined' 
                && task.parentElement.classList.contains("expanded")) {

                TasksController.view(task.dataset.task);
            }
        }
    });
}   

const initializeComponents = () => {

    document.querySelectorAll(".expand-more").forEach(expander => {

        let expLabel = expander.querySelector("p");
    
        if(typeof expLabel !== 'undefined' && expLabel !== null)
            expLabel.textContent = "Розгорнути";
    
        expander.onclick = () => expandCards(expander.dataset.type);
    });
    
    // Close tasks by radiocheck - DISABLED
    // document.querySelectorAll(".radiocheck").forEach(radio => {
    //     radio.onclick = (e) => {
    //         e.target.classList.toggle("checked");
    //     }
    // });

    document.getElementById("polls").addEventListener("pollsLoaded", function() {
        document.querySelectorAll(".card[data-poll]").forEach(poll => {
            poll.onclick = (e) => {
                PollsController.view(poll.dataset.poll);
            }
        });
    });

    document.getElementById("tasks").addEventListener("tasksLoaded", () => {
        init(document.getElementById("tasks"));
    });

 
    // Navigation selector script
    document.querySelector("nav").querySelectorAll("div").forEach(navButton => {
        navButton.onclick = (event) => {
    
            document.querySelectorAll("nav>div").forEach(button => {
                if(button !== event.target)
                    button.classList.remove("checked");
            })
    
            if(!navButton.classList.contains("checked")) {
    
                Utils.loadScreen(navButton.dataset.route);
    
                navButton.classList.add("checked");
            }

            Utils.hideMainButton();
        };
    });
    
    // Expand cards controller
    document.querySelectorAll(".cards").forEach(cardsList => {
        cardsList.onclick = () => {
            if(!cardsList.classList.contains("expanded"))
                expandCards(cardsList.dataset.type);
        }
    });

}

// add nav-height margin to not overlaping content
// const setNavMargin = () => {

//     let navEl, navRect;

//     navEl = document.querySelector("nav");

//     if(typeof navEl !== 'undefined' && navEl !== null)
//         navRect = navEl.getBoundingClientRect();

//     if(typeof navRect !== 'undefined' && navRect !== null 
//         && navEl.checkVisibility() === true)
//             document.body.style.paddingBottom = navRect.height + 'px';
// }


// document.getElementById("test").onclick = () => {
//     Utils.showAnimation("thumb", "Все чудово!");
// }


// reload gif when enter the success screen
// function playSuccessAnimation() {
//     let screen = document.getElementById("pollSuccess");

//     let gif = screen.querySelector("picture>object");

//     setTimeout(function() {
//         gif.setAttribute("data", "icons/success.gif");
//     }, 30);
// }

function expandCards(cardType) {
    
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


document.querySelectorAll(".card>img").forEach(img => {
    img.onclick = () => {
        img.style.transform = "scale(20)";
    }
});




// Popup function maybe needed this later
// function Popup() {

//     let popup = document.getElementById("popup-message");
//     popup.style.maxHeight = "1000px";
    
//     setTimeout(() =>{
//         popup.style.maxHeight = "0px";
//     }, 2000);



//     console.log(popup);
// }