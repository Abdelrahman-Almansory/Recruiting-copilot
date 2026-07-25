"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteReportButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this report and its linked strategies? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/reports/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Unable to delete report");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      window.alert("Unable to delete the report. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex min-w-[120px] items-center justify-center rounded-full border border-rose-600 bg-rose-600/10 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-600/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDeleting ? "Deleting…" : "Delete report"}
    </button>
  );
}
