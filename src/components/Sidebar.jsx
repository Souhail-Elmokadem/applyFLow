import { NavLink, Link } from "react-router-dom";
import { motion } from "framer-motion";
import LogoutButton from "../components/LogoutButton";

import {
  LayoutDashboard,
  Send,
  BriefcaseBusiness,
  CreditCard,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Candidatures",
    path: "/applications",
    icon: BriefcaseBusiness,
  },
  {
    name: "Nouvelle campagne",
    path: "/campaign",
    icon: Send,
  },
  {
    name: "Abonnement",
    path: "/subscription",
    icon: CreditCard,
  },
  {
    name: "Paramètres",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="dashboardSidebar">
      <Link to="/dashboard" className="sidebarBrand">
        <motion.div
          className="sidebarBrandIcon"
          whileHover={{ rotate: -8, scale: 1.06 }}
        >
          <BriefcaseBusiness size={19} />
        </motion.div>

        <span>ApplyFlow</span>
      </Link>

      <div className="sidebarLabel">
        ESPACE PERSONNEL
      </div>

      <nav className="sidebarNavigation">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "sidebarLink active"
                  : "sidebarLink"
              }
            >
              <Icon size={19} />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebarBottom">
        <div className="sidebarUpgrade">
          <div className="upgradeIcon">
            <Sparkles size={17} />
          </div>

          <strong>Plan gratuit</strong>

          <p>
            Passez à Pro pour débloquer plus de
            candidatures.
          </p>

          <Link to="/subscription">
            Découvrir Pro
          </Link>
        </div>

        <button className="logoutButton">
          <LogoutButton />
        </button>
      </div>
    </aside>
  );
}