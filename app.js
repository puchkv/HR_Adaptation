import API from './API2.js';
import { initIcons } from './icons.js'

import Utils from './utils.js';
import PollsController from './polls.js';
import TasksController from './tasks.js';
import TeamController from './team.js';
import User from './user.js';
import Resources from './resources.js';


window.onload = async () => {

    const locale = Utils.SearchParams.get("locale");
    Resources.init(locale);

    if(Utils.isTelegramClient) {
        //window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        //window.Telegram.WebApp.enableClosingConfirmation()
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

                if(User.Role === User.Roles.UNKNOWN && response.data.pod_kers.some(pod => pod.head.inn === inn)) {
                    User.Role = User.Roles.Head;    
                }

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
            }).catch(error => {
                console.error(error);
                window.dispatchEvent(new CustomEvent('app-failed', { detail: error }));
            })

        })
        .catch(error => {
            console.error(error);
            Sentry.captureException(error);
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

        if(Utils.isTelegramClient) {
            if(localStorage.getItem('WELCOME_SCREEN_VIEWED') === null
            || window.Telegram.WebApp.CloudStorage.getItem('WELCOME_SCREEN_VIEWED')  === null) {
                initWelcomeScreen();
                Utils.loadScreen('welcome');
                return;
            }
        }
        else {
            if(localStorage.getItem('WELCOME_SCREEN_VIEWED') === null) {
                initWelcomeScreen();
                Utils.loadScreen('welcome');
                return;
            }
        }

        switch(Utils.SearchParams.get("page")) {
            case "polls": Utils.loadScreen("polls"); break;
            case "team": Utils.loadScreen("teamMembers"); break;
            default: Utils.loadScreen("tasks"); break;
        }
    
        // Utils.loadScreen("tasks"); // entry point
    });

    window.addEventListener("app-failed", function(event) {

        let errCode = event?.detail?.code == '' ? "RESPONSE_FAILED" : event.detail.code;
    
        let el = document.createElement("section");
        el.id = "error-page";
        el.classList.add('empty-page');

        switch(errCode) {
            case "RESPONSE_FAILED":
                el.innerHTML += `
                    <dotlottie-player src="./icons/eyes.json" background="transparent" speed="1" style="width: 300px; height: 300px" direction="1" mode="normal" loop autoplay></dotlottie-player>
                `; 
                break;
            case "TOKEN_NOT_FOUND":
                el.innerHTML += `
                    <dotlottie-player src="./icons/denied.json" background="transparent" speed="1" style="width: 300px; height: 300px" direction="1" mode="normal" loop autoplay></dotlottie-player>`;
                break;
            case "ROUTE_NOT_FOUND":
                el.innerHTML += 
                    `<dotlottie-player src="./icons/empty.json" background="transparent" speed="1" style="width: 300px; height: 300px" direction="1" mode="normal" loop autoplay></dotlottie-player>`;
                break;
            case "USER_HAS_NO_ROLE":
                el.innerHTML += `
                    <dotlottie-player src="./icons/unknown.json" background="transparent" speed="1" style="width: 300px; height: 300px" direction="1" mode="normal" loop autoplay></dotlottie-player>`;
                break;
        }
 
        el.innerHTML += `<span>${event?.detail?.message}</span>`;

        document.body.appendChild(el);
        Utils.loadScreen('error-page');
        Utils.hideMainButton();
        Utils.hideBackButton();

        document.getElementById("loading")?.remove();
    });
    

    window.Telegram.WebApp.MainButton.onClick(function() {

        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        window.Telegram.WebApp.MainButton.showProgress();
        window.Telegram.WebApp.MainButton.disable();
        document.activeElement?.blur();
        
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
        <div class="spinner"></div>
        <span>${Resources.getPhrase('WAIT_PLEASE')}</span>
    `;

    document.body.appendChild(el);
}


const SetProfileData = (profileData) => {

    let profileCard = document.createElement("div");
    profileCard.classList.add('profile-header');

    let experience = () => {
        let months = Utils.getMonthsDifferenceByDays(profileData.seniority);

        switch(months) {
            case 1: return `${Resources.getPhrase('1_СP_MONTH')} 🐣`;
            case 2: return `${Resources.getPhrase('2_СP_MONTH')} 🤓`;
            case 3: return `${Resources.getPhrase('3_СP_MONTH')} 🥳`;
            case 4: return `${Resources.getPhrase('4_СP_MONTH')}`;
            case 5: return `${Resources.getPhrase('5_СP_MONTH')}`;
            case 6: return `${Resources.getPhrase('HALF_СP_MONTH')}`;
            case 7: 
            case 8:
            case 9:
            case 10:
            case 11: return `${Resources.getPhrase('MORE_CP_MONTH')}`;
            case 12: return `${Resources.getPhrase('YEAR_CP_MONTH')}`;
            default: return `${Resources.getPhrase('FULL_CP_MONTH')}`;
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
                    <svg><use href="#star-filled"/></svg>
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

    // let pollsOverall = PollsController.OverallCount;
    
    // let tasks = document.querySelectorAll('#tasks>.roulette>.cards>.card');
    // let polls = document.querySelectorAll('#polls>.roulette>.cards>.card');

    // let count = tasks.length + polls.length;

    // let doneTasks = document.querySelectorAll('#tasks>.roulette>.cards>.card[data-done="true"]');
    // let donePolls = document.querySelectorAll('#polls>.roulette>.cards>.card[data-done="true"]');
    // let doneCount = doneTasks.length + donePolls.length;

    let overallCount = PollsController.OverallCount + TasksController.OverallCount;
    let closedCount = PollsController.ClosedCount + TasksController.ClosedCount;

    let result = Math.round((closedCount * 100 / overallCount));

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
            expLabel.textContent = Resources.getPhrase("EXPAND_LABEL");
    
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

    // Multilanguage
    var nav = document.querySelector("nav");
    nav.innerHTML = `
        <div data-route='tasks' class="checked">
            <svg><use href="#note"/></svg>
            <span>${Resources.getPhrase("TASKS_LABEL")}</span>
        </div>
        <div data-route="teamMembers">
            <svg class="icon-medium"><use href="#team" /></svg>
            <span>${Resources.getPhrase("TEAM_LABEL")}</span>
        </div>
        <div data-route="polls">
            <svg><use href="#question"/></svg>
            <span>${Resources.getPhrase("POLLS_LABEL")}</span>
        </div>
    `;

    var surveyResult = document.getElementById("pollSuccess");
    surveyResult.innerHTML = `
        <picture class="anim-sticker">
            <object type="image/gif" data="icons/success.gif"></object>
        </picture>
        <h2 style='text-align:center'>${Resources.getPhrase("RESULT_SENED_SUCCESS")}</h2>
    `;

    document.querySelectorAll(".expand-more").forEach(expander => {

        let expLabel = expander.querySelector("p");
    
        if(typeof expLabel !== 'undefined' && expLabel !== null)
            expLabel.textContent = Resources.getPhrase("EXPAND_LABEL");
    
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

const initWelcomeScreen = () => {
    
    const section = document.getElementById('welcome');

    section.innerHTML = `
        <h1>
            👋 ${Resources.getPhrase('WELCOME_IN_HUB')}
        </h1>

        <div class = "icon-paragraph-list">
            <div class = "icon-paragraph">
                <svg><use href="#note"/></svg>
                <div>
                    <h3>
                        ${Resources.getPhrase('ADPT_TASKS_LABEL')}
                    </h3>
                    <p>
                        ${Resources.getPhrase('MAKE_YOUR_TASKS')}
                    </p>
                </div>
            </div>

            <div class = "icon-paragraph">
                <svg><use href="#chat"/></svg>
                <div>
                    <h3>
                        ${Resources.getPhrase('POLLS_LABEL')}
                    </h3>
                    <p>
                        ${Resources.getPhrase('ANSWER_YOUR_POLLS')} 👐
                    </p>
                </div>
            </div>

            <div class = "icon-paragraph">
                <svg><use href="#bell"/></svg>
                <div>
                    <h3>
                        ${Resources.getPhrase('NOTIFACTION_LABEL')}
                    </h3>
                    <p>
                        ${Resources.getPhrase('TAKE_YOUR_NOTIFICATIONS')}
                    </p>
                </div>
            </div>
        </div>
    `;

    Utils.showMainButton(Resources.getPhrase('LETS_GO'), () => {
        if(Utils.isTelegramClient)
            window.Telegram.WebApp.CloudStorage.setItem("WELCOME_SCREEN_VIEWED", true);

        localStorage.setItem("WELCOME_SCREEN_VIEWED", true);
        Utils.hideMainButton();
        Utils.loadScreen("tasks");
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
        expLabel.textContent = Resources.getPhrase("EXPAND_LABEL");
    
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
            expLabel.textContent = Resources.getPhrase("EXPAND_LABEL");
    } 
    else 
    {
        if(typeof expIcon !== 'undefined' && expIcon !== null) {
            expIcon.classList.remove('rotate-0');
            expIcon.classList.add('rotate-180');
        }
       
        cards.classList.add('expanded');

        if(typeof expLabel !== 'undefined' && expLabel !== null)
            expLabel.textContent = Resources.getPhrase("COLLAPSE_LABEL");
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