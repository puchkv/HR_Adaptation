import API from "./API2.js";
import Utils from "./utils.js";

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
                    <p>Важливі</p>
                </div>

                <div class="cards expanded">
        `;

        if(this.#members.head) 
        {
            if(mentorIsHead) 
            {
                html += this.#getMemberCard(this.#members.head, "Керівник та наставник");
            }
            else 
            {
                html += this.#getMemberCard(this.#members.head, "Керівник");
                html += this.#getMemberCard(this.#members.mentor, "Наставник");
            }
        }


        html += this.#getMemberCard(this.#members.hr, "HR менеджер");
        html += `</div>`;

        html += `
            <div class="roulette-header">
                <p>${this.#members.colleagues.naim}</p>
            </div>

            <div class="cards" data-type="ceh-members">
                ${ this.#getMemberCard(this.#members.colleagues.head) }
        `;

        for(let m of this.#members.colleagues.members) {
            if(m.length > 0)
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
                <div class='member-card'>
                    <span style="font-weight: bold;">
                        ${  
                            member?.fam + ' ' + 
                            member?.nam + ' ' +
                            member?.otch
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
    }
}

export default new TeamController;


