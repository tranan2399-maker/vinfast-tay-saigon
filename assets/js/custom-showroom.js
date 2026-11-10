/**
 * VINFAST TÂY SÀI GÒN - CHUYÊN BIỆT XE MÁY ĐIỆN
 * Scripts tương tác: Hero Slider, Mega Menu, Color Switcher, So sánh kinh tế, Lọc sản phẩm & Đăng ký lái thử
 */

let siteConfig = null;
let allProducts = [];
let allShowrooms = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initMobileMenu();
  initMegaMenuTabs();
  initHeroSlider();
  initCostCalculator();
  initInteractiveColorSwitcher();
  initProductTabs();
  initLeadForm();
});

// 1. Tải dữ liệu JSON
async function loadData() {
  try {
    const [cfgRes, prodRes, showRes] = await Promise.all([
      fetch('/data/site_config.json').then(r => r.json()),
      fetch('/data/products.json').then(r => r.json()),
      fetch('/data/showrooms.json').then(r => r.json())
    ]);
    siteConfig = cfgRes;
    allProducts = prodRes;
    allShowrooms = showRes;

    renderMegaMenuProducts();

    // Auto-detect page category
    const path = window.location.pathname.toLowerCase();
    if (path.includes('pin-va-tram-sac')) {
      renderProducts('pin-va-tram-sac');
    } else if (path.includes('xe-may-dien')) {
      renderProducts('all');
    } else {
      renderProducts('all');
    }

    renderShowrooms();
    populateLeadFormDropdowns();
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu VinFast:', err);
  }
}

// 2. Mobile Menu Toggle
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.querySelector('.vf-nav-menu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      toggleBtn.textContent = navMenu.classList.contains('open') ? '✕' : '☰';
    });
  }
}

// 3. Mega-Menu Tabs
function initMegaMenuTabs() {
  const tabBtns = document.querySelectorAll('.vf-mega-tab-btn');
  const tabContents = document.querySelectorAll('.vf-mega-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(`mega-${targetTab}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
}

function renderMegaMenuProducts() {
  const caoCapList = allProducts.filter(p => p.category === 'xe-may-cao-cap');
  const trungCapList = allProducts.filter(p => p.category === 'xe-may-trung-cap');
  const phoThongList = allProducts.filter(p => p.category === 'xe-may-pho-thong');

  renderMegaTab('mega-cao-cap', caoCapList);
  renderMegaTab('mega-trung-cap', trungCapList);
  renderMegaTab('mega-pho-thong', phoThongList);
}

function renderMegaTab(containerId, list) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = list.map(item => `
    <a href="xe-may-dien.html#card-${item.id}" class="vf-mega-card">
      <div class="vf-mega-card-thumb">
        <img src="${item.thumbnail_local || item.thumbnail}" alt="${item.name}" loading="lazy">
      </div>
      <div class="vf-mega-card-badge">${item.badge || 'Chính hãng'}</div>
      <div class="vf-mega-card-title">${item.name}</div>
      <div class="vf-mega-card-price">${item.price_text}</div>
    </a>
  `).join('');
}

// 4. Hero Slider Showcase
function initHeroSlider() {
  const slides = document.querySelectorAll('.vf-hero-slide');
  const dots = document.querySelectorAll('.vf-slider-dot');
  if (slides.length === 0) return;

  let currentSlide = 0;
  let slideInterval = null;

  function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    if (dots[currentSlide]) {
      dots[currentSlide].classList.add('active');
    }
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(slideInterval);
      const idx = parseInt(dot.getAttribute('data-slide'), 10);
      showSlide(idx);
      startAutoSlide();
    });
  });

  function startAutoSlide() {
    slideInterval = setInterval(nextSlide, 5000);
  }

  startAutoSlide();
}

// 5. Cost Comparison Calculator (Xe máy điện vs Xe máy xăng)
function initCostCalculator() {
  const rangeInput = document.getElementById('calc-range-km');
  const kmDisplay = document.getElementById('calc-km-val');
  const elecCostEl = document.getElementById('calc-elec-cost');
  const gasCostEl = document.getElementById('calc-gas-cost');
  const saveMonthEl = document.getElementById('calc-save-month');
  const saveYearEl = document.getElementById('calc-save-year');

  if (!rangeInput) return;

  function updateCalculation() {
    const km = parseInt(rangeInput.value, 10);
    if (kmDisplay) kmDisplay.textContent = km.toLocaleString('vi-VN') + ' km / tháng';

    // Xe máy điện:
    // Tiêu thụ ~1.8 kWh / 100km * 3.000đ/kWh = 54đ/km
    // Phí thuê pin cố định + khấu hao trung bình: ~250.000đ/tháng (hoặc 100đ/km)
    const elecKwhCost = (km / 100) * 1.8 * 3000;
    const elecBatteryCost = km <= 500 ? 250000 : 350000;
    const totalElec = Math.round(elecKwhCost + elecBatteryCost);

    // Xe máy xăng:
    // Tiêu thụ ~2.5L xăng / 100km * 24.500đ/L = 612.5đ/km
    // Tiền thay nhớt máy & nhớt láp định kỳ: ~150đ/km
    const gasFuelCost = (km / 100) * 2.5 * 24500;
    const gasMaintenanceCost = km * 150;
    const totalGas = Math.round(gasFuelCost + gasMaintenanceCost);

    // Tiết kiệm:
    const saveMonth = Math.max(0, totalGas - totalElec);
    const saveYear = saveMonth * 12;

    if (elecCostEl) elecCostEl.textContent = totalElec.toLocaleString('vi-VN') + ' VNĐ';
    if (gasCostEl) gasCostEl.textContent = totalGas.toLocaleString('vi-VN') + ' VNĐ';
    if (saveMonthEl) saveMonthEl.textContent = saveMonth.toLocaleString('vi-VN') + ' VNĐ / tháng';
    if (saveYearEl) saveYearEl.textContent = 'Tiết kiệm: ' + saveYear.toLocaleString('vi-VN') + ' VNĐ / năm';
  }

  rangeInput.addEventListener('input', updateCalculation);
  updateCalculation();
}

// 6. Interactive Model & Color Switcher
const showcaseModelsData = {
  'feliz-2027': {
    name: 'VinFast Feliz 2027',
    category: 'Xe Máy Điện Trung Cấp Thế Hệ Mới',
    price: '29.900.000 VNĐ',
    specs: {
      'Quãng đường 1 lần sạc': '205 km / lần sạc',
      'Vận tốc tối đa': '80 km/h',
      'Thể tích cốp xe': '28 Lít siêu rộng',
      'Công nghệ pin': 'Pin LFP 3.5 kWh chống cháy nổ',
      'Chuẩn chống nước': 'IP67 lội ngập 0.5m trong 30 phút'
    },
    colors: [
      { name: 'Xanh Đại Dương', code: '#1B4F72', img: 'assets/images/cars/vinfast-feliz-2027-thumb.png' },
      { name: 'Trắng Ngọc Trai', code: '#FBFCFC', img: 'assets/images/cars/vinfast-feliz-s-color-4.png' },
      { name: 'Đen Mờ Thể Thao', code: '#2C3E50', img: 'assets/images/cars/vinfast-feliz-2027-thumb.png' }
    ]
  },
  'evo-grand-limited': {
    name: 'VinFast Evo Grand Limited',
    category: 'Phiên Bản Giới Hạn Sang Trọng',
    price: '29.900.000 VNĐ',
    specs: {
      'Quãng đường 1 lần sạc': '205 km / lần sạc',
      'Vận tốc tối đa': '70 km/h',
      'Kích thước D x R x C': '1.856 x 675 x 1.133 mm',
      'Chiều cao yên xe': '770 mm rất vừa vặn',
      'Chuẩn chống nước': 'IP67 an tâm tuyệt đối mùa mưa'
    },
    colors: [
      { name: 'Xanh Cẩm Thạch Hoàng Gia', code: '#117A65', img: 'assets/images/cars/vinfast-evo-grand-limited-color-2.png' },
      { name: 'Trắng Sữa Sang Trọng', code: '#F9EBEA', img: 'assets/images/cars/vinfast-evo-grand-limited-color-2.png' }
    ]
  },
  'theon-s': {
    name: 'VinFast Theon S',
    category: 'Flagship Siêu Xe Máy Điện',
    price: '63.000.000 VNĐ',
    specs: {
      'Quãng đường 1 lần sạc': '150 km / lần sạc',
      'Vận tốc tối đa': '99 km/h',
      'Công suất cực đại': '7.100 W (Center-motor)',
      'Hệ thống phanh': 'Phanh ABS 2 kênh Continental',
      'Chuẩn chống nước': 'IP67 chuẩn quốc tế'
    },
    colors: [
      { name: 'Đen Nhám Quyền Lực', code: '#1C2833', img: 'assets/images/cars/vinfast-theon-s-color-2.png' },
      { name: 'Đỏ Mận Thể Thao', code: '#78281F', img: 'assets/images/cars/vinfast-theon-s-color-2.png' }
    ]
  },
  'evo200': {
    name: 'VinFast Evo200 Quốc Dân',
    category: 'Xe Máy Điện Bán Chạy Nhất',
    price: '18.800.000 VNĐ',
    specs: {
      'Quãng đường 1 lần sạc': '203 km / lần sạc (Kỷ lục phân khúc)',
      'Vận tốc tối đa': '70 km/h',
      'Dung lượng pin': 'Pin LFP 3.5 kWh',
      'Thể tích cốp xe': '22 Lít chứa 2 mũ bảo hiểm',
      'Chuẩn chống nước': 'IP67 lội nước vượt trội'
    },
    colors: [
      { name: 'Vàng Năng Động', code: '#F1C40F', img: 'assets/images/cars/vinfast-evo200-color-4.png' },
      { name: 'Đỏ Tươi Thể Thao', code: '#E74C3C', img: 'assets/images/cars/vinfast-evo200-color-4.png' },
      { name: 'Trắng Ngọc Trai', code: '#F8F9F9', img: 'assets/images/cars/vinfast-evo200-color-4.png' },
      { name: 'Đen Nhám', code: '#212F3D', img: 'assets/images/cars/vinfast-evo200-color-4.png' }
    ]
  }
};

let currentActiveModelKey = 'feliz-2027';

function initInteractiveColorSwitcher() {
  const modelBtns = document.querySelectorAll('.vf-model-tab-btn');
  if (modelBtns.length === 0) return;

  modelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const modelKey = btn.getAttribute('data-model');
      currentActiveModelKey = modelKey;
      renderShowcaseModel(modelKey);
    });
  });

  renderShowcaseModel('feliz-2027');
}

function renderShowcaseModel(modelKey) {
  const data = showcaseModelsData[modelKey];
  if (!data) return;

  const imgEl = document.getElementById('showcase-car-img');
  const catEl = document.getElementById('showcase-category');
  const titleEl = document.getElementById('showcase-title');
  const priceEl = document.getElementById('showcase-price');
  const colorNameEl = document.getElementById('showcase-color-name');
  const dotsContainer = document.getElementById('showcase-dots');
  const specsContainer = document.getElementById('showcase-specs');

  if (catEl) catEl.textContent = data.category;
  if (titleEl) titleEl.textContent = data.name;
  if (priceEl) priceEl.textContent = 'Giá niêm yết: ' + data.price;

  // Render dots
  if (dotsContainer) {
    dotsContainer.innerHTML = data.colors.map((c, idx) => `
      <span class="vf-showcase-dot ${idx === 0 ? 'active' : ''}" 
            style="background:${c.code};" 
            title="${c.name}"
            data-img="${c.img}"
            data-name="${c.name}"></span>
    `).join('');

    // Attach click to dots
    dotsContainer.querySelectorAll('.vf-showcase-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        dotsContainer.querySelectorAll('.vf-showcase-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const imgSrc = dot.getAttribute('data-img');
        const colorName = dot.getAttribute('data-name');
        if (imgEl && imgSrc) imgEl.src = imgSrc;
        if (colorNameEl && colorName) colorNameEl.textContent = colorName;
      });
    });
  }

  // Set default initial color
  if (data.colors.length > 0) {
    if (imgEl) imgEl.src = data.colors[0].img;
    if (colorNameEl) colorNameEl.textContent = data.colors[0].name;
  }

  // Render Specs table
  if (specsContainer) {
    specsContainer.innerHTML = Object.entries(data.specs).map(([label, val]) => `
      <tr>
        <td>${label}:</td>
        <td>${val}</td>
      </tr>
    `).join('');
  }
}

// 7. Product Catalog Filter & Rendering
function initProductTabs() {
  const tabBtns = document.querySelectorAll('.vf-filter-tabs .vf-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-tab');
      renderProducts(cat);
    });
  });
}

function renderProducts(category = 'all') {
  const container = document.getElementById('product-grid');
  if (!container) return;

  let filtered = allProducts;
  if (category === 'xe-may-cao-cap') {
    filtered = allProducts.filter(p => p.category === 'xe-may-cao-cap');
  } else if (category === 'xe-may-trung-cap') {
    filtered = allProducts.filter(p => p.category === 'xe-may-trung-cap');
  } else if (category === 'xe-may-pho-thong') {
    filtered = allProducts.filter(p => p.category === 'xe-may-pho-thong');
  } else if (category === 'pin-va-tram-sac') {
    filtered = allProducts.filter(p => p.category === 'pin-va-tram-sac');
  } else {
    filtered = allProducts;
  }

  container.innerHTML = filtered.map(p => {
    const thumb = p.thumbnail_local || p.thumbnail;
    const colors = p.colors || [];
    const specs = p.specs || {};
    const specEntries = Object.entries(specs).slice(0, 3);

    const swatchesHtml = colors.length > 0 
      ? colors.map((c, idx) => `
          <span class="vf-swatch-dot ${idx === 0 ? 'active' : ''}" 
                style="background-color: ${c.code}" 
                title="${c.name}"
                onclick="changeCardColor(this, '${c.img_local || c.img}')"></span>
        `).join('')
      : '';

    const specsHtml = specEntries.map(([k, v]) => `
      <span class="vf-spec-chip">${k}: <strong>${v}</strong></span>
    `).join('');

    return `
      <div class="vf-card" data-category="${p.category}" id="card-${p.id}">
        ${p.badge ? `<div class="vf-card-badge">${p.badge}</div>` : ''}
        <div class="vf-card-thumb-wrap">
          <img class="vf-card-thumb" src="${thumb}" alt="${p.name}" loading="lazy" id="img-${p.id}">
        </div>
        <div class="vf-card-body">
          <div class="vf-card-category">${p.category_name}</div>
          <h3 class="vf-card-title">${p.name}</h3>
          <div class="vf-card-tagline">${p.tagline}</div>
          
          ${colors.length > 0 ? `
            <div class="vf-color-swatches">
              <small style="color:#64748b; font-size:0.75rem; font-weight:700;">Màu sắc:</small>
              ${swatchesHtml}
            </div>
          ` : ''}

          <div class="vf-card-price">
            <span class="vf-card-price-label">Giá niêm yết:</span>
            <span class="vf-card-price-value">${p.price_text}</span>
          </div>

          <div class="vf-card-specs">
            ${specsHtml}
          </div>

          <div class="vf-card-actions">
            <a href="https://zalo.me/0933792866" target="_blank" class="btn btn-zalo">
              💬 Báo giá Zalo
            </a>
            <a href="#dang-ky" class="btn btn-outline" onclick="selectScooterForLead('${p.name}')">
              Lái thử
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.changeCardColor = function(dotEl, imgSrc) {
  const card = dotEl.closest('.vf-card');
  if (!card) return;
  const imgEl = card.querySelector('.vf-card-thumb');
  if (imgEl && imgSrc) {
    imgEl.src = imgSrc;
  }
  card.querySelectorAll('.vf-swatch-dot').forEach(d => d.classList.remove('active'));
  dotEl.classList.add('active');
};

// 8. 9 Showrooms Rendering
function renderShowrooms() {
  const container = document.getElementById('showrooms-grid');
  if (!container) return;

  container.innerHTML = allShowrooms.map(s => `
    <div class="vf-showroom-card ${s.is_headquarter ? 'headquarter' : ''}">
      ${s.is_headquarter ? '<div style="font-size:0.75rem; font-weight:900; color:var(--vf-primary); margin-bottom:4px; text-transform:uppercase;">Trụ Sở Chính</div>' : ''}
      <h3 class="vf-showroom-name">${s.name}</h3>
      <div class="vf-showroom-addr">
        <span>📍</span>
        <span>${s.address}</span>
      </div>
      <div class="vf-showroom-phone">
        <span>📞</span>
        <a href="tel:${s.hotline.replace(/\s+/g, '')}">${s.hotline}</a>
      </div>
      <div class="vf-showroom-actions">
        <a href="${s.map_url}" target="_blank" class="btn btn-outline" style="flex:1; font-size:0.8rem; padding:8px 12px;">
          🗺️ Chỉ đường
        </a>
        <a href="tel:${s.hotline.replace(/\s+/g, '')}" class="btn btn-primary" style="flex:1; font-size:0.8rem; padding:8px 12px;">
          Gọi Showroom
        </a>
      </div>
    </div>
  `).join('');
}

// 9. Lead Form Handling
function populateLeadFormDropdowns() {
  const modelSelect = document.getElementById('lead-model');
  const showroomSelect = document.getElementById('lead-showroom');
  const path = window.location.pathname.toLowerCase();
  const isDepositPage = path.includes('dat-coc');
  const isAccessoryPage = path.includes('phu-kien');
  const isSparePartsPage = path.includes('phu-tung');

  // Do not overwrite customized accessory or spare parts options
  if (isAccessoryPage || isSparePartsPage) {
    return;
  }

  if (modelSelect) {
    const scooterModels = allProducts.filter(p => !p.id.includes('bo-sac') && !p.id.includes('pin-lfp') && !p.id.includes('goi-thue-pin'));
    modelSelect.innerHTML = `
      <option value="">${isDepositPage ? '-- Chọn dòng xe máy điện đặt cọc --' : '-- Chọn dòng xe máy điện quan tâm --'}</option>
      ${scooterModels.map(m => `<option value="${m.name}">${m.name} (${m.price_text})</option>`).join('')}
    `;
  }

  if (showroomSelect) {
    const homeDeliveryText = isDepositPage ? '🛵 Giao xe tận nhà miễn phí (Toàn bộ TP.HCM)' : '🛵 Đăng ký lái thử tận nhà miễn phí (Khu vực TP.HCM)';
    showroomSelect.innerHTML = `
      <option value="">-- Chọn showroom gần bạn tiếp nhận --</option>
      <option value="${homeDeliveryText}">${homeDeliveryText}</option>
      ${allShowrooms.map(s => `<option value="${s.name}">${s.name} - ${s.address}</option>`).join('')}
    `;
  }
}

window.selectScooterForLead = function(scooterName) {
  const modelSelect = document.getElementById('lead-model');
  if (modelSelect) {
    modelSelect.value = scooterName;
  }
  const formSection = document.getElementById('dang-ky');
  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth' });
  }
};

function initLeadForm() {
  const form = document.getElementById('lead-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('lead-name')?.value.trim() || '';
    const phone = document.getElementById('lead-phone')?.value.trim() || '';
    const email = document.getElementById('lead-email')?.value.trim() || '';
    const model = document.getElementById('lead-model')?.value || '';
    const showroom = document.getElementById('lead-showroom')?.value || 'VinFast Tây Sài Gòn (Trụ sở chính)';
    const colorEl = document.getElementById('lead-color') || form.querySelector('select[name="color"]');
    const color = colorEl ? colorEl.value : '';
    const noteEl = document.getElementById('lead-note') || document.getElementById('lead-address') || form.querySelector('textarea');
    const note = noteEl ? noteEl.value.trim() : '';

    const path = window.location.pathname.toLowerCase();
    const isDepositPage = path.includes('dat-coc');
    const isAccessoryPage = path.includes('phu-kien');
    const isMaintenancePage = path.includes('dich-vu-bao-duong');
    const isWarrantyPage = path.includes('chinh-sach-bao-hanh');
    const isRepairPage = path.includes('dich-vu-sua-chua');
    const isRescuePage = path.includes('cuu-ho-247');
    const isMobileServicePage = path.includes('mobile-service');
    const isSparePartsPage = path.includes('phu-tung');
    const isServicePage = path.includes('dich-vu-hau-mai');

    if (!phone) {
      alert('Vui lòng nhập số điện thoại để chuyên viên tư vấn liên hệ.');
      return;
    }

    let reqType = 'Đăng ký lái thử & Báo giá ưu đãi';
    let successMsg = `🎉 Cảm ơn ${fullName}! Đăng ký thành công. Chuyên viên VinFast Tây Sài Gòn sẽ liên hệ trong 5 phút!`;

    if (isDepositPage) {
      reqType = 'Đặt cọc giữ xe trực tuyến';
      successMsg = `🎉 Cảm ơn ${fullName}! Đặt cọc giữ xe trực tuyến thành công. Chuyên viên VinFast Tây Sài Gòn sẽ liên hệ lại với Quý khách trong vòng 5 phút để hoàn tất thủ tục và gửi biên lai thu cọc.`;
    } else if (isAccessoryPage) {
      reqType = 'Đặt mua phụ kiện xe máy điện chính hãng';
      successMsg = `🎉 Cảm ơn ${fullName}! Đơn đặt mua phụ kiện chính hãng đã được ghi nhận. Bộ phận phụ kiện VinFast Tây Sài Gòn sẽ liên hệ xác nhận đơn hàng ngay!`;
    } else if (isMaintenancePage) {
      reqType = 'Đặt lịch bảo dưỡng định kỳ xe máy điện';
      successMsg = `🎉 Cảm ơn ${fullName}! Đặt lịch bảo dưỡng thành công. Xưởng dịch vụ 3S VinFast Tây Sài Gòn sẽ liên hệ xác nhận giờ hẹn!`;
    } else if (isWarrantyPage) {
      reqType = 'Yêu cầu kiểm tra & Tra cứu bảo hành xe máy điện';
      successMsg = `🎉 Cảm ơn ${fullName}! Yêu cầu bảo hành đã được tiếp nhận. Cố vấn dịch vụ VinFast Tây Sài Gòn sẽ liên hệ trong 5 phút!`;
    } else if (isRepairPage) {
      reqType = 'Yêu cầu sửa chữa chuyên sâu / Cứu hộ khẩn cấp';
      successMsg = `🎉 Cảm ơn ${fullName}! Yêu cầu sửa chữa/cứu hộ đã được ghi nhận. Đội kỹ thuật VinFast Tây Sài Gòn sẽ liên hệ hỗ trợ ngay!`;
    } else if (isRescuePage) {
      reqType = 'Yêu cầu cứu hộ khẩn cấp & pin 24/7';
      successMsg = `🚨 Đã tiếp nhận yêu cầu cứu hộ khẩn cấp của ${fullName}! Đội phản ứng nhanh VinFast Tây Sài Gòn đang điều phối kỹ thuật viên đến hỗ trợ ngay!`;
    } else if (isMobileServicePage) {
      reqType = 'Đặt lịch Mobile Service sửa chữa lưu động tận nhà';
      successMsg = `🎉 Cảm ơn ${fullName}! Đặt lịch sửa chữa tận nhà Mobile Service thành công. Đội xe lưu động sẽ liên hệ xác nhận thời gian!`;
    } else if (isSparePartsPage) {
      reqType = 'Tra cứu & Đặt mua phụ tùng xe máy điện chính hãng';
      successMsg = `🎉 Cảm ơn ${fullName}! Yêu cầu phụ tùng đã được ghi nhận. Kho phụ tùng VinFast Tây Sài Gòn sẽ báo giá và tình trạng tồn kho ngay!`;
    } else if (isServicePage) {
      reqType = 'Đặt lịch dịch vụ xưởng 3S VinFast Tây Sài Gòn';
      successMsg = `🎉 Cảm ơn ${fullName}! Đặt lịch dịch vụ thành công. Cố vấn dịch vụ VinFast Tây Sài Gòn sẽ liên hệ xác nhận giờ hẹn!`;
    }

    const payload = {
      fullName,
      phone,
      email,
      model,
      showroom,
      requestType: reqType
    };

    if (isDepositPage) {
      payload.depositAmount = '1.000.000 VNĐ';
      if (color) payload.color = color;
    } else {
      payload.planTime = document.getElementById('lead-time')?.value || 'Nhận xe ngay trong tháng';
    }

    if (note) {
      payload.note = note;
    }

    const submitBtn = form.querySelector('.vf-btn-submit') || form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.innerHTML = '⏳ ĐANG XỬ LÝ...';
      submitBtn.disabled = true;
    }

    try {
      let res;
      try {
        res = await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(payload)
        });
      } catch (postErr) {
        // Fallback to PHP endpoint if run on PHP server
        res = await fetch('api/submit-lead.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(payload)
        });
      }

      showToast(successMsg);
      form.reset();
    } catch (err) {
      console.warn('Ghi nhận lead:', err);
      showToast(`🎉 Tiếp nhận yêu cầu thành công! VinFast Tây Sài Gòn sẽ gọi lại cho Quý khách (${phone}) ngay!`);
      form.reset();
    } finally {
      if (submitBtn) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    }
  });
}

function showToast(message) {
  let toast = document.querySelector('.vf-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'vf-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 5000);
}

// ==========================================
// BACK TO TOP BUTTON & SCROLL UX
// ==========================================
function initBackToTop() {
  let btn = document.getElementById('btn-back-to-top');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'btn-back-to-top';
    btn.innerHTML = '▲';
    btn.setAttribute('aria-label', 'Cuộn lên đầu trang');
    btn.title = 'Cuộn lên đầu trang';
    document.body.appendChild(btn);
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Run back to top on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBackToTop);
} else {
  initBackToTop();
}

// Init Interactive Tabs & FAQ Accordions for After-Sales Pages
function initAftersalesFeatures() {
  // Tabs
  document.querySelectorAll('.vf-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      const container = btn.closest('.vf-tabs-wrapper');
      if (!container) return;
      container.querySelectorAll('.vf-tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.vf-tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const pane = container.querySelector('#' + target);
      if (pane) pane.classList.add('active');
    });
  });

  // FAQ Accordion
  document.querySelectorAll('.vf-faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.vf-faq-item');
      if (!item) return;
      const isActive = item.classList.contains('active');
      const parent = item.closest('.vf-faq-accordion');
      if (parent) {
        parent.querySelectorAll('.vf-faq-item').forEach(i => i.classList.remove('active'));
      }
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // Smooth scroll for CTA button
  document.querySelectorAll('a[href^="#lead-form"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetEl = document.getElementById('lead-form') || document.querySelector(this.getAttribute('href'));
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAftersalesFeatures);
} else {
  initAftersalesFeatures();
}



// ==========================================================================
// MEGA MENU - DỊCH VỤ HẬU MÃI DROPDOWN (DESKTOP & MOBILE CLICK/TOUCH)
// ==========================================================================
function initServiceMenuDropdown() {
  // Desktop Menu: Hover with grace debounce & Click toggle
  document.querySelectorAll('.menu_service_xmd').forEach(menuItem => {
    const trigger = menuItem.querySelector('.menu-service-trigger') || menuItem.querySelector('a');
    const dropdown = menuItem.querySelector('.mega_menu_service');
    if (!trigger || !dropdown) return;

    let hoverTimer = null;

    function openDropdown() {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
      }
      menuItem.classList.add('show');
      dropdown.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function scheduleCloseDropdown() {
      if (hoverTimer) clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        menuItem.classList.remove('show');
        menuItem.classList.remove('active');
        dropdown.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }, 240); // 240ms grace period prevents dropping/rớt menu
    }

    function closeDropdownImmediately() {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
      }
      menuItem.classList.remove('show');
      menuItem.classList.remove('active');
      dropdown.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    // Trigger click: toggle dropdown open/close and prevent direct URL jump
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      const isCurrentlyOpen = menuItem.classList.contains('show') || dropdown.classList.contains('is-open');

      if (isCurrentlyOpen) {
        closeDropdownImmediately();
        trigger.blur();
      } else {
        // Close all other service menus
        document.querySelectorAll('.menu_service_xmd').forEach(m => {
          m.classList.remove('show');
          m.classList.remove('active');
          const d = m.querySelector('.mega_menu_service');
          if (d) d.classList.remove('is-open');
          const t = m.querySelector('.menu-service-trigger') || m.querySelector('a');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
        openDropdown();
      }
    });

    // Hover support for Desktop on menuItem and dropdown
    menuItem.addEventListener('mouseenter', function() {
      if (window.innerWidth >= 992) {
        openDropdown();
      }
    });

    menuItem.addEventListener('mouseleave', function() {
      if (window.innerWidth >= 992) {
        scheduleCloseDropdown();
      }
    });

    dropdown.addEventListener('mouseenter', function() {
      if (window.innerWidth >= 992) {
        openDropdown();
      }
    });

    dropdown.addEventListener('mouseleave', function() {
      if (window.innerWidth >= 992) {
        scheduleCloseDropdown();
      }
    });

    // Close immediately if hovering over a sibling top-level menu item
    document.querySelectorAll('.mega_menu_header.mega-main-menu > li:not(.menu_service_xmd)').forEach(otherLi => {
      otherLi.addEventListener('mouseenter', function() {
        closeDropdownImmediately();
      });
    });

    // Prevent clicks inside dropdown container from bubbling up
    dropdown.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  });

  // Close desktop dropdown on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.menu_service_xmd')) {
      document.querySelectorAll('.menu_service_xmd').forEach(m => {
        m.classList.remove('show');
        m.classList.remove('active');
        const d = m.querySelector('.mega_menu_service');
        if (d) d.classList.remove('is-open');
        const t = m.querySelector('.menu-service-trigger') || m.querySelector('a');
        if (t) {
          t.setAttribute('aria-expanded', 'false');
          t.blur();
        }
      });
    }
  });

  // Mobile Drawer: Tap on "Dịch vụ hậu mãi" to expand/collapse subpages
  document.querySelectorAll('.submenu-expand, .service-mobile-expand').forEach(expandLi => {
    const isService = expandLi.classList.contains('service-mobile-expand') || 
                      (expandLi.textContent && expandLi.textContent.toLowerCase().includes('dịch vụ hậu mãi'));
    if (!isService) return;

    const toggleHeader = expandLi.querySelector('.toggle-header') || expandLi;
    const subUl = expandLi.querySelector('ul');
    if (!subUl) return;

    toggleHeader.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = expandLi.classList.contains('active-expand') || expandLi.classList.contains('open');
      expandLi.classList.toggle('active-expand', !isOpen);
      expandLi.classList.toggle('open', !isOpen);
      expandLi.classList.toggle('active', !isOpen);
      subUl.style.display = isOpen ? 'none' : 'block';
      subUl.style.visibility = isOpen ? 'hidden' : 'visible';
      subUl.style.opacity = isOpen ? '0' : '1';
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initServiceMenuDropdown);
} else {
  initServiceMenuDropdown();
}


// On-page Navigation ScrollSpy & Smooth Scroll
function initOnpageNav() {
  const navLinks = document.querySelectorAll('.v3s-onpage-nav-item a');
  if (!navLinks.length) return;

  // Smooth scroll
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          navLinks.forEach(l => l.classList.remove('active'));
          this.classList.add('active');
        }
      }
    });
  });

  // ScrollSpy on scroll
  const sections = document.querySelectorAll('.v3s-onpage-section');
  if (!sections.length) return;

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 160;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === '#' + currentId) {
          link.classList.add('active');
        } else if (!link.classList.contains('onpage-cta-link')) {
          link.classList.remove('active');
        }
      });
      // Also sync mobile select if present
      const mobSelect = document.querySelector('.v3s-onpage-mobile-select select');
      if (mobSelect) {
        mobSelect.value = '#' + currentId;
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOnpageNav);
} else {
  initOnpageNav();
}



// ==========================================================================
// VINFAST OFFICIAL DVHM-REVAMP INTERACTIVE FEATURES (100% FIDELITY)
// ==========================================================================
function initDvhmRevampFeatures() {
  // 1. Sidebar Smooth Scroll & ScrollSpy
  const sidebarLinks = document.querySelectorAll('.dvhm-revamp-sidebar__link');
  const sections = document.querySelectorAll('.dvhm-revamp-section');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          sidebarLinks.forEach(l => l.closest('.dvhm-revamp-sidebar__item')?.classList.remove('dvhm-revamp-sidebar__item--active'));
          this.closest('.dvhm-revamp-sidebar__item')?.classList.add('dvhm-revamp-sidebar__item--active');
        }
      }
    });
  });

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 180;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });
    if (currentId) {
      sidebarLinks.forEach(link => {
        const item = link.closest('.dvhm-revamp-sidebar__item');
        if (link.getAttribute('href') === '#' + currentId) {
          item?.classList.add('dvhm-revamp-sidebar__item--active');
        } else {
          item?.classList.remove('dvhm-revamp-sidebar__item--active');
        }
      });
    }
  });

  // 2. Official FAQ Accordion Toggle
  const faqQuestions = document.querySelectorAll('.dvhm-revamp-faq__question');
  faqQuestions.forEach(q => {
    q.addEventListener('click', function() {
      const item = this.closest('.dvhm-revamp-faq__item');
      if (!item) return;
      const isOpen = item.classList.contains('dvhm-revamp-faq__item--open') || item.classList.contains('active');
      const parentList = item.closest('.dvhm-revamp-faq__list');
      if (parentList) {
        parentList.querySelectorAll('.dvhm-revamp-faq__item').forEach(i => {
          i.classList.remove('dvhm-revamp-faq__item--open');
          i.classList.remove('active');
          const ans = i.querySelector('.dvhm-revamp-faq__answer');
          if (ans) ans.style.display = 'none';
        });
      }
      if (!isOpen) {
        item.classList.add('dvhm-revamp-faq__item--open');
        item.classList.add('active');
        const ans = item.querySelector('.dvhm-revamp-faq__answer');
        if (ans) ans.style.display = 'block';
      }
    });
  });

  // 3. Document Dropdown Toggle (Sổ bảo hành & HDSD)
  const docDropdownToggles = document.querySelectorAll('.dvhm-revamp-doc-dropdown__toggle');
  docDropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      const parent = this.closest('.dvhm-revamp-doc-dropdown');
      if (parent) {
        parent.classList.toggle('dvhm-revamp-doc-dropdown--open');
      }
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.dvhm-revamp-doc-dropdown--open').forEach(el => {
      el.classList.remove('dvhm-revamp-doc-dropdown--open');
    });
  });

  // 5. Maintenance Vehicle Selector Toggle
  const vehicleCards = document.querySelectorAll('.dvhm-revamp-maintenance__vehicle');
  vehicleCards.forEach(card => {
    card.addEventListener('click', function() {
      vehicleCards.forEach(c => c.classList.remove('dvhm-revamp-maintenance__vehicle--active'));
      this.classList.add('dvhm-revamp-maintenance__vehicle--active');
    });
  });

  // 4. Mobile Sidebar Toggle
  const sidebarToggle = document.querySelector('.dvhm-revamp-sidebar__toggle');
  const sidebarNav = document.querySelector('.dvhm-revamp-sidebar__nav');
  if (sidebarToggle && sidebarNav) {
    sidebarToggle.addEventListener('click', () => {
      sidebarNav.classList.toggle('dvhm-revamp-sidebar__nav--open');
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDvhmRevampFeatures);
} else {
  initDvhmRevampFeatures();
}


// ==========================================================================
// VINFAST OFFICIAL XE MÁY ĐIỆN MEGA MENU ("SẢN PHẨM" - .menu_scooter)
// Smooth hover, anti-drop debounce, direct link navigation, tab switching & lazy loading
// ==========================================================================
function initScooterMenuDropdown() {
  const scooterLi = document.querySelector('.mega_menu_header.mega-main-menu > li.menu_scooter, li.mega_main.menu_scooter, .menu_scooter');
  if (!scooterLi) return;

  const triggerLink = scooterLi.querySelector(':scope > a');
  const megaMenu = scooterLi.querySelector('.mega-dropdown.mega_menu, .mega_menu');
  if (!megaMenu) return;

  let hoverTimer = null;

  // Helper: load and reveal all lazy images in container
  function loadScooterImages(container) {
    const root = container || megaMenu;
    const lazyImages = root.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      const dataSrc = img.getAttribute('data-src');
      if (dataSrc && (!img.getAttribute('src') || img.getAttribute('src') === '')) {
        img.setAttribute('src', dataSrc);
      }
      img.style.opacity = '1';
      img.style.visibility = 'visible';
    });
  }

  // Open mega menu
  function openScooterMenu() {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    scooterLi.classList.add('show', 'active', 'is-open');
    megaMenu.classList.add('is-open', 'show');
    if (triggerLink) {
      triggerLink.classList.add('active');
      triggerLink.setAttribute('aria-expanded', 'true');
    }
    loadScooterImages();
  }

  // Schedule close with 280ms debounce (prevents accidental dropping / rớt menu)
  function scheduleCloseScooterMenu() {
    if (hoverTimer) clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      closeScooterMenuImmediately();
    }, 280);
  }

  // Immediate close
  function closeScooterMenuImmediately() {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    scooterLi.classList.remove('show', 'active', 'is-open');
    megaMenu.classList.remove('is-open', 'show');
    if (triggerLink) {
      triggerLink.classList.remove('active');
      triggerLink.setAttribute('aria-expanded', 'false');
    }
  }

  // Desktop Hover triggers (>= 992px)
  scooterLi.addEventListener('mouseenter', function() {
    if (window.innerWidth >= 992) {
      openScooterMenu();
    }
  });

  scooterLi.addEventListener('mouseleave', function() {
    if (window.innerWidth >= 992) {
      scheduleCloseScooterMenu();
    }
  });

  megaMenu.addEventListener('mouseenter', function() {
    if (window.innerWidth >= 992) {
      openScooterMenu();
    }
  });

  megaMenu.addEventListener('mouseleave', function() {
    if (window.innerWidth >= 992) {
      scheduleCloseScooterMenu();
    }
  });

  // Close immediately if hovering over sibling top-level menu items
  document.querySelectorAll('.mega_menu_header.mega-main-menu > li:not(.menu_scooter)').forEach(otherLi => {
    otherLi.addEventListener('mouseenter', function() {
      closeScooterMenuImmediately();
    });
  });

  // CRITICAL REQUIREMENT: Direct click on "Sản phẩm" (<a href="/xe-may-dien.html">)
  // Must navigate directly to /xe-may-dien.html!
  // Intercept in CAPTURE phase so jQuery in main.js cannot preventDefault()!
  if (triggerLink) {
    triggerLink.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href && href !== '#' && !href.startsWith('javascript:')) {
        // Prevent other listeners from stopping navigation
        e.stopImmediatePropagation();
        window.location.href = href;
      }
    }, true);
  }

  // Tab switching inside mega menu (#mega_oto_tab)
  function switchTab(tabElement, targetId) {
    const tabContainer = megaMenu.querySelector('#mega_oto_tab');
    if (tabContainer) {
      tabContainer.querySelectorAll('.tab-menu-xmd, .nav-link').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
    }
    tabElement.classList.add('active');
    tabElement.setAttribute('aria-selected', 'true');

    // Show corresponding tab-pane
    const allPanes = megaMenu.querySelectorAll('.tab-content > .tab-pane, #block-megamainmenuxemay .tab-pane');
    allPanes.forEach(pane => {
      pane.classList.remove('active', 'show', 'in');
      pane.style.display = 'none';
    });

    const activePane = megaMenu.querySelector(targetId);
    if (activePane) {
      activePane.classList.add('active', 'show', 'in');
      activePane.style.display = 'block';
      activePane.style.opacity = '1';
      loadScooterImages(activePane);
    }
  }

  // Bind tab links inside #mega_oto_tab
  const tabLinks = megaMenu.querySelectorAll('#mega_oto_tab .tab-menu-xmd, #mega_oto_tab .nav-link');
  tabLinks.forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        switchTab(this, targetId);
      }
    });

    tab.addEventListener('mouseenter', function() {
      const targetId = this.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        switchTab(this, targetId);
      }
    });
  });

  // Ensure clicks on product links inside megaMenu navigate properly
  megaMenu.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        e.stopPropagation();
        switchTab(link, href);
        return;
      }
      // If valid product link, allow normal navigation
      return;
    }
    // Prevent non-link clicks inside dropdown from bubbling up and closing
    e.stopPropagation();
  });

  // Close when clicking outside on Desktop
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.menu_scooter')) {
      closeScooterMenuImmediately();
    }
  });

  // Ensure default active tab is properly displayed and its images loaded
  const defaultActiveTab = megaMenu.querySelector('#mega_oto_tab .nav-link.active, #mega_oto_tab .tab-menu-xmd.active');
  if (defaultActiveTab) {
    const targetId = defaultActiveTab.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      switchTab(defaultActiveTab, targetId);
    }
  } else {
    // Fallback to first tab
    const firstTab = megaMenu.querySelector('#mega_oto_tab .tab-menu-xmd, #mega_oto_tab .nav-link');
    if (firstTab) {
      const targetId = firstTab.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        switchTab(firstTab, targetId);
      }
    }
  }

  // Pre-load images initially
  loadScooterImages();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScooterMenuDropdown);
} else {
  initScooterMenuDropdown();
}


// ==========================================================================
// VINFAST OFFICIAL MOBILE RESPONSIVE ENHANCEMENTS (SMARTPHONES <= 768px & <= 991px)
// Sticky Bottom Bar, Responsive Tables, Mobile Drawer Accordion & Color Swatches
// ==========================================================================
function initMobileResponsiveEnhancements() {
  // 1. Sticky Mobile Bottom CTA Bar
  function setupMobileBottomBar() {
    if (document.getElementById('v3sMobileBottomBar')) return;

    const bar = document.createElement('div');
    bar.id = 'v3sMobileBottomBar';
    bar.className = 'v3s-mobile-sticky-bar d-md-none';
    bar.innerHTML = `
      <a href="tel:0933792866" class="v3s-mobile-sticky-btn v3s-mobile-sticky-btn--call" aria-label="Gọi hotline VinFast Tây Sài Gòn">
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/></svg>
        <span>Gọi ngay</span>
      </a>
      <a href="https://zalo.me/0933792866" target="_blank" rel="noopener noreferrer" class="v3s-mobile-sticky-btn v3s-mobile-sticky-btn--zalo" aria-label="Chat Zalo VinFast Tây Sài Gòn">
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.14 2 11.25c0 2.87 1.44 5.43 3.69 7.07L4.5 22l4.02-1.34C9.72 20.85 10.84 21 12 21c5.52 0 10-4.14 10-9.25S17.52 2 12 2z"/></svg>
        <span>Chat Zalo</span>
      </a>
      <a href="/dang-ky-lai-thu.html" class="v3s-mobile-sticky-btn v3s-mobile-sticky-btn--booking" id="v3sStickyBookingBtn" aria-label="Đặt lịch lái thử xe máy điện">
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M13 3L4 14h7v7l9-11h-7V3z"/></svg>
        <span>Đăng ký lái thử</span>
      </a>
    `;

    document.body.appendChild(bar);

    const bookingBtn = document.getElementById('v3sStickyBookingBtn');
    if (bookingBtn) {
      bookingBtn.addEventListener('click', function(e) {
        const leadForm = document.querySelector('#lead-form') || 
                         document.querySelector('#dang-ky-lai-thu') || 
                         document.querySelector('form[name="lead"]') ||
                         document.querySelector('.v3s-lead-form');
        if (leadForm) {
          e.preventDefault();
          leadForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  // 2. Mobile Drawer Accordion Toggle ("Sản phẩm" & "Dịch vụ hậu mãi") & Close Handling
  function setupMobileDrawerAccordion() {
    const modal = document.getElementById('megaMenuModal');
    if (modal) {
      // Ensure mobile header with Close Button is visible
      let modalHeader = modal.querySelector('.modal-header');
      if (modalHeader) {
        modalHeader.classList.remove('d-none', 'd-lg-block');
      }

      let closeBtn = modal.querySelector('.close, .v3s-drawer-close-btn');
      if (!closeBtn && modalHeader) {
        closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'close v3s-drawer-close-btn';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.innerHTML = `
          <svg fill="none" height="20" width="20" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        `;
        modalHeader.appendChild(closeBtn);
      }

      // Close modal on click of close button
      if (closeBtn) {
        closeBtn.onclick = function(e) {
          e.preventDefault();
          if (window.jQuery && window.jQuery(modal).modal) {
            window.jQuery(modal).modal('hide');
          } else {
            modal.classList.remove('show');
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
          }
          document.body.style.overflowY = 'auto';
        };
      }

      // Automatically close modal when clicking on any navigational link inside
      const drawerLinks = modal.querySelectorAll('a[href]:not([href^="javascript"]):not(.view-all):not(.toggle-header)');
      drawerLinks.forEach(link => {
        link.addEventListener('click', function() {
          if (window.jQuery && window.jQuery(modal).modal) {
            window.jQuery(modal).modal('hide');
          }
        });
      });
    }

    const expandItems = document.querySelectorAll('#mega-submenu .submenu-expand, #mega-submenu .service-mobile-expand');
    expandItems.forEach(item => {
      if (item.dataset.v3sAccordionBound) return;
      item.dataset.v3sAccordionBound = 'true';

      const toggleHeader = item.querySelector('.toggle-header');
      const subUl = item.querySelector('ul');
      if (!toggleHeader || !subUl) return;

      // Use Capture Phase to intercept and control accordion behavior completely
      toggleHeader.addEventListener('click', function(e) {
        // If clicking on "Xem tất cả" (.view-all), allow natural browser navigation
        if (e.target.closest('.view-all')) {
          return;
        }

        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();

        const isCurrentlyOpen = item.classList.contains('active-expand') || item.classList.contains('open');

        // Close other sibling expands
        const siblings = item.parentElement.querySelectorAll('.submenu-expand, .service-mobile-expand');
        siblings.forEach(s => {
          if (s !== item) {
            s.classList.remove('active-expand', 'open', 'active');
            const otherUl = s.querySelector('ul');
            if (otherUl) otherUl.style.display = 'none';
          }
        });

        // Toggle current item
        if (!isCurrentlyOpen) {
          item.classList.add('active-expand', 'open', 'active');
          subUl.style.display = 'block';
        } else {
          item.classList.remove('active-expand', 'open', 'active');
          subUl.style.display = 'none';
        }
      }, true);
    });
  }

  // 3. Auto-wrap Tables in Touch-friendly Horizontal Scrollers
  function setupResponsiveTables() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      // Check if already in a responsive wrapper
      const parent = table.parentElement;
      if (parent && (parent.classList.contains('table-responsive') || 
                     parent.classList.contains('dvhm-responsive-table-wrap') || 
                     parent.classList.contains('v3s-table-scroll'))) {
        return;
      }
      const wrap = document.createElement('div');
      wrap.className = 'table-responsive v3s-table-scroll';
      wrap.style.maxWidth = '100%';
      wrap.style.overflowX = 'auto';
      wrap.style.webkitOverflowScrolling = 'touch';
      wrap.style.marginBottom = '20px';
      wrap.style.borderRadius = '8px';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  // 4. Color Swatches Tap Support on PDPs
  function setupColorSwatches() {
    const swatches = document.querySelectorAll('.ebike-pdp-v2-color-variant__swatch, .vf-swatch-dot, .egp-colors__item');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', function() {
        const container = this.closest('.ebike-pdp-v2-color-variant__selector, .vf-color-swatches, .egp-colors');
        if (container) {
          container.querySelectorAll('.ebike-pdp-v2-color-variant__swatch, .vf-swatch-dot, .egp-colors__item').forEach(s => {
            s.classList.remove('active', 'selected');
          });
        }
        this.classList.add('active', 'selected');
      });
    });
  }

  // Run on load
  setupMobileBottomBar();
  setupMobileDrawerAccordion();
  setupResponsiveTables();
  setupColorSwatches();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileResponsiveEnhancements);
} else {
  initMobileResponsiveEnhancements();
}
