import Routes from './routes.js'

class API {

    #initData = "query_id=AAHUWZZ3AAAAANRZlnfYKkqY&    user=%7B%22id%22%3A2006342100%2C%22first_name%22%3A%22%D0%AE%D1%80%D1%96%D0%B9%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22lyubchak%22%2C%22language_code%22%3A%22uk%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1697117294&hash=dc39d00ad19160a006b7737be6ee9c6def17a723302b9985ad5aa088c8b6fef2";

    // by default token expired time = 30 minutes
    #getNewExpiredTime() {
        return new Date(new Date().getTime() + 30 * 60 * 1000);
    } 
    
    #getTokenExpiredTime() {
        return new Date(sessionStorage.getItem("expired"));
    }

    tokenExists() {
        let token = sessionStorage.getItem("accessToken");
        return (typeof token !== 'undefined' && token !== null);
    }
        
    
    async send(routeName, requestBody) {

        let route = Routes.get(routeName);

        if(typeof route === 'undefined' || route === null) {
            return console.error(`API: Route path ${routeCode} was not found! Request hasn't been sent!`);
        }

        let token = await this.#getToken();

        if(token === null)
            return console.error("Tokens not found! Execution has been terminated!");

        let request = new Request(route.url.href, {
            method: route.method,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,GET,PATCH,OPTIONS',
                'Authorization': 'Bearer ' + token,
            },
            body: route.method === "POST" ? requestBody : null
        });

        return await this.#awaitResponse(request);
    }

    async #awaitResponse(request, options) {
        return await fetch(request, options)
            .then(response => {
                if(response.ok) {
                    return response.json();
                } 
                else {
                    throw new Error(`Request to ${request.url} return failed status! Check details...`);
                }
            })
            .then(json => {
                return json;
            })
            .catch(e => {
                console.error(`API.FETCH: ${e}`)
            });
    }

    
    async #getToken() {

        if(sessionStorage.getItem("accessToken") === null)  {
            await this.#updateTokens();
        }
        else 
        {
            if(new Date() > this.#getTokenExpiredTime()) {
                await this.#updateTokens();
            }
        }
        
        return sessionStorage.getItem("accessToken");
    }

    async #updateTokens() {
    
        let tokens = await this.#getAccessTokens()
            .then(response => response);
        
        if(tokens.length !== 0) {
            sessionStorage.clear();

            sessionStorage.setItem("accessToken", tokens.accessToken);
            sessionStorage.setItem("refreshToken", tokens.refreshToken);
            sessionStorage.setItem("expired", this.#getNewExpiredTime());
        }
    }

    async #getAccessTokens() {

        let routeName = "GET_ACCESS_TOKEN";
        let route = Routes.get(routeName);

        if(route === null || typeof route === 'undefined')
            return console.error(`Route ${routeName} not found!`)

        // check this for an actual data !!!!
        let initData = window.Telegram?.WebApp?.initData;

        if(typeof initData === 'undefined' || initData === null)
            initData = this.#initData;

        route.url.searchParams.append("initData", initData);

        let result = fetch(route.url.href)
            .then(response => response.json())
            .then(json => {
                
                if(json.success !== true)
                    return console.error("Can't get access token! Success = false")

                if(json.hasOwnProperty("data") 
                    && Object.keys(json.data).length > 0) {

                    return json.data;
                }

            });
        
        return await result;
    }

}

export default new API();