import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 sm:px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-5">
        <span className="w-4 h-4 rounded-full bg-accent inline-block" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
        Error 404
      </p>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight mb-2">
        Page not found
      </h1>
      <p className="text-sm text-text-muted max-w-sm mb-6 leading-relaxed">
        The page you are looking for doesn&apos;t exist, has been removed, or was
        mistyped.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-accent hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
        >
          Go to dashboard
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 bg-surface hover:bg-background border border-border text-text-primary font-semibold text-sm rounded-xl transition-colors"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
