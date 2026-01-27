export type ExportPdfOptions = {
  filename?: string;
  margin?: number; // px margin around capture area
  scale?: number; // render scale for html2canvas
  orientation?: "p" | "l"; // portrait or landscape
  pageFormat?: string | [number, number];
  chunkSelector?: string; // selector for splitting content into chunks/cards
  background?: string; // background color for rendering
};

export async function exportElementToPdf(el: HTMLElement, opts: ExportPdfOptions = {}) {
  if (typeof window === "undefined") throw new Error("exportElementToPdf must run in the browser");
  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");
  const {
    filename = "study-docs.pdf",
    margin = 16,
    scale = 1.5,
    orientation = "p",
    pageFormat = "a4",
    chunkSelector = '[data-pdf-chunk], [data-doc-card]',
    background = "#ffffff",
  } = opts;

  // 逐卡片截图拼接，避免大画布黑屏
  const pdf = new jsPDF({ orientation, unit: "pt", format: pageFormat });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  // 取原页面中的卡片/分块（更准确的节点）
  const cards = Array.from(el.querySelectorAll(chunkSelector)) as HTMLElement[];

  // 离屏容器，用于克隆后渲染
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.left = "0";
  overlay.style.top = "0";
  overlay.style.transform = "translateX(-10000px)"; // 移出视区但保持可渲染
  overlay.style.zIndex = "999999";
  overlay.style.background = background;
  overlay.style.padding = "12px";
  // 计算一个合理的离屏宽度：尽量接近内容宽度，避免过度缩放
  const elRect = el.getBoundingClientRect();
  const estimatedWidth = Math.max(320, Math.min(elRect.width || contentWidth, contentWidth));
  overlay.style.width = `${Math.round(estimatedWidth)}px`;
  document.body.appendChild(overlay);

  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const baseOpts = {
    scale,
    backgroundColor: background,
    useCORS: true,
    allowTaint: false,
    logging: false,
  } as const;

  const snapshotElement = async (node: HTMLElement) => {
    // 克隆并重置样式
    const clone = node.cloneNode(true) as HTMLElement;
    const resetStyles = (elem: HTMLElement) => {
      // 背景/前景
      if (getComputedStyle(elem).backgroundImage !== "none" || (elem.className as string).toString().includes("bg-gradient")) {
        elem.style.backgroundImage = "none";
      }
      if (getComputedStyle(elem).backgroundColor === "rgba(0, 0, 0, 0)") {
        elem.style.backgroundColor = "#ffffff";
      }
      // 过滤与混合
      elem.style.filter = "none";
      elem.style.setProperty("backdrop-filter", "none");
      elem.style.setProperty("mix-blend-mode", "normal");
      // 变换
      elem.style.transform = "none";
      elem.style.transformOrigin = "top left";
      // 位置/溢出
      const pos = getComputedStyle(elem).position;
      if (pos === "sticky" || pos === "fixed") elem.style.position = "static";
      const overflow = getComputedStyle(elem).overflow;
      if (overflow === "auto" || overflow === "scroll") {
        elem.style.overflow = "visible";
        elem.style.overflowX = "visible";
        elem.style.overflowY = "visible";
      }
      // 文字颜色（避免深色主题）
      // 不强制改文字颜色，防止丢失语义；如有需要可解注下一行
      // elem.style.color = "#0f172a"; // slate-900
    };
    const walk = (e: HTMLElement) => {
      resetStyles(e);
      Array.from(e.children).forEach((c) => walk(c as HTMLElement));
    };
    clone.style.background = "#ffffff";
    clone.style.maxWidth = "none";
    clone.style.width = "auto";
    clone.style.height = "auto";
    clone.style.boxSizing = "border-box";
    walk(clone);
    overlay.innerHTML = "";
    overlay.appendChild(clone);

    // 等待字体
    try {
      if (document.fonts) await document.fonts.ready;
    } catch {}

    // Safari 先尝试非 foreignObject，其他浏览器优先 foreignObject
    const attempts: Array<Partial<Parameters<typeof html2canvas>[1]>> = isSafari
      ? [{ foreignObjectRendering: false }, { foreignObjectRendering: true }]
      : [{ foreignObjectRendering: true }, { foreignObjectRendering: false }];
    let canvas: HTMLCanvasElement | null = null;
    for (const opt of attempts) {
      try {
        const options = { ...baseOpts, ...opt } as unknown as Parameters<typeof html2canvas>[1];
        canvas = await html2canvas(clone, options);
        if (canvas && canvas.width > 0 && canvas.height > 0) break;
      } catch {
        // 尝试下一个配置
      }
    }
    if (!canvas) {
      // 最后兜底再试一次
      const options = { ...baseOpts, foreignObjectRendering: false } as unknown as Parameters<typeof html2canvas>[1];
      canvas = await html2canvas(clone, options);
    }
    return canvas!;
  };

  let firstPage = true;
  const targets = cards.length ? cards : [el];
  for (const card of targets) {
    // 单卡片离屏截图
    const c = await snapshotElement(card);
    const imgData = c.toDataURL("image/png");
    const imgW = c.width;
    const imgH = c.height;
    const ratio = imgW / imgH;
    const drawW = contentWidth;
    const drawH = drawW / ratio;

    // 如果单卡片超出一页，则分页切分
    if (drawH <= contentHeight) {
      if (!firstPage) pdf.addPage();
      firstPage = false;
      const offsetY = margin + (contentHeight - drawH) / 2;
  pdf.addImage(imgData, "PNG", margin, offsetY, drawW, drawH);
    } else {
  const scaleFactor = contentWidth / imgW;
      const sliceHeightPx = contentHeight / scaleFactor;
      let y = 0;
      while (y < imgH - 0.5) {
        if (!firstPage) pdf.addPage();
        firstPage = false;
        const canvasSlice = document.createElement("canvas");
        canvasSlice.width = imgW;
        canvasSlice.height = Math.min(sliceHeightPx, imgH - y);
        const ctx = canvasSlice.getContext("2d");
        if (!ctx) break;
        ctx.drawImage(c, 0, y, imgW, canvasSlice.height, 0, 0, imgW, canvasSlice.height);
    const imgSlice = canvasSlice.toDataURL("image/png");
        const drawHeight = (canvasSlice.height * contentWidth) / imgW;
    pdf.addImage(imgSlice, "PNG", margin, margin, contentWidth, drawHeight);
        y += canvasSlice.height;
      }
    }
  }

  // 清理离屏容器
  try { document.body.removeChild(overlay); } catch {}

  // 如果没有任何一页被绘制，使用 html() 兜底渲染
  const pdfHtml = (pdf as unknown as { html?: (node: HTMLElement, options: unknown) => Promise<unknown> }).html;
  if (firstPage && pdfHtml) {
    await pdfHtml(el, {
      x: margin,
      y: margin,
      width: contentWidth,
      windowWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
      html2canvas: {
        backgroundColor: "#ffffff",
        scale: 1.2,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        logging: false,
      },
    });
  }

  // 如果仍旧没有内容（极端情况下），回退为简单文本清单
  if (firstPage) {
    const title = document.title || "study-docs";
    const left = margin;
    let y = margin;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(title, left, y);
    y += 20;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    const lines: string[] = [];
    const sections = Array.from(el.querySelectorAll('[data-doc-card]')) as HTMLElement[];
    sections.forEach((sec) => {
      const h = sec.querySelector('h4');
      if (h) lines.push(`• ${(h.textContent || '').trim()}`);
      const items = Array.from(sec.querySelectorAll('li label')) as HTMLElement[];
      items.forEach((lb) => lines.push(`- ${(lb.textContent || '').trim()}`));
    });
    if (!sections.length) lines.push("(无内容)");
    const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    lines.forEach((t) => {
      const wrapped = pdf.splitTextToSize(t, maxWidth);
      wrapped.forEach((ln: string) => {
        if (y > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(ln, left, y);
        y += 18;
      });
    });
  }

  pdf.save(filename);
}
