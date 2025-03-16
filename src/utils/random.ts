/**
 * Generates a random 1-5 digits hexadecimal string.
 */
export function randomHex()
{
    return Math.floor(Math.random() * 0xF_FF_FF).toString(16);
}

/**
 * Generates a large random hexadecimal string.
 */
export function randomHexLarge()
{
    return [0,0,0,0,0,0,0].map(_ => randomHex()).join("");
}