/**
 * CODEX5.3TREES - ProVeg Studio Main Page
 */
import { UnifiedTopBar, UnifiedLeftRail, UnifiedLeftDrawer, UnifiedRightRail, UnifiedRightDrawer, UnifiedBottomBar, UnifiedBottomDock } from '@/components/layout';
import HyperTree3DPreview from '@/components/tree/HyperTree3DPreview';

export default function ProVegStudioPage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <UnifiedTopBar />
      <div className="flex-1 flex overflow-hidden">
        <UnifiedLeftRail />
        <UnifiedLeftDrawer />
        <main className="flex-1 relative">
          <HyperTree3DPreview />
        </main>
        <UnifiedRightDrawer />
        <UnifiedRightRail />
      </div>
      <UnifiedBottomDock />
      <UnifiedBottomBar />
    </div>
  );
}
