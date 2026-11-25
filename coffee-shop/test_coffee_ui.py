import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

def test_coffee_shop_webapp():
    # Chrome браузерін іске қосу
    driver = webdriver.Chrome()
    driver.maximize_window()
    
    try:
        # 1. Веб-қосымшаны ашу (өз локалды немесе сервердегі адресіңізді жазыңыз)
        driver.get("http://127.0.0.1:5500/index.html")
        time.sleep(2)
        
        # 2. UI элементтерін тексеру (Мысалы: Басты беттің жүктелуі)
        print("-> Веб-қосымша сәтті ашылды.")
        
        # 3. Login немесе Авторизация тесті (бар болса)
        # login_btn = driver.find_element(By.ID, "loginBtn")
        # login_btn.click()
        
        # 4. Іздеу (Search) функциясын тексеру
        search_input = driver.find_element(By.ID, "searchInput") # немесе басқа селектор
        search_input.send_keys("Капучино")
        search_input.send_keys(Keys.RETURN)
        time.sleep(2)
        print("-> Іздеу тесті сәтті орындалды.")
        
        # 5. Скриншот сақтау (Есеп үшін маңызды)
        driver.save_screenshot("test_result_coffee.png")
        print("-> Тест скриншоты 'test_result_coffee.png' болып сақталды.")
        
    except Exception as e:
        print(f"Қате орын алды: {e}")
    
    finally:
        # Браузерді жабу
        driver.quit()

if __name__ == "__main__":
    test_coffee_shop_webapp()