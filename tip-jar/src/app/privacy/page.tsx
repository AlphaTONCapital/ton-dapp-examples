import Link from 'next/link';

export default function PrivacyPage() {
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
          <h1 className="text-xl font-bold">Privacy Policy</h1>
        </header>

        <div className="prose prose-sm max-w-none space-y-4 text-gray-700">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              1. Information We Collect
            </h2>
            <p>
              We collect minimal information necessary to provide our service:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Wallet addresses you connect to the application</li>
              <li>Telegram user information when using within Telegram</li>
              <li>Transaction data initiated through our application</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              2. How We Use Your Information
            </h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Provide and maintain our service</li>
              <li>Process your transactions on the blockchain</li>
              <li>Authenticate your identity within Telegram</li>
              <li>Improve our application</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              3. Blockchain Data
            </h2>
            <p>
              Please note that blockchain transactions are public by nature.
              Your wallet address and transaction history are visible on the
              public blockchain and cannot be deleted or modified.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              4. Data Storage
            </h2>
            <p>
              We do not store your private keys or sensitive wallet information.
              Connection to your wallet is handled securely through TON Connect
              protocol.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              5. Third-Party Services
            </h2>
            <p>
              Our application integrates with third-party services including:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>TON Blockchain network</li>
              <li>Telegram Mini Apps platform</li>
              <li>TON Connect wallet providers</li>
            </ul>
            <p>
              These services have their own privacy policies that govern their
              use of your data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              6. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Disconnect your wallet at any time</li>
              <li>Request information about data we hold</li>
              <li>Request deletion of off-chain data we store</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. We will
              notify you of any changes by posting the new policy on this page.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">8. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us.
            </p>
          </section>
        </div>

        <footer className="pt-8 text-center text-sm text-gray-500">
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </footer>
      </div>
    </main>
  );
}
