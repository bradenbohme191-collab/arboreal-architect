import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProVegLayoutProvider } from "@/contexts/ProVegLayoutContext";
import ProVegStudioPage from "./pages/ProVegStudioPage";
import ProRockStudioPage from "./pages/ProRockStudioPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ProVegLayoutProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProVegStudioPage />} />
            <Route path="/rocks" element={<ProRockStudioPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProVegLayoutProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
