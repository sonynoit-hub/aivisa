"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ChatDock = dynamic(() => import("@/features/ask-ai/components/ChatDock"), { ssr: false });

export default function ChatDockClient() {
	const pathname = usePathname();
	// 在 ask-ai 聊天页隐藏浮动按钮
	if (
		pathname && (
			/\/ask-ai(\/.*)?$/.test(pathname) ||
			/\/questionnaire\/contact\/?$/.test(pathname) ||
			/\/tools\/(hsp-calculator|hsp-points)\/?$/.test(pathname) ||
			/\/legal\/(privacy|terms)\/?$/.test(pathname)
		)
	) return null;
	return <ChatDock />;
}
