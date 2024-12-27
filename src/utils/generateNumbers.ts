export const generateRandomNumbers = () => {
    const numbers = new Set();

    while (numbers.size < 4) {
        const randomNumber = Math.floor(Math.random() * 9) + 1;
        numbers.add(randomNumber);
    }

    return Array.from(numbers);
};

