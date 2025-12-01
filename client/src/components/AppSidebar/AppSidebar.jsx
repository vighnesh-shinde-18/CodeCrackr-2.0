"use client"

import * as React from "react"
import {
    IconDashboard,
    IconListCheck,
    IconHistory,
    IconSettings,
    IconUser,
    IconBug,
    IconFileCode,
    IconRepeat,
    IconBulb,
    IconFileText,
    IconLogout,
    IconInnerShadowTop,
    IconSettingsAutomation,
    IconUpload,
} from "@tabler/icons-react"

import  NavMain  from "../navbar/navMain.jsx"
import  NavSecondary  from "../navbar/navSecondary.jsx"
import  NavUser  from "../navbar/navUser.jsx"; // ✅ correct usage

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"



function AppSidebar() {

    const mainNav = [
        { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
        { title: "Problems", url: "/problems", icon: IconListCheck },
        { title: "Problem Manager", url: "/problem-manager", icon: IconUpload },
        { title: "History", url: "/history", icon: IconHistory },
        { title: "Code Playground", url: "/code-playground", icon: IconFileCode },
    ]

    const aiToolsNav = [
        { title: "Debug Code", url: "/ai/debug", icon: IconBug },
        { title: "Generate Code", url: "/ai/generate", icon: IconFileCode },
        { title: "Review & Refactor Code", url: "/ai/review", icon: IconSettingsAutomation },
        { title: "Explain Code", url: "/ai/explain", icon: IconBulb },
        { title: "Convert Code", url: "/ai/convert", icon: IconRepeat },
        { title: "Test Cases", url: "/ai/testcases", icon: IconFileText },
    ]

    return (
        <Sidebar collapsible="offcanvas" >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                            <a href="/dashboard">
                                <IconInnerShadowTop className="size-5" />
                                <span className="text-base font-semibold">CodeCracker</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain title="Navigation" items={mainNav} />
                <NavSecondary title="AI Features" items={aiToolsNav} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar;