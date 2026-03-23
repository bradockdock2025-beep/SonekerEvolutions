// ── Language configuration ────────────────────────────────────────────────────

export type Language = 'pt' | 'en' | 'fr' | 'de'

export interface LanguageConfig {
  code: Language
  flag: string
  nativeName: string
  locale: string
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'pt', flag: '🇵🇹', nativeName: 'PT', locale: 'pt-PT' },
  { code: 'en', flag: '🇺🇸', nativeName: 'EN', locale: 'en-US' },
  { code: 'fr', flag: '🇫🇷', nativeName: 'FR', locale: 'fr-FR' },
  { code: 'de', flag: '🇩🇪', nativeName: 'DE', locale: 'de-DE' },
]

// ── Flat translation type ─────────────────────────────────────────────────────

export interface Locale {
  // Landing
  land_headline_1: string
  land_headline_2: string
  land_headline_3: string
  land_sub: string
  land_placeholder: string
  land_analyze: string
  land_hint: string
  land_pill_ka_desc: string
  land_pill_dce_desc: string
  land_pill_kl_desc: string
  land_pill_ss_desc: string
  land_pill_km_desc: string
  land_pill_le_desc: string
  // Loading
  load_step1: string
  load_step2: string
  load_step3: string
  load_step4: string
  load_title: string
  load_title_error: string
  load_processing: string
  load_analyzing: string
  // Navigation
  nav_home: string
  nav_knowledge: string
  nav_library: string
  // Theme
  theme_title: string
  // Topbar
  topbar_library: string
  topbar_mindmap: string
  topbar_export: string
  topbar_toast_no_data: string
  topbar_toast_generating: string
  topbar_toast_exported: string
  topbar_toast_error: string
  // Filter
  filter_all: string
  filter_header: string
  filter_sections: string      // use {n}
  // Section labels
  sec_resumo: string
  sec_conceitual: string
  sec_tecnico: string
  sec_estrategico: string
  sec_analitico: string
  sec_contextual: string
  sec_pragmatico: string
  sec_reflexivo: string
  sec_citacoes: string
  sec_derivado: string
  sec_validacao: string
  sec_marketing: string
  sec_negocio: string
  sec_ferramentas: string
  sec_mentalidade: string
  sec_erros: string
  sec_playbook: string
  sec_contextos: string
  sec_vocabulario: string
  sec_conceitos: string
  sec_perguntas: string
  // Export bar
  exp_save: string
  exp_pdf: string
  exp_copy: string
  exp_notion: string
  exp_markdown: string
  exp_mindmap: string
  exp_toast_no_save: string
  exp_toast_saved: string
  exp_toast_save_error: string
  exp_toast_no_copy: string
  exp_toast_copied: string
  exp_toast_notion: string
  exp_toast_markdown: string
  exp_vocab_label: string
  // Smart selection
  sel_searching: string
  sel_found: string
  sel_close: string
  sel_add_map: string
  sel_not_found: string
  sel_toast_added: string
  // Deep search panel
  dsp_loading: string
  dsp_error: string
  dsp_points: string
  dsp_examples: string
  dsp_related: string
  // Library
  lib_title: string
  lib_new_video: string
  lib_new_short: string
  lib_loading: string
  lib_count_singular: string   // use {n}
  lib_count_plural: string     // use {n}
  lib_empty: string
  lib_first_video: string
  lib_extracted: string
  // Knowledge card
  card_explore: string
  card_add_map: string
  card_on_map: string
  card_toast_added: string     // use {badge}
  // Video player
  player_ai_active: string
  player_ai_extracted: string  // use {n}
  // App context
  app_err_analysis: string
  app_err_unknown: string
  app_concept_manual: string   // use {term}
  app_err_search: string
  // Date locale string
  date_locale: string
  // ── Landing page marketing sections ──────────────────────────────────────
  lp_powered_by: string       // Hero badge
  lp_trust_model: string      // Trust strip
  lp_trust_niches: string
  lp_trust_langs: string
  lp_trust_exports: string
  lp_cat_label: string        // Categories section headline
  lp_cat_desc: string         // Categories section subtitle
  lp_cat_concepts_d: string   // Category pill descriptions
  lp_cat_frameworks_d: string
  lp_cat_insights_d: string
  lp_cat_vocab_d: string
  lp_cat_ideas_d: string
  lp_how_label: string        // How it works section
  lp_how_step1_t: string
  lp_how_step1_d: string
  lp_how_step2_t: string
  lp_how_step2_d: string
  lp_how_step3_t: string
  lp_how_step3_d: string
  lp_feat_label: string       // Features section headline
  lp_feat_ka_d: string        // Feature card extended descriptions
  lp_feat_dce_d: string
  lp_feat_kl_d: string
  lp_feat_ss_d: string
  lp_feat_km_d: string
  lp_feat_le_d: string
  lp_cta_title: string        // Final CTA section
  lp_cta_sub: string
  // Nav CTA
  lp_nav_cta: string
  // Social proof
  lp_social_label: string
  // Pricing section
  lp_price_label: string
  lp_price_sub: string
  lp_price_free_name: string
  lp_price_free_tag: string
  lp_price_free_btn: string
  lp_price_pro_name: string
  lp_price_pro_tag: string
  lp_price_pro_btn: string
  // Auth pages
  auth_signin_title: string
  auth_signup_title: string
  auth_subtitle: string
  auth_signin_desc: string
  auth_signup_desc: string
  auth_email_label: string
  auth_email_hint: string
  auth_btn_get_code: string
  auth_no_account: string
  auth_create_account: string
  auth_has_account: string
  auth_login: string
  auth_otp_title: string
  auth_otp_subtitle: string
  auth_otp_desc: string
  auth_btn_verify: string
  auth_no_code: string
  auth_resend: string
  auth_resend_in: string
  auth_back: string
  auth_back_home: string
  auth_otp_error: string
}

// ── Section key → locale key map ─────────────────────────────────────────────

export const SECTION_TO_KEY: Record<string, keyof Locale> = {
  resumo:      'sec_resumo',
  conceitual:  'sec_conceitual',
  tecnico:     'sec_tecnico',
  estrategico: 'sec_estrategico',
  analitico:   'sec_analitico',
  contextual:  'sec_contextual',
  pragmatico:  'sec_pragmatico',
  reflexivo:   'sec_reflexivo',
  citacoes:    'sec_citacoes',
  derivado:    'sec_derivado',
  validacao:   'sec_validacao',
  marketing:   'sec_marketing',
  negocio:     'sec_negocio',
  ferramentas: 'sec_ferramentas',
  mentalidade: 'sec_mentalidade',
  erros:       'sec_erros',
  playbook:    'sec_playbook',
  contextos:   'sec_contextos',
  vocabulario: 'sec_vocabulario',
  conceitos:   'sec_conceitos',
  perguntas:   'sec_perguntas',
}
