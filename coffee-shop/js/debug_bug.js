
const order = {
    items: [
        { name: "Капучино", price: 1200, quantity: 2 },
        { name: "Круассан", price: 800, quantity: 1 }
    ]
};

function calculateTotal(order) {
    let total = 0;

    for (const item of order.items) {
        total += item.price * item.quantity;
    }

    return total;
}

console.log("Тапсырыс сомасы:", calculateTotal(order));
