export const parseURL = (requestURL: string) => {
    return new URL(`http://${process.env.HOST ?? 'localhost'}${requestURL}`);

}
