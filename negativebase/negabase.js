function pfrac(x) {
    return ((x>=0)?x-Math.floor(x):x-Math.ceil(x));
}
function pintg(x) {
    return ((x>=0)?Math.floor(x):Math.ceil(x));
}
function divmod(n,d) {
    return [pintg(n/d),n%d];
}
function negabase(n,base,alphabet) {
    let digits = [];
    if (n == 0 || n == false) { digits = [alphabet[0]] }
    else {
        while (n != 0) {
            let div = divmod(n, base);
            [n,remainder] = div;
            if (remainder < 0) {
                n += 1;
                remainder += Math.abs(base);
            }
            digits.push(alphabet[remainder]);
        }
   }
   return digits.reduceRight((a,x)=>a.concat(x),[]).join('');
}

function negabasetodec(digits,alphabet,base,offset){
    if (offset === undefined) {offset = 0}
    let r = 0;
    if (typeof digits == 'string') { digits = digits.split('') }
    digits.forEach((n)=>{r = r*base + (alphabet.indexOf(n) - offset)});
    return r;
}
