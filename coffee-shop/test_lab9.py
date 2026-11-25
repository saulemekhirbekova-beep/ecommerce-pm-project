import requests

# Кофейня backend API серверінің адресі (егер сервер іске қосылып тұрса)
# Немесе тест ретінде mock endpoint (мысалы, https://jsonplaceholder.typicode.com) қолдануға болады
BASE_URL = "http://127.0.0.1:5000/api"

def test_get_menu():
    print("\n--- 1. GET /api/menu тексеру ---")
    try:
        response = requests.get(f"{BASE_URL}/menu")
        print(f"Status Code: {response.status_code}")
        assert response.status_code == 200, "Қате: Статус 200 болуы керек!"
        print("Тест сәтті өтті: Мәзір тізімі алынды.")
    except Exception as e:
        print(f"Серверге қосылу мүмкін болмады немесе қате: {e}")

def test_create_order():
    print("\n--- 2. POST /api/orders тексеру ---")
    payload = {
        "item": "Latte",
        "quantity": 2,
        "price": 1500
    }
    try:
        response = requests.post(f"{BASE_URL}/orders", json=payload)
        print(f"Status Code: {response.status_code}")
        assert response.status_code in [200, 201], "Қате: Тапсырыс жасалмады!"
        print("Тест сәтті өтті: Тапсырыс қабылданды.")
    except Exception as e:
        print(f"Қате орын алды: {e}")

if __name__ == "__main__":
    test_get_menu()
    test_create_order()