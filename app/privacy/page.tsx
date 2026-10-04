import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Privacy Policy — MONOGRAM',
  description: 'Privacy Policy for the MONOGRAM school directory platform.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-background py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: '#663f30' }}>Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-8">Last updated: October 2026</p>

          <div className="prose prose-sm max-w-none space-y-6 text-foreground">
            <section>
              <p>
                MONOGRAM (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the MONOGRAM school directory
                platform for Trinidad &amp; Tobago (the &quot;Service&quot;). This Privacy Policy explains what
                information we collect, how we use it, and the choices you have.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold mt-6 mb-2" style={{ color: '#663f30' }}>Information We Collect</h2>
              <p className="font-medium mt-3">Account Information</p>
              <p>When you create an account, we collect your email address, a username, and a password (stored securely as a one-way hash — we never store your password in plain text). If you choose to sign in with Google, we receive your name and email address from Google to create your account; we never receive your Google password.</p>

              <p className="font-medium mt-3">Content You Provide</p>
              <p>If you post a listing, past paper, e-book, or supplier profile, we collect the information you choose to include, such as titles, descriptions, prices, uploaded files or photos, and contact details (phone number, email, or WhatsApp number) that you provide for buyers to reach you.</p>

              <p className="font-medium mt-3">Messages</p>
              <p>If you use our messaging feature to contact another user, we store the messages you send so that both participants in a conversation can view the conversation history. If a user reports a message or another user, our team may review the reported message and the conversation context to decide what action to take.</p>

              <p className="font-medium mt-3">Usage Information</p>
              <p>We automatically collect basic usage data, such as which school pages are viewed, to power features like view counts and recently-viewed schools.</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold mt-6 mb-2" style={{ color: '#663f30' }}>How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To create and manage your account</li>
                <li>To let you post, browse, and respond to listings, past papers, e-books, and supplier profiles</li>
                <li>To deliver messages between users who choose to contact each other</li>
                <li>To send notifications about activity relevant to you (such as a new message or a listing status update)</li>
                <li>To review and moderate submitted content before it becomes publicly visible</li>
                <li>To maintain the security and proper functioning of the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold mt-6 mb-2" style={{ color: '#663f30' }}>Sharing of Information</h2>
              <p>
                We do not sell your personal information. Contact details you choose to add to a listing
                (such as a phone number or WhatsApp number) are shown publicly to other users so they can
                reach you about that listing — only include details you&apos;re comfortable sharing. Messages
                you send are visible only to you and the recipient. We may disclose information if required
                by law or to protect the safety and integrity of the platform.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold mt-6 mb-2" style={{ color: '#663f30' }}>Data Storage</h2>
              <p>
                Your information, including uploaded files and photos, is stored using secure third-party
                infrastructure providers (including Supabase and Vercel). We take reasonable measures to
                protect your data but no method of transmission or storage is completely secure.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold mt-6 mb-2" style={{ color: '#663f30' }}>Your Choices</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You can edit or remove listings, past papers, or e-books you&apos;ve submitted</li>
                <li>You can delete a conversation from your inbox at any time</li>
                <li>
                  You can delete your account and its data at any time from Settings, or request deletion without signing in.
                  See <a href="/delete-account" className="underline">how to delete your account</a>
                </li>
                <li>You can download a copy of your data from Settings</li>
                <li>You can report a user or a message, and block a user, from any conversation</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold mt-6 mb-2" style={{ color: '#663f30' }}>Children&apos;s Privacy</h2>
              <p>
                The Service is intended for general audiences and is not directed at children under 13.
                We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold mt-6 mb-2" style={{ color: '#663f30' }}>Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page
                with an updated &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold mt-6 mb-2" style={{ color: '#663f30' }}>Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or how your data is handled, or if you want
                to request account deletion or report a safety concern, email us at{' '}
                <a href="mailto:khaliff@email.com" className="underline">khaliff@email.com</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
