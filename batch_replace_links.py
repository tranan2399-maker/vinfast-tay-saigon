import glob
import os
import re

dir_path = r'e:\MY WORK\Web Scraping\FIle cào\vinfasttaysaigon.vn'
html_files = glob.glob(os.path.join(dir_path, '*.html'))

url_mappings = [
    ('https://vinfastauto.com/vn_vi/ve-vingroup', '/gioi-thieu.html'),
    ('https://vinfastauto.com/vn_vi/ve-chung-toi', '/gioi-thieu.html'),
    ('https://vinfastauto.com/vn_vi/dieu-khoan-phap-ly?collapseId=collapse-3', '/dieu-khoan-phap-ly.html'),
    ('https://vinfastauto.com/vn_vi/dieu-khoan-phap-ly', '/dieu-khoan-phap-ly.html'),
    ('https://vinfastauto.com/vn_vi/hop-dong-va-chinh-sach', '/hop-dong-va-chinh-sach.html'),
    ('https://vinfastauto.com/privacy-policy', '/chinh-sach-bao-mat.html'),
    ('https://vinfastauto.com/tinh-chi-phi-su-dung-xmd', '/du-toan-chi-phi.html'),
    ('https://vinfastauto.com/dich-vu-pin-xe-may-dien', '/pin-va-tram-sac.html'),
    ('https://vinfastauto.com/vn_vi/vf-energy', '/pin-va-tram-sac.html'),
    ('https://vinfastauto.com/vn_vi/vinfast-estore.html', '/xe-may-dien.html'),
    ('https://vinfastauto.com/vn_vi/tin-tuc/cong-ty', '/tin-tuc.html'),
    ('https://vinfastauto.com/xe-dap-dien-drgnfly', '/xe-may-dien.html'),
    ('https://vinfastauto.com/vn_en', 'javascript:void(0);'),
    ('https://vinfastauto.com/vn_vi/cong-dong', 'https://zalo.me/1295417830975662535'),
    ('https://vinfast.vn/', 'https://zalo.me/1295417830975662535'),
    ('mailto:v.speakup@vinfast.vn', 'mailto:hotro@vinfasttaysaigon.vn'),
    ('v.speakup@vinfast.vn', 'hotro@vinfasttaysaigon.vn'),
    ('mailto:support.vn@vinfastauto.com', 'mailto:hotro@vinfasttaysaigon.vn'),
    ('support.vn@vinfastauto.com', 'hotro@vinfasttaysaigon.vn'),
    ('tel:842444582193', 'tel:0387775158'),
    ('+84 24 4458 2193', '0387 775 158'),
    ('SPEAK-UP HOTLINE', 'HỖ TRỢ KHÁCH HÀNG 24/7')
]

updated_count = 0
total_replacements = 0

for fpath in html_files:
    fname = os.path.basename(fpath)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    file_replaces = 0
    new_content = content
    for old_val, new_val in url_mappings:
        if old_val in new_content:
            count = new_content.count(old_val)
            file_replaces += count
            new_content = new_content.replace(old_val, new_val)
            
    if file_replaces > 0:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        updated_count += 1
        total_replacements += file_replaces
        print(f"Updated {fname}: {file_replaces} replacements made.")

print(f"\nDone! Updated {updated_count} files with {total_replacements} replacements.")
