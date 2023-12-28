import Utils from "./utils.js";
import API from "./API2.js";

class TasksController {

    #section = "tasks";
    #tasks = [];

    #statuses = {
        IN_PROGRESS: 1,
        DONE: 2,
        RATED: 3
    }

    initialize(tasks) {

        if(tasks === null || typeof tasks === 'undefined' || 
            !Array.isArray(tasks) || tasks.length <= 0) 
        {
            console.warn("Tasks initialize: tasks not found or empty!");
            return this.showEmpty();
        }

        this.#tasks = tasks.sort((t1, t2) => this.sort(t1, t2));

        let generalTasks = tasks.filter((t) => t.category.includes("Загальна програма"));
        let individualTasks = tasks.filter((t) => t.category.includes("Індивідуальна програма"));

        let container = document.getElementById(this.#section);

        let html = `<div class="roulette">`;

        if(generalTasks.length > 0) {

            html += `
                    <div class="roulette-header">
                        <h3>Загальна програма</h3>
                        <div class="expand-more" data-type="general">
                            <p></p>
                            <svg><use href="#arrow"/></svg>
                        </div>
                    </div>

                    <div class="cards" data-type="general">`;

            for(let task of generalTasks) {
                html += this.#getCardHTML(task);
            }

            html += `</div>`;
        }

        if(individualTasks.length > 0) {

            html += ` 
                <div class="roulette-header">
                    <h3>Індивідуальна програма</h3>
                    <div class="expand-more" data-type="individual">
                        <p></p>
                        <svg><use href="#arrow"/></svg>
                    </div>
                </div>

                <div class="cards" data-type="individual">`;
            
            for(let task of individualTasks) {
                html += this.#getCardHTML(task);
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
                    <span style="font-weight: bold;">Ініціатор</span>
                    <div style="display:flex;gap: 5px;">
                        <p>${task.author.fam} ${task.author.nam} ${task.author.otch}</p>
                        <svg><use href="#telegram" /></svg>
                    </div>
                </div>
            </div>

            <div class="card icon flex-row">
                <div class="icon-hint">
                    <svg><use href="#calendar"/></svg>
                </div>
                <div>
                    <span style="font-weight: bold;">Дата виконання</span>
                    <p>${task.date_to}</p>
                </div>
            </div>`;

        document.getElementById("taskView").innerHTML = taskHtml;
        Utils.loadScreen("taskView");

        Utils.hideNav();

        if(task.status_id !== 1) 
        {
            Utils.showMainButton("Назад").onclick = () => {
                Utils.loadScreen('tasks');
                Utils.hideMainButton();
                Utils.showNav();
            }
        }
        else 
        {
            Utils.showMainButton("Виконано").onclick = () => {

                console.log(JSON.stringify({id: task.id}));
    
                API.send("POST_COMPLETE_TASK", JSON.stringify({
                    id: task.id
                })).then(response => {
    
                    if(response !== null && typeof response !== 'undefined'
                        && response.success) 
                    {
                        window.location.reload();
                    }
    
                }).catch(error => {
                    return console.error(error);
                });
            };
        }   
    }

    
    #getCardHTML(task) {
        return `
        <div class="card" data-task=${task.id} 
            data-done=${task.status_id != this.#statuses.IN_PROGRESS}>
            <div class="card-body">
                <div class="radiocheck 
                ${task.status_id != this.#statuses.IN_PROGRESS ? 'checked' : ''}">
                    <svg><use href="#checkmark"/></svg>
                </div>
                <span>${task.subject}</span>
            </div>
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
        </div>`;
    }

    showEmpty() {
        document.getElementById(this.#section).innerHTML += `
            <div class='empty-page'>
                <img src='./images/check-hint.png' />
                <span>Завдання відсутні</span>
            </div>
        `;
    }

    sort(t1, t2) {

        var date1 = new Date(Utils.getISODate(t1.date_to));
        var date2 = new Date(Utils.getISODate(t2.date_to));

        return (t1.status_id - t2.status_id || date1 - date2);
    }


}

export default new TasksController;

