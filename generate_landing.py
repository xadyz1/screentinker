import re

html_content = """<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SwiftDisplay</title>
  <meta name="description" content="Deliver your messages to digital screens instantly from the cloud or self-hosted in your network.">
  <link rel="icon" type="image/png" sizes="192x192" href="/assets/swiftdisplaylogo.png">
  <link rel="icon" type="image/png" sizes="512x512" href="/assets/swiftdisplaylogo.png">
  <link rel="apple-touch-icon" href="/assets/swiftdisplaylogo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Goldman:wght@400;700&family=Michroma&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #f9fafb;
      --text: #111827;
      --card-bg: #ffffff;
      --border: #e5e7eb;
      --primary: #ef4444; /* approximate red/orange */
      --secondary: #2563eb; /* approximate blue */
      --nav-bg: rgba(255, 255, 255, 0.9);
      --gradient-text: linear-gradient(90deg, #3b82f6, #ef4444);
    }
    [data-theme="dark"] {
      --bg: #09090b;
      --text: #f8fafc;
      --card-bg: #18181b;
      --border: #27272a;
      --nav-bg: rgba(9, 9, 11, 0.9);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background-color: var(--bg); color: var(--text); line-height: 1.5; transition: background-color 0.3s, color 0.3s; }
    h1, h2, h3, h4, .nav-logo { font-family: 'Goldman', sans-serif; }
    a { color: inherit; text-decoration: none; }
    nav { position: fixed; top: 0; width: 100%; display: flex; justify-content: center; align-items: center; padding: 1rem 2rem; background: var(--nav-bg); backdrop-filter: blur(10px); z-index: 50; border-bottom: 1px solid var(--border); }
    .nav-content { display: flex; align-items: center; justify-content: space-between; width: 100%; max-width: 1200px; }
    .nav-links { display: flex; gap: 2rem; align-items: center; font-weight: 500; font-size: 14px; }
    .nav-actions { display: flex; gap: 1rem; align-items: center; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; border: none; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s;}
    .btn-primary { background: var(--primary); color: white; background: linear-gradient(90deg, #4f46e5, #ef4444); }
    .btn-secondary { background: var(--card-bg); color: var(--text); border: 1px solid var(--border); }
    .btn-login { background: #ef4444; color: white; border-radius: 20px; padding: 0.4rem 1.2rem; }
    .hero { text-align: center; padding: 8rem 2rem 4rem; max-width: 800px; margin: 0 auto; }
    .hero h1 { font-size: 3.5rem; margin-bottom: 1rem; line-height: 1.2; }
    .hero h1 span { background: var(--gradient-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { color: #6b7280; font-size: 1.125rem; margin-bottom: 2rem; }
    [data-theme="dark"] .hero p { color: #a1a1aa; }
    .tv-mockup { max-width: 800px; margin: 0 auto 4rem; display: block; width: 100%; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
    
    .section-title { text-align: center; margin-bottom: 3rem; }
    .section-title h2 { font-size: 2rem; margin-bottom: 0.5rem; text-transform: uppercase; }
    .section-title p { color: #6b7280; }
    [data-theme="dark"] .section-title p { color: #a1a1aa; }
    
    .grid { display: grid; gap: 1.5rem; max-width: 1200px; margin: 0 auto; padding: 0 2rem 4rem; }
    .grid-3 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
    .grid-4 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem; transition: transform 0.2s; }
    .card:hover { transform: translateY(-2px); }
    .card-icon { width: 40px; height: 40px; background: rgba(59, 130, 246, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; color: var(--secondary); font-size: 1.25rem;}
    .card h3 { font-size: 1.125rem; margin-bottom: 0.5rem; font-family: 'Inter', sans-serif;}
    .card p { color: #6b7280; font-size: 0.875rem; }
    [data-theme="dark"] .card p { color: #a1a1aa; }
    
    .portable-tv { display: flex; align-items: center; gap: 4rem; max-width: 1000px; margin: 4rem auto; padding: 0 2rem; }
    .portable-tv img { width: 50%; object-fit: contain; }
    .portable-tv-content { flex: 1; }
    .badge { display: inline-block; background: #fbbf24; color: #000; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 4px; margin-bottom: 1rem; }
    
    .pricing { max-width: 1000px; margin: 0 auto 4rem; padding: 0 2rem; }
    .pricing-toggle { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 3rem; }
    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .pricing-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 1rem; padding: 2rem; display: flex; flex-direction: column;}
    .pricing-card.popular { border-color: var(--primary); position: relative; }
    .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--primary); color: white; padding: 0.2rem 1rem; border-radius: 20px; font-size: 0.75rem; font-weight: bold; }
    .price { font-size: 2.5rem; font-weight: bold; margin: 1rem 0; font-family: 'Goldman', sans-serif;}
    .price span { font-size: 1rem; color: #6b7280; }
    .features-list { list-style: none; margin: 1.5rem 0; flex: 1; }
    .features-list li { margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
    .features-list li::before { content: '✓'; color: #10b981; font-weight: bold; }
    
    .cta-banner { background: var(--card-bg); border: 1px solid var(--border); border-radius: 1rem; padding: 3rem; max-width: 1000px; margin: 0 auto 4rem; text-align: left; display: flex; align-items: center; justify-content: space-between; }
    .cta-banner h2 { font-size: 2rem; margin-bottom: 1rem; }
    .cta-banner p { color: #6b7280; margin-bottom: 1.5rem; max-width: 400px; }
    
    footer { border-top: 1px solid var(--border); padding: 2rem; text-align: center; color: #6b7280; font-size: 0.875rem; }
    .footer-links { display: flex; justify-content: center; gap: 2rem; margin-bottom: 1rem; }
    
    .lang-selector { background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.25rem; border-radius: 4px; cursor: pointer; }
    .theme-toggle { background: transparent; border: none; color: var(--text); cursor: pointer; font-size: 1.25rem; }
  </style>
</head>
<body>
  <nav>
    <div class="nav-content">
      <div class="nav-logo">
        <img src="/assets/swiftdisplaylogo.png" alt="SwiftDisplay" style="height: 32px; margin-right: 8px; vertical-align: middle;">
      </div>
      <div class="nav-links">
        <a href="#" data-i18n="landing.nav.home">Home</a>
        <a href="#portable" data-i18n="landing.nav.portable_tv">Portable TV</a>
        <a href="#" data-i18n="landing.nav.api_docs">API + Docs</a>
        <a href="#" data-i18n="landing.nav.blog">Blog</a>
        <a href="#" data-i18n="landing.nav.contact">Contact</a>
      </div>
      <div class="nav-actions">
        <select id="lang-selector" class="lang-selector">
          <option value="en">EN</option>
          <option value="pt">PT</option>
        </select>
        <button id="theme-toggle" class="theme-toggle">🌓</button>
        <a href="/login.html" class="btn btn-login" data-i18n="landing.nav.login">Login</a>
      </div>
    </div>
  </nav>

  <div class="hero">
    <h1><span data-i18n="landing.hero.title_part1">Communicate with </span><span data-i18n="landing.hero.title_part2">Impact</span></h1>
    <p data-i18n="landing.hero.subtitle">Deliver your messages to digital screens instantly from the cloud or self-hosted in your network. Engage your audience in minutes.</p>
    <a href="/login.html?signup=1" class="btn btn-primary" data-i18n="landing.hero.cta" style="margin-bottom: 2rem;">Start Your Free Trial</a>
  </div>

  <div style="text-align:center; padding: 0 2rem;">
    <div style="max-width: 800px; margin: 0 auto 4rem; background: var(--card-bg); border-radius: 12px; border: 1px solid var(--border); padding: 1rem; aspect-ratio: 16/9; display: flex; align-items:center; justify-content:center;">
       <img src="/assets/swiftdisplaylogo.png" alt="TV Mockup" style="max-height: 50%;">
    </div>
  </div>

  <div class="section-title">
    <h2 data-i18n="landing.industry.title">Tailored for your industry</h2>
    <p data-i18n="landing.industry.subtitle">Flexible solutions for diverse environments.</p>
  </div>
  <div class="grid grid-3">
    <div class="card">
      <div class="card-icon">🏥</div>
      <h3 data-i18n="landing.industry.healthcare">Healthcare</h3>
      <p data-i18n="landing.industry.healthcare_desc">Enhance patient experiences, reduce wait times, and improve clinic flow.</p>
    </div>
    <div class="card">
      <div class="card-icon">🎓</div>
      <h3 data-i18n="landing.industry.education">Education</h3>
      <p data-i18n="landing.industry.education_desc">Keep students informed with real-time news, schedules, and alerts.</p>
    </div>
    <div class="card">
      <div class="card-icon">🛍️</div>
      <h3 data-i18n="landing.industry.retail">Retail & Dining</h3>
      <p data-i18n="landing.industry.retail_desc">Captivate shoppers and diners with vibrant menus and promotions.</p>
    </div>
  </div>

  <div class="section-title">
    <h2 data-i18n="landing.anywhere.title">WORKS ANYWHERE</h2>
    <p data-i18n="landing.anywhere.subtitle">Turn any screen into a display.</p>
  </div>
  <div class="grid grid-4">
    <div class="card" style="text-align:center;">
      <div class="card-icon" style="margin: 0 auto 1rem; background: rgba(239, 68, 68, 0.1); color: #ef4444;">🌐</div>
      <h3 data-i18n="landing.anywhere.browser">Any browser</h3>
      <p data-i18n="landing.anywhere.browser_desc">Chrome, Firefox, Safari, Edge, WebOS.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div class="card-icon" style="margin: 0 auto 1rem; background: rgba(245, 158, 11, 0.1); color: #f59e0b;">📱</div>
      <h3 data-i18n="landing.anywhere.smartphones">Smartphones</h3>
      <p data-i18n="landing.anywhere.smartphones_desc">iPhone & Android Mobile.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div class="card-icon" style="margin: 0 auto 1rem; background: rgba(59, 130, 246, 0.1); color: #3b82f6;">📺</div>
      <h3 data-i18n="landing.anywhere.smart_tvs">Smart TVs</h3>
      <p data-i18n="landing.anywhere.smart_tvs_desc">LG WebOS, Samsung Tizen OS, Roku.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div class="card-icon" style="margin: 0 auto 1rem; background: rgba(16, 185, 129, 0.1); color: #10b981;">🤖</div>
      <h3 data-i18n="landing.anywhere.android_tvs">Android TVs</h3>
      <p data-i18n="landing.anywhere.android_tvs_desc">Sony, TCL, Hisense.</p>
    </div>
  </div>

  <div class="section-title">
    <h2 data-i18n="landing.customization.title">CUSTOMIZATION OPTIONS</h2>
    <p data-i18n="landing.customization.subtitle">Your displays, totally adapted to your brand & business.</p>
  </div>
  <div class="grid grid-4" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
    <div class="card" style="text-align:center;">
      <div class="card-icon" style="margin: 0 auto 1rem;">🌐</div>
      <h3 data-i18n="landing.customization.custom_domains" style="font-size:1rem;">Custom Domains</h3>
      <p data-i18n="landing.customization.custom_domains_desc" style="font-size:0.75rem;">Bring your domain for your display URLs.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div class="card-icon" style="margin: 0 auto 1rem;">🎨</div>
      <h3 data-i18n="landing.customization.whitelabel" style="font-size:1rem;">Whitelabel UX</h3>
      <p data-i18n="landing.customization.whitelabel_desc" style="font-size:0.75rem;">Complete whitelabel solutions for agencies.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div class="card-icon" style="margin: 0 auto 1rem;">🏢</div>
      <h3 data-i18n="landing.customization.multi_org" style="font-size:1rem;">Multi-organization</h3>
      <p data-i18n="landing.customization.multi_org_desc" style="font-size:0.75rem;">Manage multiple clients from a single login.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div class="card-icon" style="margin: 0 auto 1rem;">🧩</div>
      <h3 data-i18n="landing.customization.plugins" style="font-size:1rem;">Plugins</h3>
      <p data-i18n="landing.customization.plugins_desc" style="font-size:0.75rem;">Connect integrations and data sources.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div class="card-icon" style="margin: 0 auto 1rem;">👥</div>
      <h3 data-i18n="landing.customization.roles" style="font-size:1rem;">Roles</h3>
      <p data-i18n="landing.customization.roles_desc" style="font-size:0.75rem;">Fine-grained RBAC access control.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div class="card-icon" style="margin: 0 auto 1rem;">✨</div>
      <h3 data-i18n="landing.customization.branding" style="font-size:1rem;">Branding Workspace</h3>
      <p data-i18n="landing.customization.branding_desc" style="font-size:0.75rem;">Custom colors and logos per org.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div class="card-icon" style="margin: 0 auto 1rem;">⭐</div>
      <h3 data-i18n="landing.customization.premium" style="font-size:1rem;">Premium Support</h3>
      <p data-i18n="landing.customization.premium_desc" style="font-size:0.75rem;">Highest priority technical support.</p>
    </div>
    <div class="card" style="text-align:center;">
      <div class="card-icon" style="margin: 0 auto 1rem;">📱</div>
      <h3 data-i18n="landing.customization.custom_apps" style="font-size:1rem;">Custom Apps</h3>
      <p data-i18n="landing.customization.custom_apps_desc" style="font-size:0.75rem;">We build custom integrations just for you.</p>
    </div>
  </div>
  
  <div id="portable" class="portable-tv">
    <div style="background: var(--card-bg); border: 1px solid var(--border); width: 40%; aspect-ratio: 9/16; border-radius: 12px; display:flex; align-items:center; justify-content:center;">
      <img src="/assets/swiftdisplaylogo.png" alt="Portable TV" style="width: 50%;">
    </div>
    <div class="portable-tv-content">
      <div class="badge" data-i18n="landing.portable.badge">NEW PRODUCT!</div>
      <h2 data-i18n="landing.portable.title" style="font-size:2.5rem; margin-bottom:1rem;">Go Mobile with Portable TV</h2>
      <p data-i18n="landing.portable.desc" style="color:#6b7280; margin-bottom: 2rem;">Our SwiftDisplay standalone Portable TV is battery-powered, meaning you can easily move it wherever it is needed to bring your content to life anywhere.</p>
      <ul class="features-list">
        <li data-i18n="landing.portable.battery">10h Battery life</li>
        <li data-i18n="landing.portable.trolley">Built-in trolley</li>
        <li data-i18n="landing.portable.touch">Lightweight Rubber Screen</li>
      </ul>
      <button class="btn btn-secondary" data-i18n="landing.portable.cta" style="margin-top:1rem;">Learn More</button>
    </div>
  </div>

  <div class="pricing">
    <div class="section-title">
      <h2 data-i18n="landing.pricing.title">Simple, Transparent Pricing</h2>
    </div>
    <div class="pricing-toggle">
      <span data-i18n="landing.pricing.monthly">Monthly</span>
      <input type="checkbox" id="billing-toggle" checked style="accent-color: var(--primary);">
      <span data-i18n="landing.pricing.yearly">Yearly</span>
      <span style="color:#10b981; font-size:0.875rem;" data-i18n="landing.pricing.save">20% off</span>
    </div>
    
    <div class="pricing-grid">
      <div class="pricing-card">
        <h3 data-i18n="landing.pricing.basic">Basic</h3>
        <div class="price">€15<span>/mo</span></div>
        <p data-i18n="landing.pricing.basic_desc" style="color:var(--primary); font-weight:bold; margin-bottom: 1rem;">1 display</p>
        <ul class="features-list">
          <li data-i18n="landing.pricing.basic_f1">Unlimited content</li>
          <li data-i18n="landing.pricing.basic_f2">Standard support</li>
        </ul>
        <button class="btn btn-secondary" style="width:100%" data-i18n="landing.pricing.cta">Choose Plan</button>
      </div>
      <div class="pricing-card popular">
        <div class="popular-badge">MOST POPULAR</div>
        <h3 data-i18n="landing.pricing.standard">Standard</h3>
        <div class="price">€50<span>/mo</span></div>
        <p data-i18n="landing.pricing.standard_desc" style="color:var(--secondary); font-weight:bold; margin-bottom: 1rem;">Up to 5 displays</p>
        <ul class="features-list">
          <li data-i18n="landing.pricing.standard_f1">Unlimited content</li>
          <li data-i18n="landing.pricing.standard_f2">Priority support</li>
          <li data-i18n="landing.pricing.standard_f3">Custom Dashboard Logo</li>
          <li data-i18n="landing.pricing.standard_f4">Team Members</li>
        </ul>
        <button class="btn btn-primary" style="width:100%" data-i18n="landing.pricing.cta_popular">Start 14-day Trial</button>
      </div>
      <div class="pricing-card">
        <h3 data-i18n="landing.pricing.premium">Premium</h3>
        <div class="price">€100<span>/mo</span></div>
        <p data-i18n="landing.pricing.premium_desc" style="color:var(--text); font-weight:bold; margin-bottom: 1rem;">Up to 15 displays</p>
        <ul class="features-list">
          <li data-i18n="landing.pricing.premium_f1">Unlimited content</li>
          <li data-i18n="landing.pricing.premium_f2">Priority support</li>
          <li data-i18n="landing.pricing.premium_f3">Whitelabel</li>
          <li data-i18n="landing.pricing.premium_f4">Dedicated Manager</li>
        </ul>
        <button class="btn btn-secondary" style="width:100%" data-i18n="landing.pricing.cta">Choose Plan</button>
      </div>
    </div>
  </div>

  <div class="cta-banner">
    <div>
      <h2 data-i18n="landing.footer.title">Ready to transform your displays?</h2>
      <p data-i18n="landing.footer.desc">Join thousands of users who trust SwiftDisplay to manage their screens. Get started today with no credit card required.</p>
      <div style="display:flex; gap:1rem;">
        <button class="btn btn-secondary" data-i18n="landing.footer.cta">Create free account</button>
        <button class="btn btn-secondary" data-i18n="landing.footer.sales">Talk to Sales</button>
      </div>
    </div>
    <div>
      <img src="/assets/swiftdisplaylogo.png" alt="SwiftDisplay" style="height:64px; opacity:0.8;">
    </div>
  </div>

  <footer>
    <div class="footer-links">
      <a href="#">SwiftDisplay</a>
      <a href="#">SwiftShare</a>
      <a href="#">SwiftAnyCast</a>
      <a href="#">SwiftMail</a>
    </div>
    <div style="margin-top: 1rem;">
      <img src="/assets/swiftdisplaylogo.png" style="height:24px; vertical-align:middle;">
      <span>© 2026 SwiftDisplay, Inc. All rights reserved.</span>
    </div>
  </footer>

  <script type="module">
    import { setLanguage, t, getLanguage } from '/js/i18n.js';
    
    function translateStaticDom() {
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
      });
      document.querySelectorAll('[data-i18n-html]').forEach((el) => {
        el.innerHTML = t(el.getAttribute('data-i18n-html'));
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
      });
    }

    const langSelector = document.getElementById('lang-selector');
    langSelector.value = getLanguage();
    
    langSelector.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });

    window.addEventListener('language-changed', () => {
      translateStaticDom();
    });

    translateStaticDom();

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('screentinker_theme', next);
    });
    
    const savedTheme = localStorage.getItem('screentinker_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  </script>
</body>
</html>
"""

with open('frontend/landing.html', 'w') as f:
    f.write(html_content)
