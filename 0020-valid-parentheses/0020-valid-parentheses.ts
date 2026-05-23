function isValid(s: string): boolean {
    const stack: string[] = [];

    const map: Record<string, string> = {
        ")": "(",
        "]": "[",
        "}": "{",

    };

    for (const char of s) {
        if (char === "(" || char === "[" || char === "{") {
            stack.push(char);
        } else {
            const top = stack.pop();

            if (top !== map[char]) {
                return false;
            }
        }
    }

    return stack.length === 0;
};