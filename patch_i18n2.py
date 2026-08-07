import re

def append_to_i18n(filepath, new_content):
    with open(filepath, 'r') as f:
        content = f.read()

    last_brace_index = content.rfind('};')
    
    if last_brace_index != -1:
        updated_content = content[:last_brace_index] + new_content + content[last_brace_index:]
        with open(filepath, 'w') as f:
            f.write(updated_content)
        print(f"Updated {filepath}")
    else:
        print(f"Could not find '}};' in {filepath}")

en_new = """
  // URL display
  'add_display.url_prompt': 'Want to display in a browser without pairing?',
  'add_display.generate_url_btn': 'Generate URL Display',
"""

pt_new = """
  // URL display
  'add_display.url_prompt': 'Deseja exibir em um navegador sem parear?',
  'add_display.generate_url_btn': 'Gerar URL de Exibição',
"""

append_to_i18n('frontend/js/i18n/en.js', en_new)
append_to_i18n('frontend/js/i18n/pt.js', pt_new)
