import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back
          </Link>
          <h1 className="text-xl font-bold">Terms of Service</h1>
        </header>

        <div className="prose prose-sm max-w-none space-y-4 text-gray-700">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using this application, you accept and agree to
              be bound by the terms and provisions of this agreement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              2. Use of Service
            </h2>
            <p>
              You agree to use this service only for lawful purposes and in
              accordance with these Terms. You are responsible for maintaining
              the security of your wallet and any associated credentials.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              3. Blockchain Transactions
            </h2>
            <p>
              All blockchain transactions are irreversible. You acknowledge that
              you are solely responsible for any transactions you initiate
              through this application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              4. No Warranties
            </h2>
            <p>
              This service is provided &quot;as is&quot; without any warranties,
              express or implied. We do not guarantee uninterrupted or
              error-free operation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              5. Limitation of Liability
            </h2>
            <p>
              We shall not be liable for any indirect, incidental, special, or
              consequential damages arising from your use of this application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              6. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. Continued
              use of the service after changes constitutes acceptance of the new
              terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">7. Contact</h2>
            <p>
              If you have any questions about these Terms, please contact us.
            </p>
          </section>
        </div>

        <footer className="pt-8 text-center text-sm text-gray-500">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </footer>
      </div>
    </main>
  );
}
