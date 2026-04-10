function containsDuplicate(nums: number[]): boolean {
    type Tally = {
        [num: number]: string;
    }

    const tally: Tally = {};
    for (let num of nums) {
        if(tally[num]) return true;
        tally[num] = "Checked";
    }

    return false;
};