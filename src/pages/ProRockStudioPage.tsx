/**
 * CODEX5.3ROCKS - ProRock Studio Main Page
 */
import { ProRockLayoutProvider } from '@/contexts/ProRockLayoutContext';
import { RockTopBar, RockLeftRail, RockLeftDrawer, RockRightRail, RockRightDrawer, RockBottomBar, RockBottomDock } from '@/components/rock/RockLayout';
import Rock3DPreview from '@/components/rock/Rock3DPreview';

export default function ProRockStudioPage() {
  return (
    <ProRockLayoutProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <RockTopBar />
        <div className="flex-1 flex overflow-hidden">
          <RockLeftRail />
          <RockLeftDrawer />
          <main className="flex-1 relative">
            <Rock3DPreview />
          </main>
          <RockRightDrawer />
          <RockRightRail />
        </div>
        <RockBottomDock />
        <RockBottomBar />
      </div>
    </ProRockLayoutProvider>
  );
}
