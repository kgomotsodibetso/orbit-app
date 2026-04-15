import CollapsibleSidebar from '@/components/ui/CollapsibleSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      <CollapsibleSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
