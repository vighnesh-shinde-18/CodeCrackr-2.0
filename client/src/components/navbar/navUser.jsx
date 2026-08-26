import { useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { IconLogout, IconDotsVertical } from "@tabler/icons-react";

import { useCurrentUser } from "../../hooks/Security/useCurrentUser";
import { useLogout } from "../../hooks/Security/useLogout";

import React from "react";

function NavUserComponent() {
  const navigate = useNavigate();

  // 🟢 Read user from React Query
  const { data: user } = useCurrentUser();

  // 🟢 Logout mutation
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/login");
      }
    });
  };

  if (!user) return null;

  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : "US";

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center justify-between">

        <SidebarMenuButton size="lg" className="flex-1">
          <Avatar className="h-8 w-8 rounded-lg grayscale">
            <AvatarImage src={user.avatar} alt={user.username || "User"} />
            <AvatarFallback className="rounded-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="grid flex-1 text-left text-sm leading-tight ml-3">
            <span className="truncate font-medium">
              {user.username || "Unknown"}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              {user.email || ""}
            </span>
          </div>
        </SidebarMenuButton>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-muted rounded-md transition cursor-pointer">
              <IconDotsVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <IconLogout className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </SidebarMenuItem>
    </SidebarMenu>
  );
}

const NavUser = React.memo(NavUserComponent);
export default NavUser;