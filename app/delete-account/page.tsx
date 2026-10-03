import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Delete Your Account — MONOGRAM',
  description: 'How to delete your MONOGRAM account and what data is removed.',
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-background py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#663f30' }}>Delete Your MONOGRAM Account</h1>
          <p className="text-sm text-muted-foreground mb-8">MONOGRAM (monogramtt.com) — Last updated: October 2026</p>

          <div className="prose prose-sm max-w-none space-y-6 text-foreground">
            <section>
              <p>
                You can delete your MONOGRAM account and its associated data at any time. This page explains
                how to do it, what is deleted, and what to do if you cannot sign in.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold mt-6 mb-2" style={{ color: '#663f30' }}>Option 1: Delete your account yourself</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Sign in to MONOGRAM on the website or in the app.</li>
                <li>Open <strong>Settings</strong> from the top navigation bar.</li>
                <li>Scroll to <strong>Privacy &amp; Security</strong> and find <strong>Account Actions</strong>.</li>
                <li>Tap <strong>Delete Account</strong>, then confirm with <strong>Permanently Delete</strong>.</li>
              </ol>
              <p className="mt-3">
                Before deleting, you can use <strong>Download My Data</strong> in the same section to save a copy of your information.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold mt-6 mb-2" style={{ color: '#663f30' }}>Option 2: Request deletion by email</h2>
              <p>
                If you cannot sign in, email us from the address registered to your account at{' '}
                <a href="mailto:khaliff@email.com?subject=MONOGRAM%20account%20deletion%20request" className="underline" style={{ color: '#663f30' }}>khaliff@email.com</a>{' '}
                with the subject &quot;MONOGRAM account deletion request&quot; and include your username. We will
                verify the request and delete your account.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold mt-6 mb-2" style={{ color: '#663f30' }}>What is deleted</h2>
              <p>Deleting your account is permanent and cannot be undone. The following is removed:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your account details (email address, username, password hash, profile information, and any phone, WhatsApp, location or bio you added)</li>
                <li>Your listings and e-books</li>
                <li>Your favourites and recently viewed schools</li>
                <li>Your messages and conversations</li>
                <li>Your notifications and saved settings</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold mt-6 mb-2" style={{ color: '#663f30' }}>What is kept</h2>
              <p>
                Past papers you uploaded to the shared study library remain available to other students, but
                they are no longer linked to your account or username. We do not keep a copy of the rest of your
                account data after deletion, and messages are removed along with the conversation. Infrastructure
                providers may retain routine backups for a short period under their own schedules, after which
                the data is overwritten.
              </p>
            </section>

            <section>
              <p>
                For more on how we handle your information, see our{' '}
                <a href="/privacy" className="underline" style={{ color: '#663f30' }}>Privacy Policy</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
