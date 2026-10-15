"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAFA] text-[#171717] flex flex-col items-center justify-center p-6 text-center font-sans antialiased">
        <div className="max-w-md w-full bg-white border border-[#E5E5E5] rounded-2xl p-8 shadow-xs flex flex-col items-center">
          <span className="w-10 h-10 rounded-full bg-[#DC2626]/10 flex items-center justify-center mb-4">
            <span className="w-4 h-4 rounded-full bg-[#DC2626] inline-block" />
          </span>
          <h1 className="text-xl font-bold tracking-tight mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-[#737373] mb-6 leading-relaxed">
            A critical error occurred. Please try reloading the application.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
