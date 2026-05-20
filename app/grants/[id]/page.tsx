import { notFound } from "next/navigation";
import { GRANTS } from "@/lib/data";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GrantPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return GRANTS.map((grant) => ({
    id: grant.id.toString(),
  }));
}

export default async function GrantPage({ params }: GrantPageProps) {
  const { id } = await params;
  const grant = GRANTS.find((g) => g.id.toString() === id);

  if (!grant) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl p-6 min-h-[calc(100vh-3.5rem)]">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "mb-5 h-auto p-0 text-xs text-muted-foreground hover:bg-transparent hover:text-stellar-black dark:text-stellar-gray/70 dark:hover:text-stellar-yellow inline-flex items-center gap-1.5 transition-colors duration-200"
        )}
      >
        <ArrowLeftIcon className="h-3 w-3 transition-transform duration-200 hover:-translate-x-0.5" /> Browse opportunities
      </Link>
      
      <div className="mb-6 flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-[13px] font-bold text-white shadow-sm"
          style={{ background: grant.bg }}
        >
          {grant.initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{grant.title}</h1>
          <p className="text-sm font-medium text-muted-foreground">{grant.org}</p>
        </div>
      </div>
      
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <span className="text-sm font-medium text-muted-foreground">Grant Pool</span>
          <p className="text-3xl font-bold text-stellar-teal">{grant.prize}</p>
        </div>
        
        <p className="text-sm text-foreground/90 leading-relaxed mb-6">
          This is a grant program offered by {grant.org}. We are looking for high-impact teams to build on the Stellar network. Apply now to secure funding and dedicated support for your project.
        </p>
        
        <div className="flex gap-3">
          <button className="rounded-md bg-stellar-teal px-4 py-2 text-sm font-semibold text-white hover:bg-stellar-teal/90 transition-colors">
            Apply for Grant
          </button>
        </div>
      </div>
    </div>
  );
}
