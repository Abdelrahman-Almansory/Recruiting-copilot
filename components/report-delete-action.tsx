"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReportDeleteAction({ slug }: { slug: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const closeConfirm = () => {
    if (isDeleting) {
      return;
    }
    setShowConfirm(false);
  };

  const performDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/reports/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setShowConfirm(false);
      setToastMessage("Report deleted successfully.");
      setShowToast(true);

      window.setTimeout(() => {
        setShowToast(false);
        router.refresh();
      }, 900);
    } catch (error) {
      console.error(error);
      setShowConfirm(false);
      window.alert("Unable to delete the report. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className="inline-flex min-w-[120px] items-center justify-center rounded-full border border-rose-600 bg-rose-600/10 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-600/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isDeleting ? "Deleting…" : "Delete report"}
      </button>

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/95 p-6 text-slate-50 shadow-2xl shadow-slate-950/40">
            <h2 className="text-xl font-semibold text-white">Confirm delete</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This will permanently delete the report and its linked strategy
              records from Airtable. This cannot be undone.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeConfirm}
                disabled={isDeleting}
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performDelete}
                disabled={isDeleting}
                className="inline-flex w-full items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500 sm:w-auto"
              >
                {isDeleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showToast ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 w-auto rounded-3xl border border-cyan-500/20 bg-slate-900/95 p-4 shadow-2xl shadow-slate-950/40 text-slate-50">
          <p className="text-sm font-medium text-cyan-100">Success</p>
          <p className="mt-1 text-sm text-slate-300">{toastMessage}</p>
        </div>
      ) : null}
    </>
  );
}
