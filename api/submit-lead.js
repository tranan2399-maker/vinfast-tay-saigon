module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    let leadData = req.body;
    if (typeof leadData === 'string') {
      try {
        leadData = JSON.parse(leadData);
      } catch (e) {
        leadData = Object.fromEntries(new URLSearchParams(leadData));
      }
    }

    const fullName = (leadData.fullName || leadData.name || leadData.lastName || leadData.field_name || 'Khách hàng').trim();
    const phone = (leadData.phone || leadData.field_phone_number || '').trim();
    const email = (leadData.email || leadData.field_email || '').trim();
    const model = (leadData.model || leadData.vehicle_model || leadData.field_model || 'Xe máy điện VinFast').trim();
    const color = (leadData.color || '').trim();
    const batteryOption = (leadData.batteryOption || '').trim();
    const paymentMethod = (leadData.paymentMethod || leadData.purchaseType || '').trim();
    const testDrive = (leadData.testDrive || '').trim();
    const timeline = (leadData.timeline || '').trim();
    const showroom = (leadData.showroom || leadData.showroom_target || leadData.areaReceptions || leadData.field_province || 'VinFast Tây Sài Gòn').trim();
    const requestType = (leadData.requestType || leadData.lead_type || 'Đăng ký tư vấn & Báo giá').trim();
    const note = (leadData.note || leadData.notes || leadData.field_additional_info || '').trim();

    if (!phone) {
      return res.status(400).json({ success: false, error: 'Vui lòng cung cấp số điện thoại liên hệ' });
    }

    const processedLead = {
      fullName,
      phone,
      email,
      model,
      color,
      batteryOption,
      paymentMethod,
      testDrive,
      timeline,
      showroom,
      requestType,
      note,
      submitted_at: new Date().toISOString()
    };

    console.log('[LEAD MỚI TIẾP NHẬN]', processedLead);

    return res.status(200).json({
      success: true,
      message: 'Đăng ký thành công! Chuyên viên VinFast Tây Sài Gòn sẽ liên hệ lại với Quý khách trong vòng 5 phút.',
      lead: processedLead
    });
  } catch (err) {
    console.error('Error handling lead submission:', err);
    return res.status(500).json({ success: false, error: 'Lỗi máy chủ nội bộ' });
  }
};
