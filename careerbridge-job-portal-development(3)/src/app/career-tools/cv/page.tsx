import { eq } from "drizzle-orm";
import { CvEditor } from "@/components/cv-editor";
import { DemoNotice, PageContainer, PageHeader } from "@/components/page-shell";
import { Badge } from "@/components/ui";
import { db } from "@/db";
import { cvDocuments } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "CV Writing & Editing Hub",
  description:
    "A classic CV builder: choose a template, fill in simple forms, reorder sections, preview live and export a print-ready PDF. No AI-generated text.",
};

export default async function CvHubPage() {
  const session = await getSessionUser();
  let savedDocument: { title?: string | null; template?: string | null; content: unknown } | null = null;

  if (session) {
    try {
      const [row] = await db
        .select({ title: cvDocuments.title, template: cvDocuments.template, content: cvDocuments.content })
        .from(cvDocuments)
        .where(eq(cvDocuments.userId, session.id))
        .limit(1);
      if (row) savedDocument = row;
    } catch {
      savedDocument = null;
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Career tools"
        title="CV Writing & Editing Hub"
        description="Write your CV in plain forms, watch the page update, and export it as a proper PDF with your browser's print dialog. Everything you type is yours — this tool does not use AI and it will not rewrite a single sentence for you."
        aside={
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">4 templates</Badge>
            <Badge tone="neutral">PDF export</Badge>
            <Badge tone="success">{session ? "Saves to your account" : "Browser draft mode"}</Badge>
          </div>
        }
      />
      <PageContainer className="py-8 sm:py-10">
        {!session ? (
          <DemoNotice className="mb-6">
            You are not signed in, so this CV is kept in this browser only.{" "}
            <a href="/auth/signin?next=/career-tools/cv" className="font-semibold text-brand-600 hover:underline">
              Sign in
            </a>{" "}
            to store it on your account and attach it to applications.
          </DemoNotice>
        ) : null}
        <CvEditor signedIn={Boolean(session)} savedDocument={savedDocument} />
      </PageContainer>
    </>
  );
}
