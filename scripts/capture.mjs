import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

await mkdir('artifacts/screenshots', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'pt-BR', reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const [name, route] of [['planejamentos', '/planejamentos'], ['pdi-acoes', '/plano/pdi?item=riscos&tab=acoes'], ['pls-indicadores', '/plano/pls?item=papel&tab=indicadores'], ['modelos', '/modelos']]) {
    await page.goto(`http://127.0.0.1:4317/#${route}`);
    await page.locator('h1').waitFor();
    await page.screenshot({ path: `artifacts/screenshots/${name}.png`, fullPage: true });
    console.log(name, await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth })));
  }
  await page.getByRole('button', { name: 'Personalizar PDI', exact: true }).click();
  await page.screenshot({ path: 'artifacts/screenshots/personalizar.png', fullPage: true });
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4317/#/plano/pls?item=papel&tab=acoes');
  await page.locator('h1').waitFor();
  await page.screenshot({ path: 'artifacts/screenshots/mobile.png', fullPage: true });
  console.log('mobile', await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth })));
  console.log('Erros de execução:', errors);
  if (errors.length) process.exitCode = 1;
} finally { await browser.close(); }
