import Utils from "./utils.js";
import API from './API2.js';
import User from './user.js';

class PollsController {

    #section = 'polls';
    #element = '';
    #polls = [];
    #User = null;

    #overallCount = 0;
    
    currentPoll = 0;

    get OverallCount() {
        return this.#overallCount;
    }

    get ClosedCount() {
        switch(this.#User.Role) {
            case User.Roles.Newbee: 
                return this.#polls.filter(p => p.recipient_type_id == 1 && p.status == true).length;
            default: 
                return this.#polls.filter(p => p.status == true).length;
        }
        
    }

    initialize(polls, user) 
    {
        this.#User = user;

        if(polls === null || typeof polls === 'undefined' || 
            !Array.isArray(polls) || polls.length <= 0) 
        {
            console.warn("Polls initialize: polls not found or empty!");
            return this.showEmpty();
        }

        this.#polls = polls
            .filter(p => p.recipient_type_id === this.#User.Role)
            .filter(p => moment() >= moment(p.date_send, "DD.MM.YYYY"))
            .sort((p1, p2) => this.sort(p1, p2));

        if(this.#polls === null) {
            this.showEmpty();
            return;
        }

        this.#element = document.getElementById(this.#section);

        this.#overallCount = polls.length;

        this.#renderAll();
    }    

    start(poll) {

        if(poll == null || typeof poll === 'undefined')
            return console.warn(`PollsController.start(): Poll with id ${poll.id} not found!`);
        
        let elem = document.getElementById("pollPassing");
        let html = `
            <h3>${poll.subject}</h3>

            <form id="activePoll" data-poll="${poll.id}">
                <div class="cards expanded">`;

        for(let q of poll.questions) {
            html += `<div class="card" id='question-${q.id}'>`;
            html += `<p>${q.text}</p>`;

            if(q.type === "radio") {
                html += `<div class="sp-line"></div>`;
                
                for(let ans of q.answers.filter(a => !a.is_text)) {
                    //<svg><use href="#checkmark"/></svg>
                    html += `
                        <div class="custom-radio">
                            <input id="${ans.id}" type="radio" name="${q.id}" value="${ans.id}"/>
                            <div></div>
                            <label for="${ans.id}">${ans.text}</label>
                        </div>`;
                    
                }

                for(let ans of q.answers.filter(a => a.is_text)) {
                    html += `
                        <textarea id='${ans.id}' name='${q.id}' placeholder="Введіть вашу відповідь"></textarea>
                    `;
                }
            }

            if(q.type === "checkbox") {
                html += `<div class="sp-line"></div>`;
                
                for(let ans of q.answers.filter(a => !a.is_text)) {

                    html += `                        
                        <label class="checkbox">
                            <input id="${ans.id}" type="checkbox" name="${q.id}" value="${ans.id}"/>
                            <svg><use href="#checkmark"/></svg>
                            ${ans.text}
                        </label>
                        `;
                    
                }

                for(let ans of q.answers.filter(a => a.is_text)) {
                    html += `
                        <textarea id='${ans.id}' name='${q.id}' placeholder="Введіть вашу відповідь"></textarea>
                    `;
                }
            }
            html += `</div>`;
        }
        
        html += `</div></form>`;
        elem.innerHTML = html;
        
        Utils.loadScreen('pollPassing');
        Utils.checkInputs();

        Utils.showMainButton('Надіслати відповіді', () => this.post());
        Utils.showBackButton(() => this.view(poll.id));
    }

    post() {

        let inputs = document.getElementById('activePoll').getElementsByTagName("input");
        let textInputs = document.getElementById('activePoll').getElementsByTagName("textarea");

        let emptyQuestionId = this.isAnyEmptyAnswer();

        if(emptyQuestionId !== '') {
            let elem = document.getElementById(emptyQuestionId);
            elem.classList.add("empty-field");
            elem.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            window.Telegram.WebApp.showAlert("Вкажіть відповідь на питання!");

            setTimeout(() => {
                elem.classList.remove("empty-field");
            }, 2000, elem);

            return false;
        }

        var data = { "answers": new Array() };

        for(let inp of inputs) {
            if(inp.checked)
                data.answers.push({id: inp.value});
        }

        for(let text of textInputs) {
            if(text.value !== '')
                data.answers.push({id: text.id, text: text.value});
        }

        API.send("POST_POLL_ANSWERS", JSON.stringify(data))
            .then(response => {
                if(typeof response !== 'undefined' && response.success) {
                    
                    Utils.showAnimation("party", "Результати опитування надіслано!", false);

                    Utils.showMainButton('На головну', function() {
                        window.location.reload();
                    });

                    Utils.hideBackButton();

                } else {
                    console.error(`POST ANSWERS: ${response?.data?.message}`);
                }
            })
            .catch(err => {
                window.dispatchEvent(new CustomEvent("app-failed", { detail: err }));
            });        
    }

    isAnyEmptyAnswer() {

        let questions = document.getElementById('activePoll').querySelectorAll(".card");

        for(let q of questions) {
            let checks = q.querySelectorAll("input:checked");
            let inputs = q.querySelectorAll("textarea");
            let emptyInputs = 0;

            for(let inp of inputs) {
                if(inp.value === '')
                    emptyInputs++;
            }

            if(checks.length <= 0 && emptyInputs > 0)
                return q.id;
            else if(checks.length <= 0 && inputs?.length == 0)
                return q.id;
            else
                continue;
        };

        return '';
    }


    view(pollId) {
        let pollElem = document.getElementById("pollStart");

        let poll = this.#polls.find(p => p.id == pollId);
        
        if(poll == null || typeof poll === 'undefined') {
            return console.warn(`PollsController.view(): Poll with id ${pollId} not found!`);
        }

        pollElem.innerHTML = `
            <h3>${poll.subject}</h3>

            <div class="card">
                ${Utils.nl2br(poll.caption)}
            </div>

            <div class="card icon flex-row">
                <div class="icon-hint">
                    <svg><use href="#calendar"/></svg>
                </div>
                <div>
                    <span style="font-weight: bold;">Дата виконання</span>
                    <p>${poll.date_to.split(' ')[0]}</p>
                </div>
            </div>

            <div class="card icon flex-row">
                <div class="icon-hint">
                    <svg><use href="#clock"/></svg>
                </div>
                <div>
                    <span style="font-weight: bold;">Орієнтовний час проходження</span>
                    <p>${poll.time_to}хв</p>
                </div>
            </div>

            <div class="card icon flex-row">
                <div class="icon-hint">
                    <svg><use href="#question"/></svg>
                </div>
                <div>
                    <span>
                    ${poll.questions.length}
                    ${Utils.getNoun(poll.questions.length, 'питання', 'питання', 'питань')}
                    </span>
                </div>
            </div>
        `;

        Utils.loadScreen('pollStart');

        if(poll.status) 
        {
            Utils.showMainButton('Переглянути відповіді', () => this.seeAnswers(poll));
            Utils.showBackButton(() => Utils.loadScreen('polls'));
        }
        else 
        {
            Utils.showMainButton('Почати опитування', () => this.start(poll));
            Utils.showBackButton(() => Utils.loadScreen('polls'));
        }
    }

    seeAnswers(poll) {

        if(poll == null || typeof poll === 'undefined')
            return console.warn(`PollsController.seeAnswers(): Poll with id ${poll.id} not found!`);
        
        let elem = document.getElementById("pollPassing");
        let html = `
            <h3>${poll.subject}</h3>
                <div class="cards expanded">`;

        for(let q of poll.questions) {
            html += `<div class="card" id='question-${q.id}'>`;
            html += `<p>${q.text}</p>`;

            if(q.type === "radio") {
                html += `<div class="sp-line"></div>`;
                
                for(let ans of q.answers.filter(a => !a.is_text)) {
                    let checked = ans.is_selected ? ' checked ' : '';

                    html += `
                        <div class="custom-radio">
                            <input id="${ans.id}" ${checked} type="radio" name="${q.id}" value="${ans.id}" disabled>
                            <div></div>
                            <label for="${ans.id}">${ans.text}</label>
                        </div>`;
                    
                }

                for(let ans of q.answers.filter(a => a.is_text)) {
                    html += `
                        <textarea id='${ans.id}' name='${q.id}' disabled readonly>${ans.text}</textarea>
                    `;
                }
            }

            if(q.type === "checkbox") {
                html += `<div class="sp-line"></div>`;
                
                for(let ans of q.answers.filter(a => !a.is_text)) {

                    let checked = ans.is_selected ? ' checked ' : '';

                    html += `                        
                        <label class="checkbox">
                            <input id="${ans.id}" ${checked} type="checkbox" name="${q.id}" value="${ans.id}" disabled/>
                            <svg><use href="#checkmark"/></svg>
                            ${ans.text}
                        </label>
                        `;
                    
                }

                for(let ans of q.answers.filter(a => a.is_text)) {
                    html += `
                        <textarea id='${ans.id}' name='${q.id}' disabled readonly>${ans.text}</textarea>
                    `;
                }
            }
            html += `</div>`;
        }
        
        html += `</div>`;
        elem.innerHTML = html;
        
        Utils.loadScreen('pollPassing');
        Utils.checkInputs();

        Utils.showMainButton('Повернутись', function() {
            Utils.loadScreen('polls');
            Utils.showNav();
            Utils.hideMainButton();
        });
    }


    #renderAll() {

        let html = '<div class="roulette">';

        if(this.#polls == null || this.#polls.length == 0) {
            return this.showEmpty();
        }

        let polls = this.#polls;

        /* Switch to init code
        switch(this.#User.Role) {
            case User.Roles.Newbee: polls = this.#polls.filter(p => p.recipient_type_id == 1); break;
            case User.Roles.Mentor: polls = this.#polls.filter(p => p.recipient_type_id == 2); break;
            case User.Roles.HR: polls = this.#polls; break;
            default: polls = null; break;
        }

        if(polls == null || polls.length == 0) {
            return this.showEmpty();
        }*/

        if(polls.some(p => p.status == false)) {

            html += `
                <div class="roulette-header">
                    <p>Активні</p>
                </div>
                
                <div class="cards expanded">
                `;

            // HR-фахівець бачить опитування всіх
            if(this.#User.isHR) {

                // Опитування керівника
                let mentorPolls = polls.filter(p => p.recipient_type_id == 2 && p.status == false);
                
                if(mentorPolls.length > 0) {
                    html += `<h5>Керівника</h5>`;
                    for(let poll of mentorPolls) {
                        html += this.#getCardHtml(poll);
                    }
                }

                // Опитування новачка
                let newbeePolls = polls.filter(p => p.recipient_type_id == 1 && p.status == false);

                if(newbeePolls.length > 0) {
                    html += `<h5>Новачка</h5>`;
                    for(let poll of newbeePolls) {
                        html += this.#getCardHtml(poll);
                    }
                }
            }
            else
            {
                for(let poll of polls.filter(p => p.recipient_type_id == this.#User.Role && p.status == false)) {
                    html += this.#getCardHtml(poll);
                }
            }

            // for(let poll of this.#polls.filter(p => p.status == false)) {
            //     html += this.#getCardHtml(poll);
            // }
        }

        html += '</div>';   

        if(polls.some(p => p.status == true)) {

            html += `
                <div class="roulette-header">
                    <p>Завершені</p>
                </div>
                
                <div class="cards expanded">
                `;

            // HR-фахівець бачить опитування всіх
            if(this.#User.isHR) {

                // Опитування керівника
                let mentorPolls = polls.filter(p => p.recipient_type_id == 2 && p.status == true);
                
                if(mentorPolls.length > 0) {
                    html += `<h5>Керівника</h5>`;
                    for(let poll of mentorPolls) {
                        html += this.#getCardHtml(poll);
                    }
                }

                // Опитування новачка
                let newbeePolls = polls.filter(p => p.recipient_type_id == 1 && p.status == true);

                if(newbeePolls.length > 0) {
                    html += `<h5>Новачка</h5>`;
                    for(let poll of newbeePolls) {
                        html += this.#getCardHtml(poll);
                    }
                }
            }
            else
            {
                for(let poll of polls.filter(p => p.recipient_type_id == this.#User.Role && p.status == true)) {
                    html += this.#getCardHtml(poll);
                }
            }
        }

        html += "</div>";

        this.#element.innerHTML += html;
        this.#element.dispatchEvent(new Event("pollsLoaded"));
    }

    #getCardHtml(poll) { 
        let status = poll.status == false ? '' : 'inactive';

        let isoDate = poll.date_to.split(' ')[0].split('.').reverse();
        let expired = Date.now() > new Date(isoDate);

        return `
            <div class="card ${status}" data-poll=${poll.id} data-done=${poll.status == true}>
                <div class="card-body">
                    <span>${poll.subject}</span>
                </div>
                <div class="card-footer">
                    <div class="col">
                        <svg><use href="#clock-hint"/></svg>
                        <span>${poll.time_to}хв</span>
                    </div>
                    <div class="col">
                        <svg><use href="#question-hint"/></svg>
                        <span>
                        ${poll.questions.length} 
                        ${Utils.getNoun(poll.questions.length, 'питання', 'питання', 'питань')}
                        </span>
                    </div>
                    <div class="col">
                        <svg><use href="#date-hint"/></svg>
                        <span style='${expired && !poll.status ? 'font-weight:bold' : ''}'>
                        ${poll.date_to.split(' ')[0]}
                        </span>
                    </div>
                </div>
            </div>
        `;   
    }

    showEmpty() {

        document.getElementById(this.#section).innerHTML += `
            <div class='empty-page'>
                <dotlottie-player src="./icons/empty.json" background="transparent" speed="1" style="width: 300px; height: 300px" direction="1" mode="normal" loop autoplay></dotlottie-player>
                <span>Опитувань немає</span>
            </div>
        `;

    }

    sort(p1, p2) {
        
        let format = "dd.MM.yyyy";

        return moment(p1.date_to, format) - moment(p2.date_to, format) 
            || p1.status != p2.status;
    }
} 

export default new PollsController;



