import AppSidebar from "../components/AppSidebar/AppSidebar.jsx";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import SiteHeader from "../components/Header/SiteHeader.jsx";
import { Outlet } from "react-router-dom";

// 🟢 OPTIMIZATION: Defined outside component = Stable Reference
// This object never changes, so it won't cause re-renders.
const sidebarStyle = {
  "--sidebar-width": "calc(var(--spacing) * 72)",
  "--header-height": "calc(var(--spacing) * 12)",
};

function Layout({ children, sidebarVisible = true }) {
  return (
    <SidebarProvider style={sidebarStyle}>
      {/* Because AppSidebar is wrapped in React.memo (in your other file),
         and 'variant' is a static string, this component will NOT re-render
         unless the SidebarProvider context changes.
      */}
      {sidebarVisible && <AppSidebar variant="inset" />}
      
      <SidebarInset>
        <SiteHeader />
        {/* Render child routes or explicit children */}
        {children || <Outlet />}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;