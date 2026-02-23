import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const PrivacyPolicyPage = () => {
  const lastUpdated = "February 4, 2026";
  const companyName = "Kainuo Innovision Tech Co., Limited";
  const contactEmail = "support@custlycrm.com";

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
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              {companyName} ("we", "our", or "us") operates Custly CRM (the "Service"). 
              This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our Service.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, and password when you register</li>
              <li><strong>Profile Information:</strong> Avatar, company name, and preferences</li>
              <li><strong>CRM Data:</strong> Contacts, companies, deals, notes, and other business data you input</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through Stripe</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <ul>
              <li><strong>Usage Data:</strong> Pages visited, features used, and time spent</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
              <li><strong>Log Data:</strong> IP address, access times, and error logs</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve the Service</li>
              <li>Process transactions and send related information</li>
              <li>Send administrative messages and updates</li>
              <li>Respond to your comments, questions, and support requests</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
            </ul>

            <h2>4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption. We use 
              PocketBase for data storage and Stripe for payment processing. Both services 
              employ robust security measures to protect your information.
            </p>
            <p>
              While we strive to protect your personal information, no method of transmission 
              over the Internet is 100% secure. We cannot guarantee absolute security.
            </p>

            <h2>5. Data Sharing and Disclosure</h2>
            <p>We do not sell, trade, or rent your personal information. We may share your data with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Third parties that help us operate the Service (e.g., Stripe for payments)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>

            <h2>6. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Export your CRM data in standard formats</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>

            <h2>7. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide 
              the Service. Upon account deletion, we will delete or anonymize your data within 
              30 days, except where retention is required by law.
            </p>

            <h2>8. Cookies and Tracking</h2>
            <p>
              We use essential cookies to maintain your session and preferences. We do not use 
              third-party tracking cookies for advertising purposes.
            </p>

            <h2>9. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place for such transfers.
            </p>

            <h2>10. Children's Privacy</h2>
            <p>
              The Service is not intended for individuals under 16 years of age. We do not 
              knowingly collect personal information from children.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:{" "}
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

export default PrivacyPolicyPage;
