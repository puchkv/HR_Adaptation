
import Utils from "./utils.js";
import API from './API2.js';

class User {

    #_inn = null;
    #_role = null;

    Roles = {
        Newbee: 1,      // Новачок (ветеран)
        Head: 2,        // Керівник
        Mentor: 3,      // Наставник
        HR: 4,          // HR
        Personnel: 5,   // Працівник кадрів
        Chaperone: 6,   // Супроводжуючий
        Lawyer: 7,      // Юрист
        Educator: 8,    // Провідник навчання,
        UNKNOWN: -1
    };

    set Role(role) {
        this.#_role = role;
    }

    get Role() {
        return this.#_role;
    }

    set Inn(inn) {
        this.#_inn = inn;
    }

    get Inn() {
        return this.#_inn;
    }

    get isMentor() {
        return this.Role === this.Roles.Mentor || this.Role === this.Roles.Head;
    }

    get isNewbee() {
        return this.Role === this.Roles.Newbee;
    }

    get isChaperone() {
        return this.Role === this.Roles.Chaperone;
    }

    get isHR() {
        return this.Role === this.Roles.HR || this.Role === this.Roles.Chaperone;
    }

    get isUnknown() {
        return this.Role === this.Roles.UNKNOWN || this.Role == null || typeof this.Role === 'undefined';
    }

    GetRole(inn, adaptation) {
        switch(inn) {
            case adaptation.card.inn: return this.Roles.Newbee;
            case adaptation.mentor.inn: return this.Roles.Mentor;
            case adaptation.hr.inn: return this.Roles.HR;
            // new roles
            case adaptation.vhr?.inn: return this.Roles.Personnel;
            case adaptation.head?.inn: return this.Roles.Head;
            case adaptation.sup?.inn: return this.Roles.Chaperone;
            case adaptation.advoc?.inn: return this.Roles.Lawyer;
            case adaptation.edu?.inn: return this.Roles.Educator;
            case adaptation.pod_kers.some(pod => pod.head.inn === inn): return this.Roles.Head;
            // to do add new role
            default: return this.Roles.UNKNOWN;
        }
    }
    
    GetInn() {
        return (async () => {
            return await this.#FetchInn().then(data => data);
        })();
    }

    #FetchInn() {
        return (
            API.send('GET_SELF_INFO')
                .then(response => {
                    return response.data.personal.inn;
                })
                .catch(error => {
                    return error;
                })
        );
    }

}

export default new User;









