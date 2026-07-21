# WOSOL x ALTANFEETHI Operating Partnership

مشروع Next.js محلي يعرض ملف:

`Strategic Tech-Enabled Operating Partnership (1).docx`

كصفحة تنفيذية عربية RTL بنظام تصميم WOSOL Strategy Hub.

## التشغيل المحلي

```bash
pnpm install
pnpm dev
```

الرابط المحلي الافتراضي:

```text
http://localhost:3000
```

## التحقق

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## البناء للإنتاج

```bash
pnpm build
pnpm start
```

## الرفع لاحقًا

المشروع جاهز للرفع إلى GitHub وربطه في Vercel كمشروع Next.js عادي.

إعدادات Vercel المقترحة:

- Framework Preset: `Next.js`
- Install Command: `pnpm install`
- Build Command: `pnpm build`
- Output Directory: اتركها فارغة

## مصدر المحتوى

تم استخراج النصوص والجداول آليًا من ملف Word إلى:

`app/documentContent.json`

لا تعدّل النصوص يدويًا داخل الواجهة. إذا تغير ملف Word، أعد توليد ملف البيانات من المصدر ثم شغّل الاختبارات.
