"use client";

import Link from "next/link";
import { ArrowLeftIcon, CheckIcon } from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ReleaseFlow Privacy Policy
              </CardTitle>
              <CardDescription>Last updated: January 2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-2">1. Information We Collect</h3>
                <p className="text-gray-600">
                  ReleaseFlow collects only the minimum information necessary to provide our service:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mt-2">
                  <li><strong>GitHub Account</strong>: We access your public GitHub data to generate changelogs</li>
                  <li><strong>Repository Data</strong>: Commit messages, tags, and release information</li>
                  <li><strong>Email Address</strong>: For account authentication and optional notifications</li>
                  <li><strong>Payment Information</strong>: Processed securely via Lemon Squeezy (we never see your card details)</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">2. How We Use Your Data</h3>
                <p className="text-gray-600">
                  Your data is used exclusively for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mt-2">
                  <li>Generating changelogs from your GitHub commits</li>
                  <li>Providing analytics and trends for your repositories</li>
                  <li>Sending email digests (only if you opt-in)</li>
                  <li>Processing payments for premium features</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">3. Data We DO NOT Collect</h3>
                <p className="text-gray-600">
                  We are committed to privacy. We do NOT collect:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mt-2">
                  <li>❌ Private repository contents (we only read public metadata)</li>
                  <li>❌ Your code or intellectual property</li>
                  <li>❌ Personal information beyond what's necessary</li>
                  <li>❌ Location data or device identifiers</li>
                  <li>❌ Data for advertising purposes</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">4. Data Sharing</h3>
                <p className="text-gray-600">
                  <strong>We never sell, trade, or rent your personal information.</strong> Your data is only shared with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mt-2">
                  <li><strong>GitHub API</strong>: To read your public repository data</li>
                  <li><strong>Lemon Squeezy</strong>: For payment processing only</li>
                  <li><strong>Supabase</strong>: For secure data storage (encrypted)</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">5. Data Security</h3>
                <p className="text-gray-600">
                  We implement industry-standard security measures including:
                  SSL/TLS encryption, secure database storage, and regular security audits.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">6. Your Rights</h3>
                <p className="text-gray-600">
                  Under GDPR and applicable privacy laws, you have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mt-2">
                  <li><strong>Access</strong>: Request a copy of your data</li>
                  <li><strong>Delete</strong>: Request deletion of your data</li>
                  <li><strong>Export</strong>: Export your data in machine-readable format</li>
                  <li><strong>Opt-out</strong>: Unsubscribe from emails at any time</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">7. Cookies</h3>
                <p className="text-gray-600">
                  We use minimal cookies - only essential session tokens for authentication.
                  No tracking cookies, no advertising cookies.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">8. Data Retention</h3>
                <p className="text-gray-600">
                  Your account data is retained while you use our service.
                  You can request deletion at any time - we will delete all personal data within 30 days.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">9. Children's Privacy</h3>
                <p className="text-gray-600">
                  Our service is not intended for children under 13.
                  We do not knowingly collect data from children.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">10. Changes to This Policy</h3>
                <p className="text-gray-600">
                  We will notify users of any material changes to this policy via email
                  at least 30 days before they take effect.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">11. Contact Us</h3>
                <p className="text-gray-600">
                  For privacy concerns or data requests, contact us at:
                </p>
                <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                  <p><strong>Email</strong>: privacy@releaseflow.app</p>
                  <p><strong>Website</strong>: releaseflow.app</p>
                </div>
              </section>

              <section className="border-t pt-6">
                <p className="text-sm text-gray-500">
                  © 2026 ReleaseFlow. All rights reserved.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}