export const DEFAULT_INVITE_MESSAGE = (roomId: string) => {
    return `Join in my Discushy meeting!
Room Id: ${roomId}

${window.location.origin}
    `
}

export const isEmpty = (value: any, omitArray: boolean = false) => {
    if (value === null || value === undefined || value === 'null' || value === 'undefined') {
        return true;
    }
    if (typeof value === 'string') {
        return value.trim().length === 0;
    }
    if (Array.isArray(value)) {
        if (omitArray) {
            return false;
        }
        return value.length === 0;
    }
    if (typeof value === 'object') {
        return Object.keys(value).length === 0;
    }

    return false;
};

export const random6DigitCode = (): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let result = '';

    // Add at least 2 letters
    for (let i = 0; i < 2; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    // Add at least 2 numbers
    for (let i = 0; i < 2; i++) {
        result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    // Add 2 more random characters (letters or numbers)
    const allChars = letters + numbers;
    for (let i = 0; i < 2; i++) {
        result += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the result
    result = result.split('').sort(() => Math.random() - 0.5).join('');

    return result;
}