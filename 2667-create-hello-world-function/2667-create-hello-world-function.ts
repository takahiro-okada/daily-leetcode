function createHelloWorld() {
    
    return function(...args): string {
        const Text = "Hello World"
        return Text;
    };
};

/**
 * const f = createHelloWorld();
 * f(); // "Hello World"
 */