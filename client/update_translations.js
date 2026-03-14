const fs = require('fs');
const path = require('path');

const dir = 'd:/JigneshBhai/FlashDeals/client/src/translations';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'en.json');

const translations = {
  ar: 'تحميل شهادة GSTN',
  as: 'GSTN প্ৰমাণপত্ৰ আপলোড কৰক',
  bn: 'GSTN শংসাপত্র আপলোড করুন',
  de: 'GSTN-Zertifikat hochladen',
  es: 'Subir certificado GSTN',
  fr: 'Télécharger le certificat GSTN',
  gj: 'GSTN પ્રમાણપત્ર અપલોડ કરો',
  hi: 'GSTN प्रमाणपत्र अपलोड करें',
  it: 'Carica certificato GSTN',
  ja: 'GSTN証明書をアップロード',
  kn: 'GSTN ಪ್ರಮಾಣಪತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
  ko: 'GSTN 인증서 업로드',
  ma: 'GSTN प्रमाणपत्र अपलोड करा',
  ml: 'GSTN സർട്ടിഫിക്കറ്റ് അപ്‌ലോഡ് ചെയ്യുക',
  mr: 'GSTN प्रमाणपत्र अपलोड करा',
  or: 'GSTN ପ୍ରମାଣପତ୍ର ଅପଲୋଡ୍ କରନ୍ତୁ',
  pa: 'GSTN ਸਰਟੀਫਿਕੇਟ ਅੱਪਲੋਡ ਕਰੋ',
  pt: 'Enviar certificado GSTN',
  ru: 'Загрузить сертификат GSTN',
  sa: 'GSTN प्रमाणपत्ं उद्भारयन्तु',
  ta: 'GSTN சான்றிதழைப் பதிவேற்றுக',
  te: 'GSTN సర్టిఫికేట్‌ను అప్‌లోడ్ చేయండి',
  ur: 'GSTN سرٹیفکیٹ اپ لوڈ کریں',
  zh: '上传 GSTN 证书'
};

files.forEach(file => {
  const code = file.replace('.json', '');
  if (translations[code]) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    try {
        const json = JSON.parse(content);
        if(json.vendor_register && json.vendor_register.upload_id) {
            json.vendor_register.upload_id = translations[code];
            fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
            console.log(`Updated ${file}`);
        } else {
             // Fallback to regex if JSON structure is slightly different
             content = content.replace(/("upload_id"\s*:\s*").*?(")/, `$1${translations[code]}$2`);
             fs.writeFileSync(filePath, content, 'utf8');
             console.log(`Regex Updated ${file}`);
        }
    } catch(e) {
        // Fallback to regex
        content = content.replace(/("upload_id"\s*:\s*").*?(")/, `$1${translations[code]}$2`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Regex Updated ${file} due to json parse error`);
    }
  }
});
