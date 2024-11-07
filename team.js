import API from "./API2.js";
import Utils from "./utils.js";
import Resources from './resources.js';

class TeamController {

    #element = null;
    #members = [];

    initialize(members) {
        this.#element = document.getElementById("teamMembers");

        if(members === null || typeof members === 'undefined' || typeof members !== 'object') {
            console.warn('Team initialize: team members not found or empty!');
            return Utils.hideTeamButton();
        }

        this.#members = members;
        this.#view();   
    }


    #view() {

        let mentorIsHead = Object.is(this.#members.head.n_kdk, this.#members.mentor.n_kdk);

        let html = `
            <div class="roulette">

                <div class="roulette-header">
                    <p>${Resources.getPhrase('IMPORTANT_LABEL')}</p>
                </div>

                <div class="cards expanded">
        `;

        if(this.#members.head) 
        {
            if(mentorIsHead) 
            {
                html += this.#getMemberCard(this.#members.head, Resources.getPhrase('LEAD_MENTOR_LABEL'));
            }
            else 
            {
                html += this.#getMemberCard(this.#members.head, Resources.getPhrase('LEAD_LABEL'));
                html += this.#getMemberCard(this.#members.mentor, Resources.getPhrase('MENTOR_LABEL'));
            }
        }


        html += this.#getMemberCard(this.#members.hr, Resources.getPhrase('HR_MANAGER_LABEL'));
        html += `</div>`;

        html += `
            <div class="roulette-header">
                <p>${this.#members.colleagues.naim}</p>
            </div>

            <div class="cards" data-type="ceh-members">
                ${ this.#getMemberCard(this.#members.colleagues.head) }
        `;

        for(let m of this.#members.colleagues.members) {
            html += this.#getMemberCard(m);
        }

        html += `</div>`;

        Object.entries(this.#members.colleagues.pod_siblings).forEach(entry => {

            let [i, pod] = entry;

            if(pod.members?.length <= 0)
                return;

            html += `
                <div class="roulette-header text-sm color-hint">
                    <p>${pod.naim}</p>
                </div>

                <div class="cards" data-type="ceh-${i}-members">
                    ${ this.#getMemberCard(pod.head) }
            `;

            for(let m of pod.members) {
                html += this.#getMemberCard(m);
            }

            html += `</div>`;
        }) 
        

        this.#element.innerHTML = html;
        this.#expanderInit();
    }


    #getMemberCard(member, pos = "") {

        return `
            <div class="card icon flex-row">
                <div class="icon-hint">
                    ${
                        member?.photo_url ?
                        `<img src='${member?.photo_url}'/>` : 
                        '<svg><use href="#profile"/></svg>'
                    }
                </div>
                <div class='member-card' data-url='${member?.user_url}}'>
                    <span>
                        <span style="font-weight: bold;">
                            ${  
                                member?.fam + ' ' + 
                                member?.nam + ' ' +
                                member?.otch
                            }
                        </span>
                        ${
                            this.#isEmpty(member?.user_url) 
                                ? '' 
                                : <svg><use href="#telegram" class='author-link'/></svg>
                        }
                    </span>
                    <p>${ pos !== '' ? pos : member?.pos}</p>
                </div>
            </div>
        `;
    }

    #expanderInit() {
        this.#element.querySelectorAll(".card").forEach(card => {
            card.onclick = () => {
                Utils.expandCards(card.parentElement.dataset.type);
            }
        });

        this.#element.querySelectorAll(".author-link").forEach(link => {
            link.onclick = () => {

                const memberCard = link.closest('.member-card'); // Найти ближайший родительский элемент с классом 'member-card'
                const url = memberCard?.getAttribute('data-url'); // Получить значение 'data-url'

                window.Telegram.WebApp.openTelegramLink(url);
            }
        });
    }

    #isEmpty(value) {
        return (
            value === undefined || // значение не определено
            value === null ||      // значение null
            value === ''        // пустая строка
        );
    }
}

export default new TeamController;


