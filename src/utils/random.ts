export function random_hex()
{
    return Math.floor(Math.random() * 0xF_FF_FF).toString(16);
}

export function random_hex_large()
{
    return [0,0,0,0,0,0,0].map(_ => random_hex()).join("");
}