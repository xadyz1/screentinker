import re

with open('frontend/index.html', 'r') as f:
    content = f.read()

new_html = """        <div style="border-top:1px solid var(--border,#1e293b);margin-top:16px;padding-top:16px">
          <p style="font-size:12px;color:var(--text-muted,#64748b);margin-bottom:10px;font-weight:500" data-i18n="add_display.url_prompt">Want to display in a browser without pairing?</p>
          <button type="button" class="btn btn-secondary btn-sm" id="generateUrlDisplayBtn" style="width:100%;justify-content:center;font-size:12px">
            &#128279; <span data-i18n="add_display.generate_url_btn">Generate URL Display</span>
          </button>
        </div>
        <div style="border-top:1px solid var(--border,#1e293b);margin-top:16px;padding-top:16px">
"""

content = re.sub(
    r'<div style="border-top:1px solid var\(--border,#1e293b\);margin-top:16px;padding-top:16px">\s*<p style="font-size:12px;color:var\(--text-muted,#64748b\);margin-bottom:10px;font-weight:500"\s*data-i18n="add_display\.owner_prompt">',
    new_html + '<p style="font-size:12px;color:var(--text-muted,#64748b);margin-bottom:10px;font-weight:500"\n            data-i18n="add_display.owner_prompt">',
    content,
    count=1
)

with open('frontend/index.html', 'w') as f:
    f.write(content)
