// ui-capture-playwright.js
// Web UI Analyzer - Playwrightを使用したWebシステムUI分析用スクリプト（手動画面遷移版）

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// 改良されたユーザー入力処理
function getUserInput(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    // プロンプト表示
    process.stdout.write(question);
    
    rl.once('line', (line) => {
      rl.close();
      resolve(line);
    });
  });
}

// 出力ディレクトリの作成
async function createOutputDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`ディレクトリ作成: ${dirPath}`);
  } catch (err) {
    console.error(`ディレクトリ作成エラー: ${err.message}`);
  }
}

// Webシステムのワークフロー収集（手動操作版）
async function captureWorkflow(baseUrl, workflowName) {
  // 出力ディレクトリ
  const outputDir = path.join(__dirname, 'captures_pw', workflowName);
  await createOutputDir(outputDir);
  
  // ブラウザ起動
  const browser = await chromium.launch({ 
    headless: false // 可視化
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });
  
  // トレース記録を開始
  await context.tracing.start({ 
    screenshots: true, 
    snapshots: true 
  });
  
  const page = await context.newPage();
  
  try {
    // トップページにアクセス
    console.log('\n==== UI分析ツール（手動操作版 - Playwright）====');
    console.log(`トップページにアクセスしています: ${baseUrl}`);
    await page.goto(baseUrl);
    
    console.log('\n手動ログインを行ってください');
    console.log('メールアドレスとパスワードを入力し、ログインボタンをクリックしてください');
    await getUserInput('\nログインが完了したら、Enterキーを押してください... ');
    
    let stepCounter = 1;
    let continueCapturer = true;
    
    // 手動操作と画面キャプチャーのループ
    while (continueCapturer) {
      console.log(`\n==== ステップ ${stepCounter} ====`);
      
      // 現在の画面の説明を入力
      const screenDescription = await getUserInput('現在の画面の説明を入力してください: ');
      
      // データ収集
      await collectScreenData(page, outputDir, stepCounter, screenDescription);
      
      // 続行確認
      const continueAnswer = await getUserInput('\n次の画面に手動で移動しますか？(y/n): ');
      if (continueAnswer.toLowerCase() !== 'y') {
        continueCapturer = false;
      } else {
        console.log('\n次の画面に移動してください。準備ができたらEnterキーを押してください。');
        await getUserInput('移動が完了したら、Enterキーを押してください... ');
        stepCounter++;
      }
    }
    
    // トレースファイルを保存
    await context.tracing.stop({ path: path.join(outputDir, 'trace.zip') });
    
    console.log('\nワークフロー収集完了');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await browser.close();
  }
}

// 画面データの収集
async function collectScreenData(page, outputDir, stepCounter, description) {
  try {
    console.log(`画面データの収集を開始: ${description}`);
    
    // ステップの説明をJSONとして保存
    const stepInfoPath = path.join(outputDir, `step${stepCounter}_info.json`);
    const stepInfo = {
      stepNumber: stepCounter,
      description: description,
      timestamp: new Date().toISOString()
    };
    await fs.writeFile(stepInfoPath, JSON.stringify(stepInfo, null, 2));
    
    // 1. スクリーンショット
    const screenshotPath = path.join(outputDir, `step${stepCounter}_screenshot.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`スクリーンショット保存: ${screenshotPath}`);
    
    // 2. HTML構造
    const html = await page.content();
    const htmlPath = path.join(outputDir, `step${stepCounter}_page.html`);
    await fs.writeFile(htmlPath, html);
    console.log(`HTML構造保存: ${htmlPath}`);
    
    // 3. 要素レイアウト情報
    const layoutInfo = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      return allElements.slice(0, 1000).map(el => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          id: el.id,
          className: el.className,
          text: el.innerText?.substring(0, 100),
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          }
        };
      });
    });
    
    const layoutPath = path.join(outputDir, `step${stepCounter}_layout.json`);
    await fs.writeFile(layoutPath, JSON.stringify(layoutInfo, null, 2));
    console.log(`レイアウト情報保存: ${layoutPath}`);
    
    // 4. アクセシビリティスナップショット
    const accessibilitySnapshot = await page.accessibility.snapshot();
    const accessibilityPath = path.join(outputDir, `step${stepCounter}_accessibility.json`);
    await fs.writeFile(accessibilityPath, JSON.stringify(accessibilitySnapshot, null, 2));
    console.log(`アクセシビリティ情報保存: ${accessibilityPath}`);
    
    // 5. CSSスタイル情報
    const styles = await page.evaluate(() => {
      const styleMap = {};
      const elements = document.querySelectorAll('*');
      for (let i = 0; i < Math.min(elements.length, 1000); i++) {
        const el = elements[i];
        const computedStyle = window.getComputedStyle(el);
        const elementId = el.id || el.className || `element-${i}`;
        styleMap[elementId] = {
          tag: el.tagName,
          position: computedStyle.position,
          display: computedStyle.display,
          width: computedStyle.width,
          height: computedStyle.height,
          color: computedStyle.color,
          backgroundColor: computedStyle.backgroundColor,
          fontSize: computedStyle.fontSize,
          fontFamily: computedStyle.fontFamily
        };
      }
      return styleMap;
    });
    
    const stylesPath = path.join(outputDir, `step${stepCounter}_styles.json`);
    await fs.writeFile(stylesPath, JSON.stringify(styles, null, 2));
    console.log(`スタイル情報保存: ${stylesPath}`);
    
    // 6. 現在のURL
    const urlInfo = {
      url: page.url(),
      title: await page.title()
    };
    const urlPath = path.join(outputDir, `step${stepCounter}_url.json`);
    await fs.writeFile(urlPath, JSON.stringify(urlInfo, null, 2));
    console.log(`URL情報保存: ${urlPath}`);
    
    console.log(`ステップ ${stepCounter} のデータ収集完了`);
  } catch (error) {
    console.error(`ステップ ${stepCounter} のデータ収集中にエラーが発生しました:`, error);
    // エラー状態のスクリーンショット
    const errorScreenshotPath = path.join(outputDir, `step${stepCounter}_error_screenshot.png`);
    await page.screenshot({ path: errorScreenshotPath });
  }
}

// UI分析
async function analyzeComponentUsage(captureDir) {
  const files = await fs.readdir(captureDir);
  const htmlFiles = files.filter(file => file.endsWith('_page.html'));
  
  const componentStats = {};
  
  for (const htmlFile of htmlFiles) {
    const htmlContent = await fs.readFile(path.join(captureDir, htmlFile), 'utf8');
    
    // 簡易的なHTML解析
    const buttonCount = (htmlContent.match(/<button/g) || []).length;
    const inputCount = (htmlContent.match(/<input/g) || []).length;
    const selectCount = (htmlContent.match(/<select/g) || []).length;
    const tableCount = (htmlContent.match(/<table/g) || []).length;
    const divCount = (htmlContent.match(/<div/g) || []).length;
    
    componentStats[htmlFile] = {
      buttons: buttonCount,
      inputs: inputCount,
      selects: selectCount,
      tables: tableCount,
      divs: divCount
    };
  }
  
  // JSON形式で保存
  await fs.writeFile(
    path.join(captureDir, 'component_usage.json'),
    JSON.stringify(componentStats, null, 2)
  );
  
  // CSVでも保存
  let csvContent = 'File,Buttons,Inputs,Selects,Tables,Divs\n';
  
  for (const [file, stats] of Object.entries(componentStats)) {
    csvContent += `${file},${stats.buttons},${stats.inputs},${stats.selects},${stats.tables},${stats.divs}\n`;
  }
  
  await fs.writeFile(
    path.join(captureDir, 'component_usage.csv'),
    csvContent
  );
  
  console.log('コンポーネント使用状況の分析完了');
}

// メイン実行部分
async function main() {
  try {
    // 設定ファイルからの読み込み
    const config = require('./config.js');
    const baseUrl = config.baseUrl;
    
    console.log('UI分析ツール（手動操作版 - Playwright）を開始します');
    
    // ワークフロー名の入力
    const workflowName = await getUserInput('分析するワークフローの名前を入力してください: ');
    
    let finalWorkflowName = workflowName;
    if (!workflowName || workflowName.trim() === '') {
      finalWorkflowName = 'manual_workflow_pw_' + new Date().toISOString().replace(/[:.]/g, '-');
      console.log(`ワークフロー名が指定されなかったため、自動生成しました: ${finalWorkflowName}`);
    }
    
    // ワークフロー実行
    await captureWorkflow(baseUrl, finalWorkflowName);
    
    // 収集したデータの分析
    const captureDir = path.join(__dirname, 'captures_pw', finalWorkflowName);
    await analyzeComponentUsage(captureDir);
    
    console.log('UI分析プロセス完了');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// プログラム実行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  captureWorkflow,
  analyzeComponentUsage
};
