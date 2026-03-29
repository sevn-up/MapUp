export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-navy">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {children}
      </div>
    </div>
  );
}
