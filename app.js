import API from './API2.js';
import { initIcons } from './icons.js'

import Utils from './utils.js';
import PollsController from './polls.js';
import TasksController from './tasks.js';
import TeamController from './team.js';


window.onload = async () => {

    initIcons();

    API.send("GET_ADAPTATION_SCENARIO")
        .then(response => {
            
            if(typeof response === 'undefined' ||
                response.data == null || response.data.success == false) {
                    throw new Error(`Unable to get adaptation scenario for INN: ${Utils.SearchParams.get("inn")}`);
            }

            if(typeof response.data.card === 'object') {
                SetProfileData(response.data.card);
            }

            TasksController.initialize(response.data.tasks);
            PollsController.initialize(response.data.polls);
            TeamController.initialize({ 
                mentor: response.data.mentor,
                head: response.data.head,
                hr: response.data.hr,
                colleagues: response.data.colleagues
            });
            
            UpdateProfileProgress();

            Utils.loadScreen("tasks"); // entry point
            Utils.showNav();
            //setNavMargin();  
        })
        .catch(error => {
            console.error(error);
            document.getElementById('no-connection').style.display = "block";
            Utils.hideNav();
            return;
        });
    
    initializeComponents();
    
    window.addEventListener("screenChanged", function() {
        document.body.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        });
    });
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
                <h2>${profileData.fam} ${profileData.nam} ${profileData.otch}</h2>
                <div class="profile-rating">
                    <!-- profile rating 4.0 stars -->
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

const setNavMargin = () => {

    let navEl, navRect;

    navEl = document.querySelector("nav");

    if(typeof navEl !== 'undefined' && navEl !== null)
        navRect = navEl.getBoundingClientRect();

    if(typeof navRect !== 'undefined' && navRect !== null 
        && navEl.checkVisibility() === true)
            document.body.style.paddingBottom = navRect.height + 'px';
}




// reload gif when enter the success screen
function playSuccessAnimation() {
    let screen = document.getElementById("pollSuccess");

    let gif = screen.querySelector("picture>object");

    setTimeout(function() {
        gif.setAttribute("data", "icons/success.gif");
    }, 30);

}

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
