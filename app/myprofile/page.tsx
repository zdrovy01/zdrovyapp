"use client";

import Toolbar from "@/components/toolbar";
import Space from "@/components/space";
import AvatarViewer from "@/components/avatarviewer";
import { useAuth } from "@/config/auth-context";
import { getSupabaseClient } from "@/config/supabase";
import { useCached } from "@/hooks/use-cached";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { useRouter } from "next/navigation";
import { COLORS } from "@/config/theme";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

interface RecipeThumb {
  id: string;
  name: string;
  image_url: string | null;
}

const notifIcon = (
  <svg width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 24C11.7969 24 12.4609 23.7109 12.9922 23.1328C13.5234 22.5625 13.7891 21.8477 13.7891 20.9883H8.21094C8.21094 21.8477 8.47266 22.5625 8.99609 23.1328C9.52734 23.7109 10.1953 24 11 24ZM1.17578 20.127H20.8242C21.2148 20.127 21.5234 19.9961 21.75 19.7344C21.9844 19.4727 22.1016 19.1484 22.1016 18.7617C22.1016 18.3945 21.9727 18.0664 21.7148 17.7773L19.7031 15.5977C19.207 15.0547 18.8477 14.4609 18.625 13.8164C18.4102 13.1719 18.3027 12.4258 18.3027 11.5781V10.0781C18.3027 8.18359 17.7852 6.58594 16.75 5.28516C15.7227 3.97656 14.3789 3.15625 12.7188 2.82422V2.01953C12.7188 1.58594 12.5703 1.22266 12.2734 0.929688C11.9844 0.628906 11.625 0.478516 11.1953 0.46875C11.1797 0.46875 11.1641 0.46875 11.1484 0.46875C11.1328 0.46875 11.1172 0.46875 11.1016 0.46875C10.5938 0.46875 10.1914 0.628906 9.89453 0.949219C9.59766 1.26172 9.44922 1.62891 9.44922 2.05078V2.83594C7.80469 3.17578 6.46484 4.00391 5.42969 5.32031C4.40234 6.62891 3.88672 8.21875 3.88672 10.0898V11.5781C3.88672 12.4258 3.77539 13.1719 3.55273 13.8164C3.33789 14.4609 2.98242 15.0547 2.48633 15.5977L0.473633 17.7891C0.214844 18.0781 0.0859375 18.4141 0.0859375 18.7969C0.0859375 19.1758 0.203125 19.4961 0.4375 19.7578C0.671875 20.0039 0.984375 20.127 1.375 20.127H1.17578Z" fill="#F5F5F5" />
  </svg>
);

const moreIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M11.6982 23.4053C10.4092 23.4053 9.17871 23.2061 8.00684 22.8076C6.84082 22.415 5.76855 21.8613 4.79004 21.1465C3.81738 20.4316 2.97363 19.585 2.25879 18.6064C1.54395 17.6338 0.987305 16.5645 0.588867 15.3984C0.196289 14.2266 0 12.9961 0 11.707C0 10.4121 0.196289 9.18164 0.588867 8.01562C0.987305 6.84375 1.54395 5.77148 2.25879 4.79883C2.97363 3.82617 3.81738 2.98242 4.79004 2.26758C5.76855 1.54688 6.84082 0.990234 8.00684 0.597656C9.17871 0.199219 10.4092 0 11.6982 0C12.9932 0 14.2236 0.199219 15.3896 0.597656C16.5615 0.990234 17.6338 1.54688 18.6064 2.26758C19.5791 2.98242 20.4229 3.82617 21.1377 4.79883C21.8584 5.77148 22.415 6.84375 22.8076 8.01562C23.2061 9.18164 23.4053 10.4121 23.4053 11.707C23.4053 12.9961 23.2061 14.2266 22.8076 15.3984C22.415 16.5645 21.8584 17.6338 21.1377 18.6064C20.4229 19.585 19.5791 20.4316 18.6064 21.1465C17.6338 21.8613 16.5615 22.415 15.3896 22.8076C14.2236 23.2061 12.9932 23.4053 11.6982 23.4053ZM6.17871 13.4473C6.50098 13.4473 6.79395 13.3711 7.05762 13.2188C7.32715 13.0605 7.53809 12.8467 7.69043 12.5771C7.84863 12.3076 7.92773 12.0146 7.92773 11.6982C7.92773 11.376 7.84863 11.083 7.69043 10.8193C7.53223 10.5498 7.32129 10.3359 7.05762 10.1777C6.79395 10.0195 6.50098 9.94043 6.17871 9.94043C5.85645 9.94043 5.56055 10.0195 5.29102 10.1777C5.02734 10.3359 4.81641 10.5498 4.6582 10.8193C4.5 11.083 4.4209 11.376 4.4209 11.6982C4.4209 12.0146 4.5 12.3076 4.6582 12.5771C4.81641 12.8467 5.02734 13.0605 5.29102 13.2188C5.56055 13.3711 5.85645 13.4473 6.17871 13.4473ZM11.6982 13.4473C12.0205 13.4473 12.3135 13.3711 12.5771 13.2188C12.8467 13.0605 13.0576 12.8467 13.21 12.5771C13.3682 12.3076 13.4473 12.0146 13.4473 11.6982C13.4473 11.376 13.3682 11.083 13.21 10.8193C13.0576 10.5498 12.8467 10.3359 12.5771 10.1777C12.3135 10.0195 12.0205 9.94043 11.6982 9.94043C11.376 9.94043 11.0801 10.0195 10.8105 10.1777C10.5469 10.3359 10.3359 10.5498 10.1777 10.8193C10.0195 11.083 9.94043 11.376 9.94043 11.6982C9.94043 12.0146 10.0195 12.3076 10.1777 12.5771C10.3359 12.8467 10.5469 13.0605 10.8105 13.2188C11.0801 13.3711 11.376 13.4473 11.6982 13.4473ZM17.2178 13.4473C17.5342 13.4473 17.8271 13.3711 18.0967 13.2188C18.3662 13.0605 18.5801 12.8467 18.7383 12.5771C18.8965 12.3076 18.9756 12.0146 18.9756 11.6982C18.9756 11.376 18.8965 11.083 18.7383 10.8193C18.5801 10.5498 18.3662 10.3359 18.0967 10.1777C17.8271 10.0195 17.5342 9.94043 17.2178 9.94043C16.8896 9.94043 16.5938 10.0195 16.3301 10.1777C16.0664 10.3359 15.8555 10.5498 15.6973 10.8193C15.5391 11.083 15.46 11.376 15.46 11.6982C15.46 12.0146 15.5391 12.3076 15.6973 12.5771C15.8555 12.8467 16.0664 13.0605 16.3301 13.2188C16.5938 13.3711 16.8896 13.4473 17.2178 13.4473Z" fill="#F5F5F5" />
  </svg>
);

export default function MorePage() {
  useProtectedRoute();
  const { user } = useAuth();
  const router = useRouter();

  const { data: stats } = useCached(
    `me-stats:${user?.id || "none"}`,
    async () => {
      if (!user) return { recipes: 0, followers: 0, following: 0 };
      const supabase = getSupabaseClient();
      const [recipesRes, followersRes, followingRes] = await Promise.all([
        supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", user.id),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", user.id),
      ]);
      return {
        recipes: recipesRes.count || 0,
        followers: followersRes.count || 0,
        following: followingRes.count || 0,
      };
    },
    { recipes: 0, followers: 0, following: 0 }
  );

  const { data: recipes } = useCached<RecipeThumb[]>(
    `me-recipes:${user?.id || "none"}`,
    async () => {
      if (!user) return [];
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from("recipes")
        .select("id, name, image_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return (data as RecipeThumb[]) || [];
    },
    []
  );

  const username = user?.username || "user";
  const initial = (user?.name || username || "?").charAt(0).toUpperCase();

  return (
    <div>
      <Space size={8} />
      <Toolbar
        title={username}
        icon1={notifIcon}
        href1="/notifications"
        showIcon2={false}
        icon3={moreIcon}
        href3="/options"
      />
      <Space size={20} />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Avatar + (name + stats) */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <AvatarViewer src={user?.avatar_url} initial={initial} size={80} />

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Name */}
            <div style={{ color: "#F5F5F5", fontSize: 17, fontWeight: 700, fontFamily: FONT }}>{user?.name || "User"}</div>

            {/* Stats */}
            <div style={{ display: "flex" }}>
              {[
                { label: "Recipes", value: stats.recipes, href: "/recipe" },
                { label: "Followers", value: stats.followers, href: `/followers/${username}` },
                { label: "Following", value: stats.following, href: `/following/${username}` },
              ].map((s) => (
                <div key={s.label}
                  onClick={() => router.push(s.href)}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}>
                  <span style={{ color: "#F5F5F5", fontSize: 18, fontWeight: 700, fontFamily: FONT }}>{s.value}</span>
                  <span style={{ color: "rgba(235,235,245,0.5)", fontSize: 11, fontFamily: FONT }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 0.5, background: "rgba(255,255,255,0.08)" }} />

        {/* Recipes grid — Instagram-style, full-bleed 3 columns */}
        {recipes.length === 0 ? (
          <div style={{ color: "rgba(235,235,245,0.35)", fontSize: 14, fontFamily: FONT, textAlign: "center", paddingTop: 12 }}>
            No recipes yet
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, margin: "0 -20px" }}>
            {recipes.map((r) => (
              <div
                key={r.id}
                onClick={() => router.push(`/recipe/${r.id}`)}
                style={{
                  aspectRatio: "1 / 1",
                  background: COLORS.surface,
                  overflow: "hidden",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {r.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image_url} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <span style={{ color: "rgba(235,235,245,0.4)", fontSize: 12, fontFamily: FONT, padding: 6, textAlign: "center" }}>
                    {r.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
