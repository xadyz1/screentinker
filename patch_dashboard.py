import re

with open('frontend/js/views/dashboard.js', 'r') as f:
    content = f.read()

new_js = """
  document.getElementById('generateUrlDisplayBtn')?.addEventListener('click', async () => {
    const name = document.getElementById('deviceNameInput').value.trim();
    try {
      const device = await api.provisionUrlDisplay(name || undefined);
      document.getElementById('addDeviceModal').style.display = 'none';
      showToast(t('dashboard.toast.display_paired'), 'success');
      
      const url = `${window.location.origin}/player?device_id=${device.id}&token=${device._raw_token}`;
      
      // Try to copy to clipboard, or show prompt
      try {
        await navigator.clipboard.writeText(url);
        showToast('URL copied to clipboard!', 'success');
      } catch (err) {
        prompt('Copy your display URL:', url);
      }
      
      loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
"""

# Insert after pairBtn.onclick setup
content = re.sub(
    r"(pairBtn\.onclick = async \(\) => \{.*?\n  \};\n)",
    r"\1" + new_js,
    content,
    flags=re.DOTALL
)

with open('frontend/js/views/dashboard.js', 'w') as f:
    f.write(content)
