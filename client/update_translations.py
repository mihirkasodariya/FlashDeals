
import os
import json

translations = {
    "en": "Account Status",
    "gj": "એકાઉન્ટની સ્થિતિ",
    "hi": "खाते की स्थिति",
    "ar": "حالة الحساب",
    "as": "একাউণ্টৰ অৱস্থা",
    "bn": "অ্যাকাউন্টের স্থিতি",
    "de": "Kontostatus",
    "es": "Estado de la cuenta",
    "fr": "Statut du compte",
    "it": "Stato dell'account",
    "ja": "アカウントの状態",
    "kn": "ಖಾತೆಯ ಸ್ಥಿತಿ",
    "ko": "계정 상태",
    "ma": "അക്കൗണ്ട് നില", # Assuming it's ML or similar
    "ml": "അക്കൗണ്ട് നില",
    "mr": "खात्याची स्थिती",
    "or": "ଏକାଉଣ୍ଟ୍ ସ୍ଥିତି",
    "pa": "ਖਾਤੇ ਦੀ ਸਥਿਤੀ",
    "pt": "Status da conta",
    "ru": "Статус аккаунта",
    "sa": "खाता स्थिति",
    "ta": "கணக்கு நிலை",
    "te": "ఖాతా స్థితి",
    "ur": "اکاؤنٹ کی صورتحال",
    "zh": "账户状态"
}

base_path = r"D:\JigneshBhai\FlashDeals\client\src\translations"

for lang_code, translation in translations.items():
    file_path = os.path.join(base_path, f"{lang_code}.json")
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if "profile" in data:
            data["profile"]["account_status"] = translation
            # Also ensure "cool": "Successfully" in profile if it exists (user did this for en.json)
            if "cool" in data["profile"]:
                # user changed cool to "Successfully" in en.json
                # but maybe they want it translated? The user specifically asked for account_status.
                # However, looking at the previous turn's diff, they also changed cool.
                pass 
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            print(f"Updated {lang_code}.json")
    else:
        print(f"File {file_path} not found")
