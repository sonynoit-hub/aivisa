import React from "react";
import NextImage from "next/image";

type Props = {
  src: string;
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

// 仅在已配置允许的域名时使用 next/image；否则降级为原生 <img>，避免服务器端因为域名未列入 allowlist 而抛错
const ALLOWED_NEXT_IMAGE_HOSTS = new Set<string>([
  // 与 next.config.ts 中 images.remotePatterns 一致
  "images.unsplash.com",
  "cdn.example.com",
]);

function isAllowedForNextImage(src: string): boolean {
  try {
    // 绝对 URL：检查主机
    const u = new URL(src);
    return ALLOWED_NEXT_IMAGE_HOSTS.has(u.hostname);
  } catch {
    // 相对路径（站内资源）可直接交给 next/image
    return src.startsWith("/");
  }
}

export default function SafeImage(props: Props) {
  const { src, alt = "", fill, width, height, sizes, className, priority } = props;

  const canUseNextImage = isAllowedForNextImage(src);

  if (canUseNextImage) {
    return (
      <NextImage
        src={src}
        alt={alt}
        {...(fill ? { fill: true } : { width, height })}
        sizes={sizes}
        className={className}
        priority={priority}
      />
    );
  }

  // 回退到 <img>，避免因未在 images.remotePatterns 中配置域名而导致 SSR 异常
  // 注意：当 fill 为 true 时，父容器需为 position: relative；此处使用绝对定位填充
  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        className={(className ? className + " " : "") + "absolute inset-0 w-full h-full object-cover"}
        loading={priority ? undefined : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={(className ?? "")}
      loading={priority ? undefined : "lazy"}
      decoding="async"
    />
  );
}
