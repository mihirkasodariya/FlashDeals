import os
import re

def process_dir(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.js') and file != 'CustomText.js':
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                modified = False
                
                if re.search(r"import\s*\{[^}]*\bText\b[^}]*\}\s*from\s*['\"]react-native['\"]", content):
                    # Replace destructuring
                    content = re.sub(r'(\bimport\s*\{.*?)\bText\b\s*,\s*(.*?\}\s*from\s*[\'\"]react-native[\'\"])', r'\1\2', content, flags=re.DOTALL)
                    content = re.sub(r'(\bimport\s*\{.*?),\s*\bText\b\s*(.*?\}\s*from\s*[\'\"]react-native[\'\"])', r'\1\2', content, flags=re.DOTALL)
                    content = re.sub(r'(\bimport\s*\{\s*)\bText\b\s*(\}\s*from\s*[\'\"]react-native[\'\"])', r'\1\2', content, flags=re.DOTALL)
                    
                    import_stmt = "import Text from '../components/CustomText';"
                    if 'components' in path.replace('\\', '/'):
                        import_stmt = "import Text from './CustomText';"
                        
                    if import_stmt not in content:
                        content = re.sub(r'(import React.*?;\n)', r'\g<1>' + import_stmt + '\n', content, count=1)
                    
                    modified = True

                if modified:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print('Processed ' + path)

process_dir('client/src')
