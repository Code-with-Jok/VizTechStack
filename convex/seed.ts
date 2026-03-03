import { mutation } from "./_generated/server";

/**
 * Seed script cho module "Next.js" đầu tiên.
 * Chạy bằng: npx convex run seed:seedNextJSModule
 */
export const seedNextJSModule = mutation({
  args: {},
  handler: async (ctx) => {
    // Kiểm tra nếu đã seed
    const existing = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", "nextjs"))
      .unique();
    if (existing) return { message: "Đã seed rồi, bỏ qua." };

    // ─── Tạo Course ───────────────────────────────────────────────────
    const courseId = await ctx.db.insert("courses", {
      title: "Next.js",
      description: "Lộ trình học Next.js từ cơ bản đến nâng cao — App Router, Server Components, Data Fetching",
      icon: "▲",
      slug: "nextjs",
    });

    // ─── Tạo Chapters ─────────────────────────────────────────────────
    const ch1 = await ctx.db.insert("chapters", {
      courseId,
      title: "Introduction",
      description: "Tổng quan về Next.js và lý do sử dụng",
      order: 0, x: 400, y: 60,
      status: "available",
    });

    const ch2 = await ctx.db.insert("chapters", {
      courseId,
      title: "App Router",
      description: "Hệ thống routing mới trong Next.js 13+",
      order: 1, x: 200, y: 200,
      parentId: ch1,
      status: "available",
    });

    const ch3 = await ctx.db.insert("chapters", {
      courseId,
      title: "Server Components",
      description: "React Server Components và cách hoạt động",
      order: 2, x: 600, y: 200,
      parentId: ch1,
      status: "available",
    });

    const ch4 = await ctx.db.insert("chapters", {
      courseId,
      title: "Data Fetching",
      description: "fetch(), cache, revalidate trong Next.js",
      order: 3, x: 400, y: 340,
      parentId: ch2,
      status: "locked",
    });

    const ch5 = await ctx.db.insert("chapters", {
      courseId,
      title: "Routing & Navigation",
      description: "Dynamic routes, Nested layouts, Link component",
      order: 4, x: 200, y: 480,
      parentId: ch4,
      status: "locked",
    });

    const ch6 = await ctx.db.insert("chapters", {
      courseId,
      title: "Deployment",
      description: "Deploy lên Vercel và tự host",
      order: 5, x: 600, y: 480,
      parentId: ch4,
      status: "locked",
    });

    // ─── Tạo Lessons cho Chapter 1: Introduction ─────────────────────
    const l1 = await ctx.db.insert("lessons", { chapterId: ch1, title: "What is Next.js?", order: 0 });
    const l2 = await ctx.db.insert("lessons", { chapterId: ch1, title: "Next.js vs React", order: 1 });

    // ─── Content Blocks cho Lesson 1 ──────────────────────────────────
    await ctx.db.insert("contentBlocks", {
      lessonId: l1,
      type: "text", order: 0,
      title: "Giới thiệu Next.js",
      content: "Next.js là một React framework mạnh mẽ giúp bạn xây dựng các ứng dụng web full-stack. Được phát triển bởi Vercel, Next.js cung cấp Server-Side Rendering (SSR), Static Site Generation (SSG), và App Router.",
    });
    await ctx.db.insert("contentBlocks", {
      lessonId: l1,
      type: "interactive", order: 1,
      title: "Kiến trúc Next.js",
      content: "Next.js hoạt động trên cả server lẫn client. Server xử lý rendering và data fetching. Client quản lý interactivity và navigation. Vercel Edge Network tối ưu hóa tốc độ tải.",
    });
    await ctx.db.insert("contentBlocks", {
      lessonId: l1,
      type: "code", order: 2,
      title: "Hello World in Next.js",
      content: `// app/page.tsx
export default function HomePage() {
  return (
    <main>
      <h1>Hello, Next.js!</h1>
      <p>This is a Server Component by default.</p>
    </main>
  );
}`,
      language: "tsx",
    });

    // ─── Content Blocks cho Lesson 2 ──────────────────────────────────
    await ctx.db.insert("contentBlocks", {
      lessonId: l2,
      type: "text", order: 0,
      title: "Next.js vs React",
      content: "React là UI library — chỉ xử lý view layer. Next.js là framework đầy đủ tính năng, bao gồm routing, rendering, caching, và deployment. Dùng Next.js khi cần SEO, performance và full-stack capabilities.",
    });
    await ctx.db.insert("contentBlocks", {
      lessonId: l2,
      type: "diagram", order: 1,
      title: "So sánh",
      content: `React: UI Library, CSR by default, No built-in routing
Next.js: Full Framework, SSR/SSG/ISR, App Router built-in
React: Tự cấu hình mọi thứ
Next.js: Convention over configuration`,
    });

    // ─── Lessons cho Chapter 2: App Router ────────────────────────────
    const l3 = await ctx.db.insert("lessons", { chapterId: ch2, title: "App Router Basics", order: 0 });
    const l4 = await ctx.db.insert("lessons", { chapterId: ch2, title: "Layouts & Pages", order: 1 });

    await ctx.db.insert("contentBlocks", {
      lessonId: l3,
      type: "text", order: 0,
      title: "App Router là gì?",
      content: "App Router (thư mục app/) là hệ thống routing mới trong Next.js 13+. Mỗi folder trong app/ là một route segment. File page.tsx là UI của route đó. File layout.tsx là UI dùng chung giữa các routes.",
    });
    await ctx.db.insert("contentBlocks", {
      lessonId: l3,
      type: "code", order: 1,
      title: "Cấu trúc App Router",
      content: `app/
├── layout.tsx      # Root layout (áp dụng toàn app)
├── page.tsx        # Route: /
├── about/
│   └── page.tsx   # Route: /about
└── courses/
    ├── page.tsx    # Route: /courses
    └── [slug]/
        └── page.tsx # Route: /courses/:slug`,
      language: "bash",
    });

    await ctx.db.insert("contentBlocks", {
      lessonId: l4,
      type: "text", order: 0,
      title: "Layouts trong Next.js",
      content: "Layout là UI được chia sẻ giữa nhiều trang. Khi navigate, layout không re-render — chỉ page thay đổi. Nested layouts cho phép tạo nhiều cấp UI lồng nhau.",
    });
    await ctx.db.insert("contentBlocks", {
      lessonId: l4,
      type: "code", order: 1,
      title: "Root Layout",
      content: `// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <nav>...</nav>
        {children}
        <footer>...</footer>
      </body>
    </html>
  );
}`,
      language: "tsx",
    });

    // ─── Lessons cho Chapter 3: Server Components ─────────────────────
    const l5 = await ctx.db.insert("lessons", { chapterId: ch3, title: "Server vs Client Components", order: 0 });

    await ctx.db.insert("contentBlocks", {
      lessonId: l5,
      type: "text", order: 0,
      title: "Server Components",
      content: "Mặc định trong App Router, tất cả components đều là Server Components. Chúng render trên server — không gửi JavaScript xuống client. Dùng khi: fetch data, truy cập server resources, giữ secrets.",
    });
    await ctx.db.insert("contentBlocks", {
      lessonId: l5,
      type: "interactive", order: 1,
      title: "Server vs Client",
      content: "Server Components: Render trên server, không có state, không có hooks. Client Components: Dùng 'use client', có state và hooks. Kết hợp: Server Component chứa Client Component.",
    });
    await ctx.db.insert("contentBlocks", {
      lessonId: l5,
      type: "code", order: 2,
      title: "Phân biệt Server & Client",
      content: `// Server Component (mặc định)
async function ProductList() {
  const products = await fetchProducts(); // OK: server-side
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}

// Client Component
"use client";
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}`,
      language: "tsx",
    });

    return {
      message: "Seed thành công!",
      courseId,
      chapters: [ch1, ch2, ch3, ch4, ch5, ch6],
    };
  },
});
