
import Utils from './utils.js';

class Routes {

    constructor() {

        this.baseUrl = "https://bot.kness.energy/KnessApp/v1";

        this.routes = [
            {
                title: "Get authorize token",
                code: "GET_ACCESS_TOKEN",
                path: "/auth/client/webapp",
                method: "GET",
            },
            {
                title: "Get adaptation script details",
                code: "GET_ADAPTATION_SCENARIO",
                path: "/adaptation/" + Utils.SearchParams.get("inn"),
                method: "GET"
            },  
            {
                title: "Complete task by newbee",
                code: "POST_COMPLETE_TASK",
                path: "/adaptation/task/complete",
                method: "POST"
            },
            {
                title: "Rate task by mentor",
                code: "POST_RATE_TASK",
                path: "/adaptation/task/rate",
                method: "POST"
            },
            {
                title: "Send poll answers",
                code: "POST_POLL_ANSWERS",
                path: "/adaptation/poll/answer",
                method: "POST"
            },
            {
                title: "Get self info",
                code: "GET_SELF_INFO",
                path: "/client/self",
                method: "GET"
            },
            {
                title: "Get self department colleagues",
                code: "GET_COLLEAGUES",
                path: "/client/colleagues",
                method: "GET"
            }
        ];
    }

    get(routeCode) {

        let route = this.routes.find(r => r.code === routeCode);

        if(route === null || typeof route === 'undefined' || route.length <= 0) {
            return undefined;
        }

        route.url = new URL(this.baseUrl + route.path);

        return route;
    }
}


export default new Routes;

