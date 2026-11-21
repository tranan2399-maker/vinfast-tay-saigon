import json
from playwright.sync_api import sync_playwright

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome', headless=True)
        results = {}
        
        # 1. Service page
        page1 = browser.new_page(viewport={'width': 1280, 'height': 800})
        page1.goto('http://127.0.0.1:3000/dich-vu-bao-duong-xe-may-dien.html')
        page1.wait_for_timeout(1000)
        page1.fill('#lead-form input[name="name"]', 'Nguyễn Văn Test')
        page1.fill('#lead-form input[name="phone"]', '0912345678')
        page1.select_option('#lead-form select[name="vehicle_model"]', 'Feliz S')
        page1.click('#lead-form button[type="submit"]')
        page1.wait_for_timeout(1500)
        results['service_form'] = page1.is_visible('.vf-toast.is-visible')
        page1.close()
        
        # 2. Homepage
        page2 = browser.new_page(viewport={'width': 1280, 'height': 800})
        page2.goto('http://127.0.0.1:3000/index.html')
        page2.wait_for_timeout(1000)
        page2.fill('.form-subscribe input[name="phone"]', '0987654321')
        page2.click('.form-subscribe #registration-btn')
        page2.wait_for_timeout(1500)
        results['homepage_form'] = page2.is_visible('.vf-toast.is-visible')
        page2.close()
        
        # 3. Product detail page (vinfast-klara-s.html)
        page3 = browser.new_page(viewport={'width': 1280, 'height': 800})
        page3.goto('http://127.0.0.1:3000/vinfast-klara-s.html')
        page3.wait_for_timeout(1000)
        
        btn = page3.query_selector('#footer-confirm-submit')
        btn.scroll_into_view_if_needed()
        page3.wait_for_timeout(300)
        page3.fill('#footer_field_name', 'Trần Thị Thử Nghiệm')
        page3.fill('#footer_field_phone_number', '0388889999')
        page3.click('#footer-confirm-submit')
        page3.wait_for_timeout(1500)
        results['pdp_form'] = page3.is_visible('.vf-toast.is-visible')
        page3.screenshot(path='C:/Users/PC/.gemini/antigravity/brain/e2b20be9-7a7e-42a2-98a1-d2ae12f57f0f/toast_pdp_success.png')
        page3.close()
        
        browser.close()
        print('FINAL 100% VERIFIED RESULTS:', json.dumps(results, indent=2))

if __name__ == '__main__':
    run_tests()
