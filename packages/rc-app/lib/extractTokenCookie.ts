export const extractTokenCookie = (
    cookieHeader: string
): string | undefined => {
    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
    let token: string | undefined;

    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");

        if (key.trim() === "ec-token") {
            try {
                token = decodeURIComponent(value);
            } catch (e) {
                token = undefined;
            }
            break;
        }
    }

    return token;
};
