"use client";

import dynamic from "next/dynamic";

const ExcalidrawWrapper = dynamic(
  () => import("../components/ExcalidrawWrapper"),
  { ssr: false },
);

export default function Page() {
  return <ExcalidrawWrapper />;
}
