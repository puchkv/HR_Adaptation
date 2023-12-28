

class Poll {

    id = 0;                 // ід опитування
    recKdk = '';            // таб. номер опитуємого
    recFIO = '';            // ПІБ опитуємого
    recINN = '';            // ІПН опитуємого
    recType = '';           // Тип працівника: новачок/хр/керівник
    recTypeId = 0;          // 
    subject = '';           // Тема опитування
    caption = '';           // Текст опитування
    successMsg = '';        // Повідомлення при успішному проходженні опитування
    status = false;         // Статус НЕпонятно
    dateSend = '';          // Дата коли призначено опитування;
    dateTo = '';            // Дата до якої треба пройти опитування
    questions = [];         // Перелік питань

    constructor(details) {

        this.id = details.id,
        this.recKdk = details.recipient.n_kdk ?? "",
        this.recFIO = details.recipient.fam + ' ' + 
                        details.recipient.nam + ' ' + 
                        details.recipient.otch;
        this.recINN = details.recipient.inn;
        this.recType = details.recipient_type;
        this.recTypeId = details.recipient_type_id;
        this.subject = details.subject;
        this.caption = details.caption;
        this.successMsg = details.end_msg;
        this.status = details.status;
        this.dateSend = details.date_send;
        this.dateTo = details.date_to;

        for(let q of details.questions) {
            this.questions.push(
                new PollQuestion(q.id, q.text, q.type, q.answers)
            );
        }
    }
}

class PollQuestion {
    id = 0;
    text = '';
    type = '';
    answers = [];

    constructor(id, text, type, answers) {
        this.id = id;
        this.text = text;
        this.type = type;
        
        for(let answer of answers) {
            this.answers.push(
                new Answer(
                    answer.id, 
                    answer.text, 
                    answer.is_text, 
                    answer.is_selected));
        }
    }
}

class Answer {
    id = 0;
    text  = '';
    is_text = false;
    is_selected = false ;

    constructor(id, text, is_text, is_selected) {
        this.id = id;
        this.text = text;
        this.is_text = is_text;
        this.is_selected = is_selected;
    }
}

export default Poll;