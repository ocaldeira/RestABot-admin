import * as Icons from "../icons";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  items: NavItem[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_DATA: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Search",
        url: "/search",
        icon: Icons.Alphabet, // Using Alphabet icon as a fallback for search if FourCircle isn't desired
        items: [],
      },
      {
        title: "Restaurants",
        url: "/restaurants",
        icon: Icons.Table,
        items: [],
      },
      {
        title: "Payments",
        url: "/payments",
        icon: Icons.CreditCardIcon,
        items: [],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Icons.FourCircle,
        items: [],
      },
    ],
  },
];
