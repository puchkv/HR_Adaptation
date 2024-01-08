
import Utils from "./utils.js";
import API from './API2.js';

class User {

    #_inn = null;
    #_role = null;

    Roles = {
        Newbee: 1,
        Mentor: 2,
        HR: 3,
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
        return this.Role === this.Roles.Mentor;
    }

    get isNewbee() {
        return this.Role === this.Roles.Newbee;
    }

    get isHR() {
        return this.Role === this.Roles.HR;
    }

    get isUnknown() {
        return this.Role === this.Roles.UNKNOWN || this.Role == null || typeof this.Role === 'undefined';
    }

    GetRole(inn, adaptation) {
        switch(inn) {
            case adaptation.card.inn: return this.Roles.Newbee;
            case adaptation.mentor.inn: return this.Roles.Mentor;
            case adaptation.hr.inn: return this.Roles.HR;
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
                    console.error(error);
                    return null;
                })
        );
    }

}

export default new User;









