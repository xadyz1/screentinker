import os

replacements = {
    'icon-192.png': 'swiftdisplaylogo.png',
    'icon-512.png': 'swiftdisplaylogo.png',
    'logoswift.png': 'swiftdisplaylogo.png',
    'logowhiteswift.png': 'swiftdisplaylogo.png',
    'swiftdisplayfavicon.png': 'swiftdisplaylogo.png',
    'swiftdisplayappicon.png': 'swiftdisplaylogo.png'
}

def process_dir(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith(('.html', '.js', '.json')):
                continue
            
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r') as f:
                    content = f.read()
            except UnicodeDecodeError:
                continue

            modified = content
            for old, new in replacements.items():
                modified = modified.replace(old, new)

            if modified != content:
                with open(filepath, 'w') as f:
                    f.write(modified)
                print(f"Updated {filepath}")

process_dir('frontend')
