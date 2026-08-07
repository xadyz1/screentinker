import re

def append_to_i18n(filepath, new_content):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the last closing brace
    last_brace_index = content.rfind('};')
    
    if last_brace_index != -1:
        updated_content = content[:last_brace_index] + new_content + content[last_brace_index:]
        with open(filepath, 'w') as f:
            f.write(updated_content)
        print(f"Updated {filepath}")
    else:
        print(f"Could not find '}};' in {filepath}")

en_new = """
  // Landing Page Overhaul
  'landing.nav.home': 'Home',
  'landing.nav.portable_tv': 'Portable TV',
  'landing.nav.api_docs': 'API + Docs',
  'landing.nav.blog': 'Blog',
  'landing.nav.contact': 'Contact',
  'landing.nav.login': 'Login',

  'landing.hero.title_part1': 'Communicate with ',
  'landing.hero.title_part2': 'Impact',
  'landing.hero.subtitle': 'Deliver your messages to digital screens instantly from the cloud or self-hosted in your network. Engage your audience in minutes.',
  'landing.hero.cta': 'Start Your Free Trial',

  'landing.industry.title': 'Tailored for your industry',
  'landing.industry.subtitle': 'Flexible solutions for diverse environments.',
  'landing.industry.healthcare': 'Healthcare',
  'landing.industry.healthcare_desc': 'Enhance patient experiences, reduce wait times, and improve clinic flow.',
  'landing.industry.education': 'Education',
  'landing.industry.education_desc': 'Keep students informed with real-time news, schedules, and alerts.',
  'landing.industry.retail': 'Retail & Dining',
  'landing.industry.retail_desc': 'Captivate shoppers and diners with vibrant menus and promotions.',

  'landing.anywhere.title': 'WORKS ANYWHERE',
  'landing.anywhere.subtitle': 'Turn any screen into a display.',
  'landing.anywhere.browser': 'Any browser',
  'landing.anywhere.browser_desc': 'Chrome, Firefox, Safari, Edge, WebOS.',
  'landing.anywhere.smartphones': 'Smartphones',
  'landing.anywhere.smartphones_desc': 'iPhone & Android Mobile.',
  'landing.anywhere.smart_tvs': 'Smart TVs',
  'landing.anywhere.smart_tvs_desc': 'LG WebOS, Samsung Tizen OS, Roku.',
  'landing.anywhere.android_tvs': 'Android TVs',
  'landing.anywhere.android_tvs_desc': 'Sony, TCL, Hisense.',

  'landing.customization.title': 'CUSTOMIZATION OPTIONS',
  'landing.customization.subtitle': 'Your displays, totally adapted to your brand & business.',
  'landing.customization.custom_domains': 'Custom Domains',
  'landing.customization.custom_domains_desc': 'Bring your domain for your display URLs.',
  'landing.customization.whitelabel': 'Whitelabel UX',
  'landing.customization.whitelabel_desc': 'Complete whitelabel solutions for agencies.',
  'landing.customization.multi_org': 'Multi-organization',
  'landing.customization.multi_org_desc': 'Manage multiple clients from a single login.',
  'landing.customization.plugins': 'Plugins',
  'landing.customization.plugins_desc': 'Connect integrations and data sources.',
  'landing.customization.roles': 'Roles',
  'landing.customization.roles_desc': 'Fine-grained RBAC access control.',
  'landing.customization.branding': 'Branding Workspace',
  'landing.customization.branding_desc': 'Custom colors and logos per org.',
  'landing.customization.premium': 'Premium Support',
  'landing.customization.premium_desc': 'Highest priority technical support.',
  'landing.customization.custom_apps': 'Custom Apps',
  'landing.customization.custom_apps_desc': 'We build custom integrations just for you.',
  'landing.customization.on_premise': 'On-Premise',
  'landing.customization.on_premise_desc': 'Self-host the software in your own server.',

  'landing.portable.badge': 'NEW PRODUCT!',
  'landing.portable.title': 'Go Mobile with Portable TV',
  'landing.portable.desc': 'Our SwiftDisplay standalone Portable TV is battery-powered, meaning you can easily move it wherever it is needed to bring your content to life anywhere.',
  'landing.portable.battery': '10h Battery life',
  'landing.portable.trolley': 'Built-in trolley',
  'landing.portable.touch': 'Lightweight Rubber Screen',
  'landing.portable.cta': 'Learn More',

  'landing.pricing.title': 'Simple, Transparent Pricing',
  'landing.pricing.yearly': 'Yearly',
  'landing.pricing.monthly': 'Monthly',
  'landing.pricing.save': '20% off',
  'landing.pricing.basic': 'Basic',
  'landing.pricing.standard': 'Standard',
  'landing.pricing.premium': 'Premium',
  'landing.pricing.basic_desc': '1 display',
  'landing.pricing.basic_f1': 'Unlimited content',
  'landing.pricing.basic_f2': 'Standard support',
  'landing.pricing.standard_desc': 'Up to 5 displays',
  'landing.pricing.standard_f1': 'Unlimited content',
  'landing.pricing.standard_f2': 'Priority support',
  'landing.pricing.standard_f3': 'Custom Dashboard Logo',
  'landing.pricing.standard_f4': 'Team Members',
  'landing.pricing.premium_desc': 'Up to 15 displays',
  'landing.pricing.premium_f1': 'Unlimited content',
  'landing.pricing.premium_f2': 'Priority support',
  'landing.pricing.premium_f3': 'Whitelabel',
  'landing.pricing.premium_f4': 'Dedicated Manager',
  'landing.pricing.cta': 'Choose Plan',
  'landing.pricing.cta_popular': 'Start 14-day Trial',

  'landing.footer.title': 'Ready to transform your displays?',
  'landing.footer.desc': 'Join thousands of users who trust SwiftDisplay to manage their screens. Get started today with no credit card required.',
  'landing.footer.cta': 'Create free account',
  'landing.footer.sales': 'Talk to Sales',
"""

pt_new = """
  // Landing Page Overhaul
  'landing.nav.home': 'Início',
  'landing.nav.portable_tv': 'TV Portátil',
  'landing.nav.api_docs': 'API + Docs',
  'landing.nav.blog': 'Blog',
  'landing.nav.contact': 'Contato',
  'landing.nav.login': 'Entrar',

  'landing.hero.title_part1': 'Comunique-se com ',
  'landing.hero.title_part2': 'Impacto',
  'landing.hero.subtitle': 'Entregue suas mensagens para telas digitais instantaneamente da nuvem ou auto-hospedado na sua rede. Engaje seu público em minutos.',
  'landing.hero.cta': 'Inicie seu Teste Grátis',

  'landing.industry.title': 'Feito para o seu setor',
  'landing.industry.subtitle': 'Soluções flexíveis para diversos ambientes.',
  'landing.industry.healthcare': 'Saúde',
  'landing.industry.healthcare_desc': 'Melhore a experiência dos pacientes, reduza o tempo de espera e otimize o fluxo.',
  'landing.industry.education': 'Educação',
  'landing.industry.education_desc': 'Mantenha os alunos informados com notícias, horários e alertas em tempo real.',
  'landing.industry.retail': 'Varejo e Restaurantes',
  'landing.industry.retail_desc': 'Cative clientes com menus vibrantes e promoções.',

  'landing.anywhere.title': 'FUNCIONA EM QUALQUER LUGAR',
  'landing.anywhere.subtitle': 'Transforme qualquer tela em um display.',
  'landing.anywhere.browser': 'Qualquer navegador',
  'landing.anywhere.browser_desc': 'Chrome, Firefox, Safari, Edge, WebOS.',
  'landing.anywhere.smartphones': 'Smartphones',
  'landing.anywhere.smartphones_desc': 'iPhone e Android Mobile.',
  'landing.anywhere.smart_tvs': 'Smart TVs',
  'landing.anywhere.smart_tvs_desc': 'LG WebOS, Samsung Tizen OS, Roku.',
  'landing.anywhere.android_tvs': 'Android TVs',
  'landing.anywhere.android_tvs_desc': 'Sony, TCL, Hisense.',

  'landing.customization.title': 'OPÇÕES DE CUSTOMIZAÇÃO',
  'landing.customization.subtitle': 'Suas telas, totalmente adaptadas à sua marca e negócio.',
  'landing.customization.custom_domains': 'Domínios Customizados',
  'landing.customization.custom_domains_desc': 'Traga seu domínio para as URLs dos seus displays.',
  'landing.customization.whitelabel': 'UX Whitelabel',
  'landing.customization.whitelabel_desc': 'Soluções whitelabel completas para agências.',
  'landing.customization.multi_org': 'Multi-organização',
  'landing.customization.multi_org_desc': 'Gerencie múltiplos clientes a partir de um único login.',
  'landing.customization.plugins': 'Plugins',
  'landing.customization.plugins_desc': 'Conecte integrações e fontes de dados.',
  'landing.customization.roles': 'Funções (Roles)',
  'landing.customization.roles_desc': 'Controle de acesso refinado (RBAC).',
  'landing.customization.branding': 'Workspace de Marca',
  'landing.customization.branding_desc': 'Cores e logos customizados por organização.',
  'landing.customization.premium': 'Suporte Premium',
  'landing.customization.premium_desc': 'Suporte técnico com prioridade máxima.',
  'landing.customization.custom_apps': 'Apps Customizados',
  'landing.customization.custom_apps_desc': 'Construímos integrações sob medida para você.',
  'landing.customization.on_premise': 'On-Premise',
  'landing.customization.on_premise_desc': 'Auto-hospede o software no seu próprio servidor.',

  'landing.portable.badge': 'NOVO PRODUTO!',
  'landing.portable.title': 'Torne-se Móvel com a TV Portátil',
  'landing.portable.desc': 'Nossa TV Portátil autônoma SwiftDisplay é alimentada por bateria, o que significa que você pode movê-la facilmente para onde for necessário.',
  'landing.portable.battery': '10h de Duração de Bateria',
  'landing.portable.trolley': 'Carrinho embutido',
  'landing.portable.touch': 'Tela de Borracha Leve',
  'landing.portable.cta': 'Saiba Mais',

  'landing.pricing.title': 'Preços Simples e Transparentes',
  'landing.pricing.yearly': 'Anual',
  'landing.pricing.monthly': 'Mensal',
  'landing.pricing.save': '20% off',
  'landing.pricing.basic': 'Básico',
  'landing.pricing.standard': 'Padrão',
  'landing.pricing.premium': 'Premium',
  'landing.pricing.basic_desc': '1 display',
  'landing.pricing.basic_f1': 'Conteúdo ilimitado',
  'landing.pricing.basic_f2': 'Suporte padrão',
  'landing.pricing.standard_desc': 'Até 5 displays',
  'landing.pricing.standard_f1': 'Conteúdo ilimitado',
  'landing.pricing.standard_f2': 'Suporte prioritário',
  'landing.pricing.standard_f3': 'Logo Personalizado',
  'landing.pricing.standard_f4': 'Membros da Equipe',
  'landing.pricing.premium_desc': 'Até 15 displays',
  'landing.pricing.premium_f1': 'Conteúdo ilimitado',
  'landing.pricing.premium_f2': 'Suporte prioritário',
  'landing.pricing.premium_f3': 'Whitelabel',
  'landing.pricing.premium_f4': 'Gerente Dedicado',
  'landing.pricing.cta': 'Escolher Plano',
  'landing.pricing.cta_popular': 'Iniciar Teste de 14 dias',

  'landing.footer.title': 'Pronto para transformar suas telas?',
  'landing.footer.desc': 'Junte-se a milhares de usuários que confiam na SwiftDisplay para gerenciar suas telas. Comece hoje, sem cartão de crédito.',
  'landing.footer.cta': 'Criar conta grátis',
  'landing.footer.sales': 'Falar com Vendas',
"""

append_to_i18n('frontend/js/i18n/en.js', en_new)
append_to_i18n('frontend/js/i18n/pt.js', pt_new)
