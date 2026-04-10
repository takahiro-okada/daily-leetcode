function hammingWeight(n: number): number {
    let counter: number = 0;

    while (n !==　0 ) {
        if((n & 1) === 1) {
            counter++;
        }

        n = n >>>1;
    }
    return counter;
};