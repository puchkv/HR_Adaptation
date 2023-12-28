/*  SVG DATA-TYPES:
*   S - Stroke (або нічого теж сюди), іконка буде краситись обводкою
*   F - Fill, іконка буде краситись заливкою
*   N - None, іконку не буде покрашено, залишиться колір вказаний в коді іконки
*/


export const initIcons = () => {

    let defs = document.createElement("defs");

    for(let icon of icons) {

        let svg = Object.values(icon);

        if(typeof svg !== 'undefined' && svg !== null) {
            defs.innerHTML += Object.values(icon);
        }
    }

    if(defs.children && defs.children.length > 0) {
        defs.style.visibility = "hidden";
        defs.style.maxHeight = '0px';
        document.body.append(defs);
    }
}

const icons = [
    {
        "telegram": `
            <svg id="telegram" data-type="F" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <path d="m18.949 4.275-2.717 11.88c-.205.838-.739 1.047-1.498.652l-4.14-2.828-1.996 1.78c-.221.206-.406.377-.832.377l.297-3.909 7.671-6.428c.334-.276-.072-.429-.518-.153l-9.483 5.538L1.65 9.999c-.888-.258-.904-.824.185-1.219l15.969-5.705c.739-.258 1.386.152 1.145 1.2Z"/>
            </svg>
        `
    },
    {
        "arrow": `
            <svg id="arrow" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m4 7 6.154 6.154L16.308 7"/>
            </svg>
        `
    },
    {
        "bell": `
            <svg id="bell" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.844 16.1a2.066 2.066 0 0 1-.813.659c-.337.158-.72.241-1.109.241-.39 0-.772-.083-1.109-.241a2.068 2.068 0 0 1-.813-.66m6.667-8.401c0-1.246-.492-2.441-1.367-3.322A4.65 4.65 0 0 0 10 3a4.651 4.651 0 0 0-3.3 1.376 4.714 4.714 0 0 0-1.367 3.322c0 5.48-2.333 7.046-2.333 7.046h14s-2.333-1.565-2.333-7.046Z"/>
            </svg>
        `
    },
    {
        "calendar": `
            <svg id="calendar" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.23 5.154c-.326 0-.639.113-.87.315-.23.202-.36.476-.36.762v9.692c0 .286.13.56.36.762.231.202.544.315.87.315h13.54c.326 0 .639-.113.87-.315.23-.202.36-.476.36-.762V6.231c0-.286-.13-.56-.36-.762a1.326 1.326 0 0 0-.87-.315h-2.462M2 9.462h16M5.693 3v4.308M14.308 3v4.308M5.693 5.154h6.154"/>
            </svg>
        `
    },
    {
        "chat": `
            <svg id="chat" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width=".5" d="M6.78 10.562A.78.78 0 1 0 6.78 9a.78.78 0 0 0 0 1.562ZM9.903 10.562a.78.78 0 1 0 0-1.562.78.78 0 0 0 0 1.562ZM13.025 10.562a.78.78 0 1 0 0-1.562.78.78 0 0 0 0 1.562Z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.998 2A8.403 8.403 0 0 0 5.89 3.066a7.733 7.733 0 0 0-2.94 2.893 7.12 7.12 0 0 0-.938 3.898 7.189 7.189 0 0 0 1.33 3.797L2 17l4.491-.762A8.438 8.438 0 0 0 9.963 17a8.441 8.441 0 0 0 3.48-.73 7.936 7.936 0 0 0 2.795-2.074 7.318 7.318 0 0 0 1.557-3.008c.27-1.1.273-2.243.008-3.344A7.314 7.314 0 0 0 16.26 4.83a7.932 7.932 0 0 0-2.786-2.087A8.44 8.44 0 0 0 9.998 2Z"/>
            </svg>
        `
    },
    {
        "checkmark": `
            <svg id="checkmark" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <path stroke-linecap="round" stroke-width="1.5" d="m5 11.565 3.34 2.282c.09.063.195.109.308.133.112.024.23.027.344.007a.893.893 0 0 0 .32-.116.75.75 0 0 0 .234-.219L14.778 6"/>
            </svg>
        `
    },
    {
        "clock": `
            <svg id="clock" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.99995 6.92314V10.0001L13.1261 13.6432M10.0001 18C14.4183 18 18 14.4183 18 10.0001C18 5.58172 14.4183 2 10.0001 2C5.58172 2 2 5.58172 2 10.0001C2 14.4183 5.58172 18 10.0001 18Z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>        
        `
    },
    {
        "date": `
            <svg id="date" data-type="F" xmlns="http://www.w3.org/2000/svg" width="20" height="20" >
                <path d="M16.808 3.255h-2.212V2.47a.452.452 0 0 0-.15-.333.534.534 0 0 0-.36-.138.533.533 0 0 0-.362.138.453.453 0 0 0-.15.333v.784H6.427V2.47a.453.453 0 0 0-.15-.333A.534.534 0 0 0 5.915 2a.534.534 0 0 0-.361.138.453.453 0 0 0-.15.333v.784H3.191c-.316 0-.619.116-.842.322A1.056 1.056 0 0 0 2 4.353v12.549c0 .291.126.57.349.776.223.206.526.322.842.322h13.617c.317 0 .62-.116.843-.322.224-.206.349-.485.349-.776V4.352c0-.29-.125-.57-.349-.775a1.245 1.245 0 0 0-.843-.322Zm-13.617.941h2.213v.784c0 .125.054.245.15.333a.534.534 0 0 0 .36.138c.136 0 .266-.05.362-.138a.453.453 0 0 0 .15-.333v-.784h7.149v.784c0 .125.053.245.15.333a.533.533 0 0 0 .36.138c.136 0 .265-.05.361-.138a.452.452 0 0 0 .15-.333v-.784h2.212c.046 0 .089.017.12.046.033.03.05.07.05.11V7.02H3.022V4.353a.15.15 0 0 1 .05-.111.178.178 0 0 1 .12-.046ZM16.808 17.06H3.191a.178.178 0 0 1-.12-.046.15.15 0 0 1-.05-.111V7.961H16.98v8.941a.151.151 0 0 1-.05.11.178.178 0 0 1-.12.047ZM8.468 10v5.02a.453.453 0 0 1-.15.332.534.534 0 0 1-.36.138.534.534 0 0 1-.362-.138.453.453 0 0 1-.15-.332v-4.258l-.622.287a.544.544 0 0 1-.563-.066.477.477 0 0 1-.122-.145.442.442 0 0 1 .071-.52.507.507 0 0 1 .158-.112l1.361-.627a.547.547 0 0 1 .497.02.49.49 0 0 1 .178.172c.042.07.064.149.064.229Zm5.07 2.294-1.836 2.255h1.702c.136 0 .265.05.361.138.096.088.15.208.15.333a.453.453 0 0 1-.15.332.534.534 0 0 1-.36.138H10.68a.543.543 0 0 1-.269-.07.487.487 0 0 1-.188-.19.44.44 0 0 1 .048-.493l2.451-3.011a.76.76 0 0 0 .15-.288.723.723 0 0 0-.114-.616.819.819 0 0 0-.244-.226.92.92 0 0 0-.98.027.81.81 0 0 0-.229.24.476.476 0 0 1-.127.153.554.554 0 0 1-.59.05.5.5 0 0 1-.155-.128.436.436 0 0 1-.009-.545c.129-.204.3-.38.506-.52.205-.14.439-.24.687-.293.248-.053.506-.06.757-.018.25.042.49.13.702.26.213.13.395.298.534.495.14.197.234.418.277.65.044.23.036.468-.024.697-.06.228-.17.443-.322.63h-.004Z"/>
            </svg>
        `
    },
    {
        "note": `
            <svg id="note" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <path d="M13 3.192h1.8c.318 0 .623.126.848.35.226.223.352.526.352.843v11.923c0 .316-.126.62-.351.843-.225.223-.53.349-.849.349H5.2c-.318 0-.624-.126-.849-.35A1.188 1.188 0 0 1 4 16.309V4.385c0-.317.126-.62.351-.843.225-.224.53-.35.849-.35H7m6 0C13 2.534 12.463 2 11.8 2H8.2C7.537 2 7 2.534 7 3.192m6 0v.596c0 .659-.537 1.193-1.2 1.193H8.2c-.663 0-1.2-.534-1.2-1.193v-.596m0 4.77h6m-6 2.98h6m-6 2.981h6"/>
            </svg>
        `
    },
    {
        "profile": `
            <svg id="profile" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.745 16.03a6.153 6.153 0 0 1 10.51 0M10 11.23a3.077 3.077 0 1 0 0-6.153 3.077 3.077 0 0 0 0 6.154ZM10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
            </svg>
        `
    },
    {
        "question": `
            <svg id="question" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3" d="M8 7.923A2.077 2.077 0 1 1 10.077 10v1.385"/>
                <path d="M10.5 14a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
            </svg>
        `
    },
    {
        "team": `
            <svg id="team" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM13 18H1v-1.333a6 6 0 0 1 12 0V18ZM12.334 2a3 3 0 1 1 0 6M14.466 10.92a6 6 0 0 1 3.867 5.6V18h-2"/>
            </svg>
        `
    },
    {
        "date-hint": `
            <svg id="date-hint" data-type="FN" xmlns="http://www.w3.org/2000/svg" width="20" height="20" >
                <path d="M16.808 3.255h-2.212V2.47a.452.452 0 0 0-.15-.333.534.534 0 0 0-.36-.138.533.533 0 0 0-.362.138.453.453 0 0 0-.15.333v.784H6.427V2.47a.453.453 0 0 0-.15-.333A.534.534 0 0 0 5.915 2a.534.534 0 0 0-.361.138.453.453 0 0 0-.15.333v.784H3.191c-.316 0-.619.116-.842.322A1.056 1.056 0 0 0 2 4.353v12.549c0 .291.126.57.349.776.223.206.526.322.842.322h13.617c.317 0 .62-.116.843-.322.224-.206.349-.485.349-.776V4.352c0-.29-.125-.57-.349-.775a1.245 1.245 0 0 0-.843-.322Zm-13.617.941h2.213v.784c0 .125.054.245.15.333a.534.534 0 0 0 .36.138c.136 0 .266-.05.362-.138a.453.453 0 0 0 .15-.333v-.784h7.149v.784c0 .125.053.245.15.333a.533.533 0 0 0 .36.138c.136 0 .265-.05.361-.138a.452.452 0 0 0 .15-.333v-.784h2.212c.046 0 .089.017.12.046.033.03.05.07.05.11V7.02H3.022V4.353a.15.15 0 0 1 .05-.111.178.178 0 0 1 .12-.046ZM16.808 17.06H3.191a.178.178 0 0 1-.12-.046.15.15 0 0 1-.05-.111V7.961H16.98v8.941a.151.151 0 0 1-.05.11.178.178 0 0 1-.12.047ZM8.468 10v5.02a.453.453 0 0 1-.15.332.534.534 0 0 1-.36.138.534.534 0 0 1-.362-.138.453.453 0 0 1-.15-.332v-4.258l-.622.287a.544.544 0 0 1-.563-.066.477.477 0 0 1-.122-.145.442.442 0 0 1 .071-.52.507.507 0 0 1 .158-.112l1.361-.627a.547.547 0 0 1 .497.02.49.49 0 0 1 .178.172c.042.07.064.149.064.229Zm5.07 2.294-1.836 2.255h1.702c.136 0 .265.05.361.138.096.088.15.208.15.333a.453.453 0 0 1-.15.332.534.534 0 0 1-.36.138H10.68a.543.543 0 0 1-.269-.07.487.487 0 0 1-.188-.19.44.44 0 0 1 .048-.493l2.451-3.011a.76.76 0 0 0 .15-.288.723.723 0 0 0-.114-.616.819.819 0 0 0-.244-.226.92.92 0 0 0-.98.027.81.81 0 0 0-.229.24.476.476 0 0 1-.127.153.554.554 0 0 1-.59.05.5.5 0 0 1-.155-.128.436.436 0 0 1-.009-.545c.129-.204.3-.38.506-.52.205-.14.439-.24.687-.293.248-.053.506-.06.757-.018.25.042.49.13.702.26.213.13.395.298.534.495.14.197.234.418.277.65.044.23.036.468-.024.697-.06.228-.17.443-.322.63h-.004Z"/>
            </svg>
        `
    },
    {
        "question-hint": `
            <svg id="question-hint" data-type="N" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3" d="M8 7.923A2.077 2.077 0 1 1 10.077 10v1.385"/>
                <path d="M10.5 14a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
            </svg>
        `
    },
    {
        "clock-hint": `
            <svg id="clock-hint" data-type="N" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.99995 6.92314V10.0001L13.1261 13.6432M10.0001 18C14.4183 18 18 14.4183 18 10.0001C18 5.58172 14.4183 2 10.0001 2C5.58172 2 2 5.58172 2 10.0001C2 14.4183 5.58172 18 10.0001 18Z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>        
        `
    },
    {
        "profile-hint": `
            <svg id="profile-hint" data-type="N" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 11.23a3.077 3.077 0 1 0 0-6.153 3.077 3.077 0 0 0 0 6.154ZM4.745 16.03a6.153 6.153 0 0 1 10.51 0" fill="#F5F5F5"/><path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" fill="#F5F5F5"/><path d="M4.745 16.03a6.153 6.153 0 0 1 10.51 0M10 11.23a3.077 3.077 0 1 0 0-6.153 3.077 3.077 0 0 0 0 6.154ZM10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="#707073" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>
        `
    },
]






