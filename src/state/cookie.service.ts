class CookieService {
    setCookie(c_name: string, c_value: string = '', exTime: string = '1 hour') {
        const d = new Date();
        d.setTime(d.getTime() + this.timeToMillisecond(exTime));
        const expires = 'expires=' + d.toUTCString();
        document.cookie = c_name + '=' + c_value + ';' + expires + ';path=/';
    }

    getCookie(cname: string) {
        const name = cname + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
    }

    checkCookie = (cname: string) => {
        const cookieInfo = this.getCookie(cname);
        return !!cookieInfo;
    };

    deleteCookie = (name: string) => {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; Secure; path=/';
    };

    timeToMillisecond = (time: string) => {
        const number = +time.substring(0, time.indexOf(' '));
        switch (time.substr(time.indexOf(' ') + 1)) {
            case 'day':
                return number * 24 * 60 * 60 * 1000;
            case 'hour':
                return number * 60 * 60 * 1000;
            case 'minute':
                return number * 60 * 1000;
            case 'second':
                return number * 1000;
            default:
                return number * 60 * 1000;
        }
    };
}

export default new CookieService();
