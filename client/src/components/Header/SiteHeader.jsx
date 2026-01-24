"use client";

import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

// 🚀 Static page title map (outside component for stability)
const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/problem-manager": "Problem Manager",
  "/problems": "Problems",
  "/ai/debug":"AI Feature",
  "/ai/generate":"AI Feature",
  "/ai/review":"AI Feature",
  "/ai/explain":"AI Feature",
  "/ai/convert":"AI Feature",
  "/ai/testcases":"AI Feature",
  "/code-playground":"Code PlayGround"
};

function SiteHeader() {
  const location = useLocation();

  const pageTitle = () => {
    return PAGE_TITLES[location.pathname] || "CodeCracker";
  } 

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{pageTitle()}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <Link
              href="https://github.com/vighnesh-shinde-18/CodeCrakr-2.0"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;