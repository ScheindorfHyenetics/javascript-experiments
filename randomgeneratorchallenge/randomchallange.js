function giveOffset() {
    let a = new Uint8Array(3); 
    crypto.getRandomValues(a)
    let encode = 0;
    encode = a[0] ;encode <<= 8  ;
    encode += a[1];encode <<= 8  ;
    encode += a[2];
    return {offset:encode,bytes:a};
}

function discoverRandomSequence(seed,offset,seqlen) {
    var rng = new Math.seedrandom(seed);
    for (let i = 0; i < offset;i++) {
        rng.int32();
    }
    let seq = [];
    for (i = 0; i < seqlen;i++) {
        seq.push(rng.int32());
    }
    return {sequence:seq, offset:offset, seed:seed};
}

function seekForOffset(seed,sequence,nxtseqlen) {
    var rng = new Math.seedrandom(seed);
    let a = [], b = [], n = 0, pass = false;
    for (let i = 0; i < sequence.length-1;i++) {
        a.push(rng.int32());
    }
    while (n <= 16777215) {
        a.push(rng.int32());
        pass = 0;
        for (let j = 0; j < sequence.length; j++) {
            if (a[j] == sequence[j]) { pass++ }
        }
        if (pass == sequence.length) {
            for (i = 0; i < nxtseqlen;i++) {
                b.push(rng.int32());
            }
            return {found:true,seed:seed,target:sequence,offset:n,readnumbers:[a,b]};
        }
        a.shift();
        n++;
    }
    return {found:false,seed:seed,target:sequence,offset:n,readnumbers:null};
}

function getASCIISeedFromCrypto() {
    let a = new Uint8Array(100), b = []; 
    while (b.length < 100) {
        crypto.getRandomValues(a);
        a = a.filter((x)=>((x>=63 && x<91) || (x>96 && x<123)));
        a.forEach((x)=>{b.push(x)});
        a = new Uint8Array(100);
    }
    b = b.slice(0,100);
    let s = '';
    for (let i of b) { 
            s += String.fromCharCode(i);
    }
    return {seed:s,bytes:b};
}

function packbytes(bts) {
    let num = 0, byte = 0;
    while (bts.length > 0) {
        byte = bts.shift();
        num = num << 8;
        num = num + byte;
    }
    return num;
}

function decodebytes(intg) {
    let bts = [],byte = 0;
    while (intg > 0) {
        byte = intg & 255;
        bts.push(byte);
        intg = intg >> 8;
    }
    return bts.reverse();
}

function splitByteToBits(byte) {
    let bitmap = [false,false,false,false,false,false,false,false];
    for (let n = 0; n < 8; n++) {
        bitmap[7-n] = ( byte & (1 << n) ) ? true : false;
    }
    return bitmap;
}

function encodeSequenceString(sequence) {
    let sign = 0, string = '', bytes=[];
    for (let n of sequence) {
        sign = sign << 1;
        if (n >= 0) { sign += 1 }
        bytes = decodebytes(Math.abs(n));
        while (bytes.length < 4) {bytes.unshift(0)}
        string += bytes.reduce((r,e)=>r+String.fromCharCode(e),'');
    }
    let fullstring = String.fromCharCode(sign)+string,
        base64str = btoa(fullstring);
    return {signByte:sign,
            payloadBinStr:string,
            fullBinString:fullstring,
            b64String:base64str};
}

function decodeSequenceString(base64str) {
    let binstr = atob(base64str),
        sign = binstr.slice(0,1).charCodeAt(0),
        pack = binstr.slice(1), si = false,
        signbits = splitByteToBits(sign),
        code = 0, bucket = [], unpack = [], w = 0;
    for (let z = pack.length-1; z >= 0; z--) {
        code = pack.charCodeAt(z);
        bucket.push(code);
        //console.log(bucket,unpack);
        if (bucket.length == 4) {
            w = packbytes(bucket.reverse());
            si = signbits.pop();
            w = (si) ? w : -w;
            unpack.unshift(w);
            bucket = [];
        }
    }
    return {fullBinString:binstr,signByte:sign,payloadBinStr:pack,sequence:unpack};
}
