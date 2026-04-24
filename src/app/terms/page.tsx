"use client";

import Link from "next/link";
import { ArrowLeftIcon, CheckIcon } from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold">Terms of Service</h1>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ReleaseFlow Terms of Service
              </CardTitle>
              <CardDescription>Last updated: January 2026</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-2">1. Acceptance of Terms</h3>
                <p className="text-gray-600">
                  By accessing and using ReleaseFlow, you accept and agree to be bound by the terms and provisions of this agreement.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">2. Description of Service</h3>
                <p className="text-gray-600">
                  ReleaseFlow is a changelog generation tool that automatically creates release notes from GitHub commits.
                  We provide the following service tiers:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mt-2">
                  <li><strong>Free</strong>: Up to 3 repositories</li>
                  <li><strong>Pro ($9/month)</strong>: Unlimited repositories, advanced features</li>
                  <li><strong>Team ($29/month)</strong>: Team collaboration, priority support</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">3. User Responsibilities</h3>
                <p className="text-gray-600">
                  As a user, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mt-2">
                  <li>Provide accurate information</li>
                  <li>Maintain the security of your account</li>
                  <li>Use the service in compliance with GitHub's Terms of Service</li>
                  <li>Not use the service for any illegal purpose</li>
                  <li>Not attempt to circumvent rate limits</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">4. Intellectual Property</h3>
                <p className="text-gray-600">
                  <strong>Your content:</strong> You retain full ownership of all content you submit to ReleaseFlow.
                  <br />
                  <strong>Our content:</strong> The service, including our algorithms and UI, are proprietary to ReleaseFlow.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">5. Payment Terms</h3>
                <p className="text-gray-600">
                  Paid plans are billed monthly. You can cancel anytime.
                  Refunds are available within 14 days of purchase for annual plans.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">6. Disclaimer of Warranties</h3>
                <p className="text-gray-600">
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND.
                  WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">7. Limitation of Liability</h3>
                <p className="text-gray-600">
                  ReleaseFlow shall not be liable for any indirect, incidental, special, or consequential damages.
                  Our total liability shall not exceed the amount you paid for the service in the past 12 months.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">8. Termination</h3>
                <p className="text-gray-600">
                  Either party may terminate this agreement at any time.
                  Upon termination, your access to the service will be immediately revoked.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">9. Governing Law</h3>
                <p className="text-gray-600">
                  These terms shall be governed by the laws of Turkey, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-2">10. Contact Information</h3>
                <div className="mt-2 p-4 bg-gray-100 rounded-lg">
                  <p><strong>Email</strong>: support@releaseflow.app</p>
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