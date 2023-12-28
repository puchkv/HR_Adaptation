import Routes from "./routes.js";

class API {

    test() {

        fetch('/').then((response) => {
            console.log(response.statusText);
        })
    }

     getTestToken = async () => {
        let token = await fetch('./testToken.json')
            .then((response) => response.json())
            .then((json) => json.token);

        return await token;
    }

    async send(routeCode, body, searchParams) 
    {
        const route = Routes.get(routeCode);

        if(route === null || route === undefined || typeof route === 'undefined') {
            console.error(`API: Route path ${routeCode} was not found! Request hasn't been sent!`);
            return;
        }

        const cryptoId = this.#getCryptoId();

        if(cryptoId === null || cryptoId === undefined || !cryptoId.length) {
            console.error("API: Token (cryptoId) not found in URL. Request hasn't been sent!");
            return;
        }

        // cryptoId check validation method, to do!
        
        let url = route.url.href + 
            (searchParams !== undefined ? "?" + new URLSearchParams(searchParams) : "");

        let request = new Request(url, {
            method: route.method,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,GET,PATCH,OPTIONS'
            },
            body: body,
        });

        return await this.#awaitResponse(request);
    }

    #getCryptoId() {
        return new URLSearchParams(window.location.search).get("cryptoId");
    }

    async #awaitResponse(request) {
        return await fetch(request)
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


}

export default new API;
