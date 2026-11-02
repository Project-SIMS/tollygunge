import { test, expect } from "@playwright/test";

test.use({
  launchOptions: {
    executablePath: process.env.TPA_BROWSER_EXECUTABLE || undefined,
  },
});

for (const mode of ["light", "dark"] as const) {
  for (const width of [320, 768, 1440]) {
    test(`Starry Night ${mode} keeps portal roles and fits ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/preview/admin");
      const portal = page.locator(".staff-shell");
      await expect(portal).toBeVisible();
      await page.evaluate((value) => {
        document.documentElement.dataset.colorMode = value;
      }, mode);
      await page.evaluate(() => document.fonts.ready);
      const colors = await portal.evaluate((element) => {
        const style = getComputedStyle(element);
        return Object.fromEntries(["--paper", "--surface", "--action-bg", "--secondary-bg"]
          .map((name) => [name, style.getPropertyValue(name).trim()]));
      });
      expect(colors).toEqual({
        "--paper": mode === "light" ? "#f5f7fa" : "#181a24",
        "--surface": mode === "light" ? "#e3eaf2" : "#23243a",
        "--action-bg": "#3a5ba0",
        "--secondary-bg": mode === "light" ? "#f7c873" : "#ffe066",
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      const active = page.locator('.portal-topbar .portal-navigation a[aria-current="page"]');
      await expect(active).toHaveCSS("background-color", mode === "light" ? "rgb(247, 200, 115)" : "rgb(255, 224, 102)");
      const ratios = await page.locator(".service-metrics a, .bento-card > p").evaluateAll((elements) => {
        function luminance(color: string) {
          const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((v) => {
            const c = v / 255;
            return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
          });
          return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
        }
        return elements.map((element) => {
          const text = element.querySelector(".metric-label") || element;
          let surface: Element | null = text;
          while (surface && getComputedStyle(surface).backgroundColor === "rgba(0, 0, 0, 0)") surface = surface.parentElement;
          const a = luminance(getComputedStyle(text).color);
          const b = luminance(getComputedStyle(surface!).backgroundColor);
          return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
        });
      });
      expect(ratios.length).toBeGreaterThan(0);
      for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  }
}
