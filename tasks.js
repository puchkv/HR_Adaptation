import Utils from "./utils.js";
import API from "./API2.js";
import Resources from './resources.js';
import User from "./user.js";

class TasksController {


    #section = "tasks";
    #tasks = [];
    #User = {};

    #statuses = {
        IN_PROGRESS: 1,
        DONE: 2,
        RATED: 3
    }

    get OverallCount() {
        return this.#tasks.length;
    }

    get ClosedCount() {
        return this.#tasks.filter(t => t.status_id != this.#statuses.IN_PROGRESS).length;
    }


    initialize(tasks, user) {

        if(tasks === null || typeof tasks === 'undefined' || 
            !Array.isArray(tasks) || tasks.length <= 0) 
        {
            console.warn("Tasks initialize: tasks not found or empty!");
            return this.showEmpty();
        }

        this.#User = user;

        // tasks = tasks.filter(t => t.recipient_type_id === this.#User.Role);

        this.#tasks = tasks.sort((t1, t2) => this.sort(t1, t2));

        let generalTasks = tasks.filter((t) => t.category.includes("Загальна програма"));
        let individualTasks = tasks.filter((t) => t.category.includes("Індивідуальна програма"));

        
        let generalTypes = generalTasks.map(t => t.type).filter((value, index, self) => self.indexOf(value) === index);
        let individualTypes = individualTasks.map(t => t.type).filter((value, index, self) => self.indexOf(value) === index);

        let container = document.getElementById(this.#section);

        let html = `<div class="roulette">`;

        if(generalTasks.length > 0) {

            html += `
                    <div class="roulette-header">
                        <h3>${Resources.getPhrase('GENRAL_PROGRAM_LABEL')}</h3>
                        <div class="expand-more" data-type="general">
                            <p></p>
                            <svg><use href="#arrow"/></svg>
                        </div>
                    </div>

                    <div class="cards" data-type="general">`;

            for(let type of generalTypes) {
                html += `<h5>${type}</h5>`;

                for(let task of generalTasks.filter(t => t.type == type)) {
                    html += this.#getCardHTML(task);
                }
            }

            html += `</div>`;
        }

        if(individualTasks.length > 0) {

            html += ` 
                <div class="roulette-header">
                    <h3>${Resources.getPhrase('INDIVIDUAL_PROGRAM_LABEL')}</h3>
                    <div class="expand-more" data-type="individual">
                        <p></p>
                        <svg><use href="#arrow"/></svg>
                    </div>
                </div>

                <div class="cards" data-type="individual">`;
            
            for(let type of individualTypes) {
                html += `<h5>${type}</h5>`;

                for(let task of individualTasks.filter(t => t.type == type)) {
                    html += this.#getCardHTML(task);
                }
            }

            html += `</div>`;
        }   

        html += `</div>`;

        container.innerHTML += html;

        container.dispatchEvent(new Event("tasksLoaded"));
    }

    view(taskId) {

        let task = this.#tasks.find(t => t.id == taskId);

        if(task == null || typeof task === 'undefined') {
            return console.warn(`TasksController.view(): Task with id ${pollId} not found!`);
        }

        let taskHtml = `
            <h3>${task.subject}</h3>

            <div class="card ls-xl lh-large">
                ${Utils.nl2br(task.caption)}
            </div>

            <div class="card icon flex-row">
                <div class="icon-hint">
                    ${task.author.photo_url !== '' ?
                        `<img src='${task.author.photo_url}'/>` : 
                        '<svg><use href="#profile"/></svg>'}
                </div>
                <div>
                    <span style="font-weight: bold;">
                        ${Resources.getPhrase('INITIATOR_LABEL')}
                    </span>
                    <div style="display:flex;gap: 5px;">
                        <p>${task.author.fam} ${task.author.nam} ${task.author.otch}</p>
                        <svg><use href="#telegram" id="authorlink"/></svg>
                    </div>
                </div>
            </div>

            <div class="card icon flex-row">
                <div class="icon-hint">
                    <svg><use href="#calendar"/></svg>
                </div>
                <div>
                    <span style="font-weight: bold;">
                        ${Resources.getPhrase('DATE_EXECUTE_LABEL')}
                    </span>
                    <p>${task.date_to}</p>
                </div>
            </div>`;

        document.getElementById("taskView").innerHTML = taskHtml;

        document.getElementById("authorlink").onclick = () => {
            window.Telegram.WebApp.openTelegramLink(task.author.user_url);
        };

        console.log(`User INN: ${this.#User.Inn}, Author INN: ${task.author.inn}`);
        console.log(this.#User.Inn == task.author.inn);

        if(this.#User.Inn == task.author.inn && task.status_id == this.#statuses.DONE) {

            taskHtml += `
                <div class="sp-line"></div>
                <div class="card p-16">
                    <h3>${Resources.getPhrase('HOW_YOU_RATE_TASK')}</h3>
                    <div class="rating my-12">
                        <svg><use href="#star" /></svg>
                        <svg><use href="#star" /></svg>
                        <svg><use href="#star" /></svg>
                        <svg><use href="#star" /></svg>
                        <svg><use href="#star" /></svg>
                    </div>

                    <textarea id="task-comment" placeholder="${Resources.getPhrase('RATE_COMMENT_LABEL')}"></textarea>
                </div>
            `;

            document.getElementById("taskView").innerHTML = taskHtml;

            document.querySelectorAll(".rating>svg")?.forEach(rateBtn => {
                rateBtn.onclick = () => {
                    let rate = 0;
                    let temp = rateBtn;
    
                    while(temp != null) {
                        rate++;
                        temp.querySelector("use")?.setAttribute("href", "#star-filled");
                        temp.classList.add("checked");
                        temp = temp.previousElementSibling;
                    }
    
                    let nextEl = rateBtn;
                    while(nextEl != null) {
                        nextEl = nextEl.nextElementSibling;
                        nextEl?.classList?.remove("checked");
                        nextEl?.querySelector("use")?.setAttribute("href", "#star");
                    }
                    
                    let commEl = document.querySelector(".card[data-type='task-comment']");
                    commEl?.removeAttribute("display");
    
                    Utils.showMainButton(Resources.getPhrase('RATE_IT_LABEL'), () => this.rate(task.id, rate));
                    Utils.showBackButton(() => Utils.loadScreen('tasks'));
                    return;
                }
            });
        }

        if(task.status_id == this.#statuses.RATED) {

            // Solid stars variant
            // taskHtml += `
            //     <div class="card">
            //         <div class="rating my-12 w-80">
            //     `;
            
            // for(let i = 1; i <= 5; i++) {
            //     taskHtml += i <= task.rate 
            //         ? `<svg><use href="#star-solid" /></svg>` 
            //         : `<svg><use href="#star" /></svg>`;  
            // }   
            
            // taskHtml += `</div></div>`;

            // Variant 2.0
            // taskHtml += `
            // <div class="card icon flex-row">
            //     <div class="icon-hint">
            //         <svg><use href="#chat"/></svg>
            //     </div>
            //     <div>
            //         <span style="font-weight: bold;">Коментар до оцінки</span>
            //         <p>${task.rate_comm}</p>
            //     </div>
            // </div>`;

            // Figma variant
            taskHtml += `
                <div class="card task-comment">
                    <div class="flex-row gap-4 mb-6">
                        <h3 class="bold">${Resources.getPhrase('RATE_LABEL')} ${task.rate}</h3>
                        <svg><use href="#star-filled"/></svg>
                    </div>

                    <div class="flex-row row-start">
                        <svg class="chat-icon"><use href="#chat"/></svg>
                        <p>${task.rate_comm}</p>
                    </div>
                </div>
            `;

            // taskHtml += `
            //     <div class="card">
            //         <div class="rating my-12 w-80">
            //     `;
            
            // for(let i = 1; i <= 5; i++) {
            //     taskHtml += i <= task.rate 
            //         ? `<svg><use href="#star-filled" /></svg>` 
            //         : `<svg><use href="#star" /></svg>`;  
            // }   
            
            // taskHtml += `
            //         </div>
            //     </div>
            // `;

            document.getElementById("taskView").innerHTML = taskHtml;
        }
        
        Utils.loadScreen("taskView");

        if(this.#User.isNewbee && task.status_id == this.#statuses.IN_PROGRESS) 
        {   
            Utils.showBackButton(() => Utils.loadScreen('tasks'));
            Utils.showMainButton(Resources.getPhrase('COMPLETED_LABEL'), function () {
                API.send("POST_COMPLETE_TASK", JSON.stringify({ id: task.id})
                ).then(response => {
    
                    if(response !== null && typeof response !== 'undefined'
                        && response.success) 
                    {
                        Utils.showAnimation("party", Resources.getPhrase('TASK_COMPLETED'), false);
                        Utils.showMainButton(Resources.getPhrase('TO_HOME_LABEL'), () => window.location.reload());
                        Utils.hideBackButton();
                    }
    
                }).catch(error => {
                    return console.error(error);
                });
            });
        }
        else 
        {
            Utils.showMainButton(Resources.getPhrase('BACK_LABEL'), function() {
                Utils.loadScreen('tasks');
                Utils.hideMainButton();
                Utils.showNav();
            });
        }   
    }

    rate(id, rate) {
        
        let comm = document.getElementById("task-comment")?.value;

        if(comm == null || comm === '' || typeof comm === 'undefined') {
            if(Utils.isTelegramClient) {
                window.Telegram.WebApp.showAlert(Resources.getPhrase('COMMENT_REQUIRED'));
                return;
            }
            else {
                alert(Resources.getPhrase('COMMENT_REQUIRED'));
                return;
            }
        }

        API.send("POST_RATE_TASK", JSON.stringify({
            id: id,
            rate: rate,
            comment: comm
        })).then(response => {
            
            if(response.success) {
                Utils.showAnimation("thumb", Resources.getPhrase('TASK_RATED'), false);
                Utils.showMainButton(Resources.getPhrase('BACK_LABEL'), () => window.location.reload());
                Utils.showBackButton(() => window.location.reload());
            }

        }).catch(error => {
            return error;
        });

    }
    
    #getCardHTML(task) {
        let html = `
        <div class="card" data-task=${task.id} 
            data-done=${task.status_id != this.#statuses.IN_PROGRESS}>
            <div class="card-body">
                <div class="radiocheck full-rounded 
                ${task.status_id != this.#statuses.IN_PROGRESS ? 'checked' : ''}">
                ${task.status_id != this.#statuses.IN_PROGRESS ? `<svg><use href="#checkmark-hint"/></svg>` : `<svg><use href="#checkmark"/></svg>`}
                </div>
                <span>${task.subject}</span>
        `;

        if(task.status_id == this.#statuses.RATED) {
            html += `
                <div class="task-rate">
                    <span>${task.rate}</span>
                    <svg><use href="#star-filled"/></svg>
                </div>
            `;    
        }   

        html += `</div>`;

        if(this.#User.Inn == task.author.inn && task.status_id == this.#statuses.DONE) {
            html += `
                <div class="card-footer">
                    <div class="col">
                        <svg><use href="#star"/></svg>
                        <span>${Resources.getPhrase('NEED_RATE_LABEL')}</span>
                    </div>
                </div>
            `;
        } 
        else
        {
            html += `
                <div class="card-footer">
                    
                    <div class="col">
                        <div class="profile-icon-small">
                            ${task.author.photo_url !== '' ?
                            `<img src='${task.author.photo_url}'/>` : 
                            '<svg><use href="#profile-hint"/></svg>'}
                        </div>
                        <span>
                            ${task.author.fam} 
                            ${task.author.nam.charAt(0)}.
                            ${task.author.otch.charAt(0)}.
                        </span>
                    </div>
                    <div class="col">
                        <svg><use href="#date-hint"/></svg>
                        <span>${task.date_to}</span>
                    </div>
                </div>
            `;
            
            if(task.status_id == this.#statuses.RATED && task.rate_comm != '') {
                html += `
                    <div class="sp-line"></div>
                    <div class="card-comment">
                        <svg><use href="#chat"/></svg>
                        <span>${task.rate_comm}</span>
                    </div>
                `;
            }
        }

        html += `</div>`;

        return html;
    }

    showEmpty() {
        document.getElementById(this.#section).innerHTML += `
            <div class='empty-page'>
                <dotlottie-player src="./icons/empty.json" background="transparent" speed="1" style="width: 300px; height: 300px" direction="1" mode="normal" loop autoplay></dotlottie-player>
                <span>${Resources.getPhrase('TASKS_EMPTY_LABEL')}</span>
            </div>
        `;
    }

    sort(t1, t2) {

        let format = "dd.MM.yyyy";

        return (t1.status_id - t2.status_id 
            || moment(t1.date_to, format) - moment(t2.date_to, format));
    }


}

export default new TasksController;

