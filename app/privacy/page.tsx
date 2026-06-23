import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-nara-cream to-nara-mint/20 px-6 py-20 max-w-3xl mx-auto">
      <div className="glass-container p-10 shadow-lg space-y-8">
        <div>
          <Link href="/onboarding" className="text-[11px] font-black text-nara-hunter uppercase tracking-widest hover:opacity-70 transition-opacity">&larr; Back</Link>
          <h1 className="text-3xl font-black text-nara-text tracking-tight mt-4">Privacy Policy</h1>
          <p className="text-[10px] text-nara-muted font-bold uppercase tracking-widest mt-2">Effective Date: {new Date().toLocaleDateString('en-CA')}</p>
        </div>

        <section>
          <h2 className="text-lg font-black text-nara-text mb-2">1. Data Controller</h2>
          <p className="text-[13px] text-nara-muted leading-relaxed">
            [Your Company Name] acts as the Data Controller for all personal data processed through the NARA AI application.
            Contact: [your-email@example.com]
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-nara-text mb-2">2. Data Collected</h2>
          <p className="text-[13px] text-nara-muted leading-relaxed">
            We collect the following personal data for the purpose of generating personalized meal plans:
          </p>
          <ul className="text-[13px] text-nara-muted leading-relaxed list-disc pl-5 mt-2 space-y-1">
            <li>Name, email address, and user ID</li>
            <li>Gender, age, height, weight</li>
            <li>Activity level and dietary goals</li>
            <li>Province/location for regional recipe alignment</li>
            <li>Allergies and clinical conditions for safety filtering</li>
            <li>Generated meal plans and AI recommendations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-black text-nara-text mb-2">3. Purpose of Processing</h2>
          <p className="text-[13px] text-nara-muted leading-relaxed">
            Your data is processed solely for: (a) calculating personalized nutrition targets (TDEE, BMR, macros),
            (b) filtering recipes that match your dietary needs and allergies, (c) generating AI-powered meal plans,
            (d) improving recommendation accuracy through provincial food consumption data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-nara-text mb-2">4. Legal Basis (UU PDP Art. 5)</h2>
          <p className="text-[13px] text-nara-muted leading-relaxed">
            Processing is based on your explicit consent, obtained during onboarding. You have the right to withdraw
            consent at any time by deleting your account or contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-nara-text mb-2">5. Data Storage & Security</h2>
          <p className="text-[13px] text-nara-muted leading-relaxed">
            Biometric data is encrypted at rest using AES-GCM 256-bit encryption. Data transmitted between services
            uses TLS/HTTPS. We use Supabase (cloud database) for persistent storage and a server-side AI engine for
            recommendations. Local storage on your device is also encrypted.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-nara-text mb-2">6. Data Retention</h2>
          <p className="text-[13px] text-nara-muted leading-relaxed">
            Your data is retained until you request deletion. Meal plans are regenerated on each sync; historical
            plans are overwritten. See Section 8 for deletion procedures.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-nara-text mb-2">7. Your Rights (UU PDP Art. 5-16)</h2>
          <p className="text-[13px] text-nara-muted leading-relaxed">
            Under Indonesian UU PDP No. 27/2022, you have the right to:
          </p>
          <ul className="text-[13px] text-nara-muted leading-relaxed list-disc pl-5 mt-2 space-y-1">
            <li><strong>Access:</strong> Download your data via the Profile page</li>
            <li><strong>Rectification:</strong> Edit your profile anytime</li>
            <li><strong>Erasure:</strong> Delete your account via the Profile page</li>
            <li><strong>Data Portability:</strong> Export your data as JSON</li>
            <li><strong>Withdraw Consent:</strong> Stop using the application at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-black text-nara-text mb-2">8. Data Deletion</h2>
          <p className="text-[13px] text-nara-muted leading-relaxed">
            To delete your account and all associated data: go to Profile &rarr; {"\"Delete Account & All Data\""}.
            This removes your profile, biometrics, and meal plans from our servers. Local storage is also cleared.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-black text-nara-text mb-2">9. Contact</h2>
          <p className="text-[13px] text-nara-muted leading-relaxed">
            For privacy inquiries or to exercise your rights, contact: [your-email@example.com]
          </p>
        </section>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-[10px] text-nara-muted font-bold uppercase tracking-widest text-center">
            NARA AI &mdash; UU PDP No. 27/2022 Compliant
          </p>
        </div>
      </div>
    </main>
  );
}
