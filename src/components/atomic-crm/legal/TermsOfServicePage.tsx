import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const TermsOfServicePage = () => {
  const lastUpdated = "February 4, 2026";
  const companyName = "Kainuo Innovision Tech Co., Limited";
  const contactEmail = "support@kainuotech.com";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using Custly CRM (the "Service") operated by {companyName} 
              ("we", "our", or "us"), you agree to be bound by these Terms of Service. 
              If you disagree with any part of the terms, you may not access the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Custly CRM is a customer relationship management platform that helps businesses 
              manage contacts, companies, deals, and sales pipelines. The Service includes 
              features such as contact management, deal tracking, activity logging, and reporting.
            </p>

            <h2>3. User Accounts</h2>
            <h3>3.1 Registration</h3>
            <p>
              To use the Service, you must create an account with accurate and complete information. 
              You are responsible for maintaining the confidentiality of your account credentials.
            </p>
            <h3>3.2 Account Security</h3>
            <p>
              You are responsible for all activities that occur under your account. Notify us 
              immediately of any unauthorized use or security breach.
            </p>

            <h2>4. Subscription and Payments</h2>
            <h3>4.1 Free Trial</h3>
            <p>
              We offer a 14-day free trial with full access to all features. No credit card 
              is required to start the trial.
            </p>
            <h3>4.2 Subscription Plans</h3>
            <ul>
              <li><strong>Monthly Plan:</strong> $20 per month, billed monthly</li>
              <li><strong>Yearly Plan:</strong> $168 per year, billed annually (30% savings)</li>
              <li><strong>Lifetime Plan:</strong> $399 one-time payment for perpetual access</li>
            </ul>
            <h3>4.3 Payment Processing</h3>
            <p>
              Payments are processed securely through Stripe. By providing payment information, 
              you authorize us to charge the applicable fees.
            </p>
            <h3>4.4 Refund Policy</h3>
            <p>
              We offer a 30-day money-back guarantee for all subscription plans. If you are 
              not satisfied with the Service, contact us within 30 days of your purchase for 
              a full refund. Lifetime plans are eligible for refund within 30 days of purchase.
            </p>
            <h3>4.5 Cancellation</h3>
            <p>
              You may cancel your subscription at any time through the billing portal. Upon 
              cancellation, you will retain access until the end of your current billing period.
            </p>

            <h2>5. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Transmit malware, viruses, or harmful code</li>
              <li>Engage in unauthorized data collection or scraping</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service's operation</li>
              <li>Store or transmit illegal or offensive content</li>
            </ul>

            <h2>6. Your Data</h2>
            <h3>6.1 Ownership</h3>
            <p>
              You retain all rights to the data you input into the Service. We do not claim 
              ownership of your CRM data.
            </p>
            <h3>6.2 Data Export</h3>
            <p>
              You may export your data at any time using the built-in export features.
            </p>
            <h3>6.3 Data Deletion</h3>
            <p>
              Upon account termination, we will delete your data within 30 days, unless 
              retention is required by law.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              The Service, including its design, features, and content, is owned by {companyName} 
              and protected by intellectual property laws. You may not copy, modify, distribute, 
              or create derivative works without our permission.
            </p>

            <h2>8. Third-Party Services</h2>
            <p>
              The Service may integrate with third-party services (e.g., OAuth providers, 
              payment processors). Your use of such services is subject to their respective 
              terms and policies.
            </p>

            <h2>9. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR 
              IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, 
              OR SECURE.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, {companyName.toUpperCase()} SHALL NOT BE 
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
              OR ANY LOSS OF PROFITS OR REVENUES.
            </p>
            <p>
              Our total liability for any claims arising from the Service shall not exceed 
              the amount you paid us in the twelve months preceding the claim.
            </p>

            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless {companyName} from any claims, damages, 
              or expenses arising from your use of the Service or violation of these Terms.
            </p>

            <h2>12. Modifications to Service</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue the Service at any time, 
              with or without notice. We will provide reasonable notice for significant changes.
            </p>

            <h2>13. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after 
              changes constitutes acceptance of the new Terms.
            </p>

            <h2>14. Governing Law</h2>
            <p>
              These Terms shall be governed by the laws of Hong Kong SAR, without regard to 
              conflict of law principles.
            </p>

            <h2>15. Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms or the Service shall be resolved through 
              binding arbitration in Hong Kong, except where prohibited by law.
            </p>

            <h2>16. Severability</h2>
            <p>
              If any provision of these Terms is found unenforceable, the remaining provisions 
              shall continue in full force and effect.
            </p>

            <h2>17. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at:{" "}
              <a href={`mailto:${contactEmail}`} className="text-primary hover:underline">
                {contactEmail}
              </a>
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <Link to="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <span className="mx-2">•</span>
          <Link to="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
