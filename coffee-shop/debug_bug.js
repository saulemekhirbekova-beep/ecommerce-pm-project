function getCoffeePrice(coffeeName) {
    const prices = {
        latte: 800,
        espresso: 500,
        americano: 600
    };
    const price = prices[coffeeName];
    if (price === undefined) {
        console.log("Бұл кофе тізімде жоқ:", coffeeName);
        return null;
    }
    return price;
}
console.log(getCoffeePrice("americano"));