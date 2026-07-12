/**
 * @typedef {object} PathApi
 * @property {string} sep
 * @property {(value: string) => boolean} isAbsolute
 * @property {(value: string) => {root: string}} parse
 * @property {(...values: string[]) => string} resolve
 * @property {(from: string, to: string) => string} relative
 */
export type PathApi = {
    sep: string;
    isAbsolute: (value: string) => boolean;
    parse: (value: string) => {
        root: string;
    };
    resolve: (...values: string[]) => string;
    relative: (from: string, to: string) => string;
};
