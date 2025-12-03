import AppSidebar from "../components/AppSidebar/AppSidebar.jsx"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import SiteHeader from "../components/Header/SiteHeader.jsx";
function Layout({ children , sidebarVisible = true}) {

  const sidebarStyle = {
    "--sidebar-width": "calc(var(--spacing) * 72)",
    "--header-height": "calc(var(--spacing) * 12)",
  }

  return (
    <>
      <SidebarProvider style={sidebarStyle}>
        { sidebarVisible && <AppSidebar variant="inset" />}
        <SidebarInset>
          <SiteHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
export default Layout;