function repeat(task,n=1) {
    while (n > 0) {
        task();
        n = n-1;
    }
}

function Matrix(x=1,y=1) {
    if (this instanceof Matrix) {
        this.x = x;
        this.y = y;
        this.matrix = [];
        repeat(()=>this.matrix.push([]),this.y);
        this.matrix.forEach((row)=>{
            repeat(()=>row.push(0),this.x);
        });
        return this;
    } else {
        throw new Error('Please Instanciate Object')
    }
}

function cvMatrix(dim=3,div=1,normalize=false,overflow=0) {
    const OVERFLOW_REPEAT=-2;
    const OVERFLOW_WARP=-1;
    const OVERFLOW_ZEROS=0;
    const OVERFLOW_VALUE=1;
    if (this instanceof cvMatrix) {
        this.overflow = overflow;
        function ovfl(x,y,dx,dy,ix,iy,input) {
            //console.log('this overflow '+this.overflow);
            switch (this.overflow) {
                case OVERFLOW_REPEAT:
                    let n,m;
                    if (dx === 0) { n = x }
                        else if (dx < 0) { n = 0 }
                            else { n = ix-1 }
                    if (dy === 0) { m = y }
                    else if (dy < 0) { m = 0 }
                        else { m = iy-1 }
                    return input[m][n];
                break;
                case OVERFLOW_WARP:
                    if (dx >= 0) {
                        x = (x+dx)%ix;
                    } else {
                        x = ((ix)+((x+dx)%ix))%ix;
                    }
                    if (dy >= 0) {
                        y = (y+dy)%iy;
                    } else {
                        y = ((iy)+((y+dy)%iy))%iy;
                    }
                    return input[y][x];
                break;
                case OVERFLOW_ZEROS:
                case OVERFLOW_VALUE:
                default:
                    return this.overflow;
                break;
            }
        }
        this.ovfl = ovfl;
        if (dim <= 0 || dim === null || dim === undefined || dim % 2 === 0) {
            throw new Error('Please correct dimensions');
        }
        this.dim = dim|0;
        this.div = div|0;
        this.normalize = !!normalize;
        this.matrix = [];
        repeat(()=>this.matrix.push([]),this.dim);
        this.matrix.forEach((row)=>{
            repeat(()=>row.push(0),this.dim);
        });
        this.convolve = function (mtx) {
            let resmtx = new Matrix(mtx.x,mtx.y);
            let norm = 0;
            if (this.normalize) {
                for (let n = 0; n < mtx.y; n++) {
                    for (let m = 0; m < mtx.x; m++) {
                        norm += mtx.matrix[n][m];
                    }
                }
                norm = norm / (mtx.x*mtx.y);
            }
            const mid = Math.floor(this.dim/2);
            for (let n = 0; n < mtx.y; n++) {
                for (let m = 0; m < mtx.x; m++) {
                    for (let i = -mid; i < mid; i++) {
                        for (let j = -mid; j < mid; j++) {
                            let value = 0;
                            if (n+i < 0 || n+i >= mtx.y || m+j < 0 || m+j >= mtx.x) {
                                value = this.ovfl(m,n,j,i,mtx.x,mtx.y,mtx.matrix);
                            } else {
                                value = mtx.matrix[n+i][m+j];
                            }
                            resmtx.matrix[n][m] += this.matrix[i+mid][j+mid]*value;
                        }
                    }
                    if (this.normalize) {
                        resmtx.matrix[n][m] /= norm;
                    }
                    resmtx.matrix[n][m] /= this.div;
                }
            }
            return resmtx;
        }
        return this;
    } else {
        throw new Error('Please Instanciate Object')
    }
}
