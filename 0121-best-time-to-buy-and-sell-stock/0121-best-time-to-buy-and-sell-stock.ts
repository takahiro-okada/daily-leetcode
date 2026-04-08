function maxProfit(prices: number[]): number {
    let left:number = 0;
    let right:number = 1;
    let maxProfit = 0;

    while (right < prices.length) {
        if (prices[left] < prices[right]) {
            const profit = prices[right] - prices[left]
            maxProfit = Math.max(profit, maxProfit)
        } else {
            left = right;
        }
        right ++;
    }

    return maxProfit;
};