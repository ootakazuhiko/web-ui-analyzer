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
async function captureWorkflow(baseUrl, workflowName, options = {}) {
  // 出力ディレクトリ
  const rootDir = path.resolve(__dirname, '..', '..');
  const outputDir = path.join(rootDir, 'captures_pw', workflowName);
  await createOutputDir(outputDir);
  
  // ブラウザの設定
  const headless = options.headless !== undefined ? options.headless : false;
  const viewportSize = options.viewportSize || { width: 1280, height: 800 };
  
  // ブラウザ起動
  const browser = await chromium.launch({ 
    headless: headless
  });
  
  const context = await browser.newContext({
    viewport: viewportSize,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
  });
  
  // トレース記録を開始（スクリーンショット、スナップショットに加えてネットワークも記録）
  await context.tracing.start({ 
    screenshots: true, 
    snapshots: true,
    sources: true,
    title: workflowName
  });
  
  const page = await context.newPage();
  
  try {
    // トップページにアクセス
    console.log('\n==== UI分析ツール（手動操作版 - Playwright）====');
    console.log(`トップページにアクセスしています: ${baseUrl}`);
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    
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
    return { success: true, stepCount: stepCounter, outputDir };
  } catch (error) {
    console.error('エラーが発生しました:', error);
    // エラー発生時でもトレースを保存
    try {
      await context.tracing.stop({ path: path.join(outputDir, 'error_trace.zip') });
    } catch (traceError) {
      console.error('トレース保存中にエラーが発生しました:', traceError);
    }
    return { success: false, error: error.message };
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
      function getComputedStyleObject(element) {
        const style = window.getComputedStyle(element);
        return {
          position: style.position,
          display: style.display,
          width: style.width,
          height: style.height,
          color: style.color,
          backgroundColor: style.backgroundColor,
          fontSize: style.fontSize,
          fontFamily: style.fontFamily,
          padding: style.padding,
          margin: style.margin,
          border: style.border,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          zIndex: style.zIndex,
          opacity: style.opacity,
          visibility: style.visibility
        };
      }
      
      const allElements = Array.from(document.querySelectorAll('*'));
      return allElements.slice(0, 2000).map(el => {
        const rect = el.getBoundingClientRect();
        const attributes = {};
        
        // 要素の属性を収集
        for (const attr of el.attributes) {
          attributes[attr.name] = attr.value;
        }
        
        return {
          tag: el.tagName,
          id: el.id || '',
          className: el.className || '',
          attributes,
          textContent: el.innerText?.substring(0, 200) || '',
          isVisible: rect.width > 0 && rect.height > 0,
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left
          },
          computedStyle: getComputedStyleObject(el)
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
    
    // 7. パフォーマンスメトリクスの収集 (Playwrightの機能を使用)
    const performanceMetrics = await page.evaluate(() => {
      if (window.performance && window.performance.getEntriesByType) {
        const navigationEntries = window.performance.getEntriesByType('navigation');
        const resourceEntries = window.performance.getEntriesByType('resource');
        
        return {
          navigation: navigationEntries.length > 0 ? navigationEntries[0] : null,
          resources: resourceEntries.slice(0, 50), // 最初の50リソースのみ
          timing: window.performance.timing
        };
      }
      return null;
    });
    
    if (performanceMetrics) {
      const performancePath = path.join(outputDir, `step${stepCounter}_performance.json`);
      await fs.writeFile(performancePath, JSON.stringify(performanceMetrics, null, 2));
      console.log(`パフォーマンス情報保存: ${performancePath}`);
    }
    
    console.log(`ステップ ${stepCounter} のデータ収集完了`);
  } catch (error) {
    console.error(`ステップ ${stepCounter} のデータ収集中にエラーが発生しました:`, error);
    // エラー状態のスクリーンショット
    const errorScreenshotPath = path.join(outputDir, `step${stepCounter}_error_screenshot.png`);
    await page.screenshot({ path: errorScreenshotPath });
  }
}

// コンポーネント使用状況の分析
async function analyzeComponentUsage(captureDir) {
  const files = await fs.readdir(captureDir);
  const htmlFiles = files.filter(file => file.endsWith('_page.html'));
  
  const componentStats = {};
  
  for (const htmlFile of htmlFiles) {
    const htmlContent = await fs.readFile(path.join(captureDir, htmlFile), 'utf8');
    
    // 各種UI要素の計数
    const buttonCount = (htmlContent.match(/<button/g) || []).length;
    const inputCount = (htmlContent.match(/<input/g) || []).length;
    const selectCount = (htmlContent.match(/<select/g) || []).length;
    const tableCount = (htmlContent.match(/<table/g) || []).length;
    const divCount = (htmlContent.match(/<div/g) || []).length;
    const headingCount = (htmlContent.match(/<h[1-6]/g) || []).length;
    const linkCount = (htmlContent.match(/<a\s/g) || []).length;
    const imageCount = (htmlContent.match(/<img/g) || []).length;
    const formCount = (htmlContent.match(/<form/g) || []).length;
    
    // 特定のクラスやコンポーネントのカウント
    const modalCount = (htmlContent.match(/modal|dialog|popup/gi) || []).length;
    const cardCount = (htmlContent.match(/card|box|panel/gi) || []).length;
    
    componentStats[htmlFile] = {
      buttons: buttonCount,
      inputs: inputCount,
      selects: selectCount,
      tables: tableCount,
      divs: divCount,
      headings: headingCount,
      links: linkCount,
      images: imageCount,
      forms: formCount,
      modals: modalCount,
      cards: cardCount
    };
  }
  
  // JSON形式で保存
  await fs.writeFile(
    path.join(captureDir, 'component_usage.json'),
    JSON.stringify(componentStats, null, 2)
  );
  
  // CSVでも保存
  let csvContent = 'File,Buttons,Inputs,Selects,Tables,Divs,Headings,Links,Images,Forms,Modals,Cards\n';
  
  for (const [file, stats] of Object.entries(componentStats)) {
    csvContent += `${file},${stats.buttons},${stats.inputs},${stats.selects},${stats.tables},${stats.divs},${stats.headings},${stats.links},${stats.images},${stats.forms},${stats.modals},${stats.cards}\n`;
  }
  
  await fs.writeFile(
    path.join(captureDir, 'component_usage.csv'),
    csvContent
  );
  
  console.log('コンポーネント使用状況の分析完了');
  return componentStats;
}

// スタイル一貫性の分析
async function analyzeStyleConsistency(captureDir) {
  const files = await fs.readdir(captureDir);
  const styleFiles = files.filter(file => file.endsWith('_styles.json'));
  
  const colorUsage = {};
  const fontSizeUsage = {};
  const fontFamilyUsage = {};
  
  for (const file of styleFiles) {
    const styleData = JSON.parse(
      await fs.readFile(path.join(captureDir, file), 'utf8')
    );
    
    for (const [elementId, style] of Object.entries(styleData)) {
      // 色の使用状況を記録
      if (style.color) {
        colorUsage[style.color] = (colorUsage[style.color] || 0) + 1;
      }
      if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        colorUsage[style.backgroundColor] = (colorUsage[style.backgroundColor] || 0) + 1;
      }
      
      // フォントサイズの使用状況を記録
      if (style.fontSize) {
        fontSizeUsage[style.fontSize] = (fontSizeUsage[style.fontSize] || 0) + 1;
      }
      
      // フォントファミリーの使用状況を記録
      if (style.fontFamily) {
        fontFamilyUsage[style.fontFamily] = (fontFamilyUsage[style.fontFamily] || 0) + 1;
      }
    }
  }
  
  // 結果を保存
  await fs.writeFile(
    path.join(captureDir, 'color_usage.json'),
    JSON.stringify(colorUsage, null, 2)
  );
  
  await fs.writeFile(
    path.join(captureDir, 'font_size_usage.json'),
    JSON.stringify(fontSizeUsage, null, 2)
  );
  
  await fs.writeFile(
    path.join(captureDir, 'font_family_usage.json'),
    JSON.stringify(fontFamilyUsage, null, 2)
  );
  
  // 分析レポートの生成
  let report = '# UI一貫性分析レポート\n\n';
  
  report += '## 色の使用状況\n\n';
  report += '以下の色が3回以上使用されています：\n\n';
  
  for (const [color, count] of Object.entries(colorUsage)) {
    if (count >= 3) {
      report += `- ${color}: ${count}回\n`;
    }
  }
  
  report += '\n## フォントサイズの使用状況\n\n';
  
  for (const [fontSize, count] of Object.entries(fontSizeUsage)) {
    report += `- ${fontSize}: ${count}回\n`;
  }
  
  report += '\n## フォントファミリーの使用状況\n\n';
  
  for (const [fontFamily, count] of Object.entries(fontFamilyUsage)) {
    report += `- ${fontFamily}: ${count}回\n`;
  }
  
  await fs.writeFile(
    path.join(captureDir, 'consistency_report.md'),
    report
  );
  
  console.log('スタイル一貫性の分析完了');
  
  return {
    colorUsage,
    fontSizeUsage,
    fontFamilyUsage
  };
}

// アクセシビリティ分析
async function analyzeAccessibility(captureDir) {
  const files = await fs.readdir(captureDir);
  const accessibilityFiles = files.filter(file => file.endsWith('_accessibility.json'));
  
  let issues = [];
  
  for (const file of accessibilityFiles) {
    const accessibilityData = JSON.parse(
      await fs.readFile(path.join(captureDir, file), 'utf8')
    );
    
    // input要素にラベルがない問題を検出
    function findInputsWithoutLabels(node) {
      if (!node) return;
      
      if (node.role === 'textbox' && (!node.name || node.name === '')) {
        issues.push({
          file,
          issue: 'ラベルのない入力フィールド',
          element: node
        });
      }
      
      // コントラスト比の問題を検出 (この部分はアクセシビリティデータから直接は取得できない場合があります)
      // 画像に代替テキストがないケース
      if (node.role === 'img' && (!node.name || node.name === '')) {
        issues.push({
          file,
          issue: '代替テキストのない画像',
          element: node
        });
      }
      
      if (node.children) {
        for (const child of node.children) {
          findInputsWithoutLabels(child);
        }
      }
    }
    
    findInputsWithoutLabels(accessibilityData);
  }
  
  // レポート生成
  let report = '# アクセシビリティ分析レポート\n\n';
  
  if (issues.length === 0) {
    report += '検出された問題はありません。\n';
  } else {
    report += `検出された問題: ${issues.length}件\n\n`;
    
    for (const issue of issues) {
      report += `## ${issue.file} の問題\n\n`;
      report += `- タイプ: ${issue.issue}\n`;
      report += `- 要素: ${JSON.stringify(issue.element, null, 2)}\n\n`;
    }
  }
  
  await fs.writeFile(
    path.join(captureDir, 'accessibility_report.md'),
    report
  );
  
  console.log('アクセシビリティ分析完了');
  
  return {
    issueCount: issues.length,
    issues
  };
}

// 分析プロセスの実行
async function runAnalysis(captureDir) {
  console.log(`\n==== ${captureDir} の詳細分析を開始 ====`);
  
  // 1. コンポーネント使用状況
  const componentStats = await analyzeComponentUsage(captureDir);
  
  // 2. スタイル一貫性
  const styleConsistency = await analyzeStyleConsistency(captureDir);
  
  // 3. アクセシビリティ
  const accessibilityIssues = await analyzeAccessibility(captureDir);
  
  // 4. 総合レポート生成
  const summaryReport = {
    captureDirectory: captureDir,
    timestamp: new Date().toISOString(),
    componentStats: {
      totalComponents: Object.values(componentStats).reduce((sum, stats) => 
        sum + Object.values(stats).reduce((a, b) => a + b, 0), 0)
    },
    styleConsistency: {
      uniqueColors: Object.keys(styleConsistency.colorUsage).length,
      uniqueFontSizes: Object.keys(styleConsistency.fontSizeUsage).length,
      uniqueFontFamilies: Object.keys(styleConsistency.fontFamilyUsage).length
    },
    accessibility: {
      issueCount: accessibilityIssues.issueCount
    }
  };
  
  await fs.writeFile(
    path.join(captureDir, 'analysis_summary.json'),
    JSON.stringify(summaryReport, null, 2)
  );
  
  // Markdownレポート
  let markdownReport = `# Web UI分析 総合レポート

## 分析概要
- 分析日時: ${new Date().toLocaleString('ja-JP')}
- 分析ディレクトリ: ${captureDir}

## UI要素の使用状況
- 分析された要素の総数: ${summaryReport.componentStats.totalComponents}

## スタイルの一貫性
- 使用されている色の種類: ${summaryReport.styleConsistency.uniqueColors}
- 使用されているフォントサイズの種類: ${summaryReport.styleConsistency.uniqueFontSizes}
- 使用されているフォントファミリーの種類: ${summaryReport.styleConsistency.uniqueFontFamilies}

## アクセシビリティ
- 検出された問題数: ${summaryReport.accessibility.issueCount}

詳細については各分析レポートを参照してください:
- \`component_usage.json\`: UI要素の使用頻度
- \`consistency_report.md\`: スタイルの一貫性分析
- \`accessibility_report.md\`: アクセシビリティの問題

## Playwrightトレースの活用方法

収集されたトレースファイル(\`trace.zip\`)を使用して、よりインタラクティブな分析が可能です:

\`\`\`bash
npx playwright show-trace ${path.join(captureDir, 'trace.zip')}
\`\`\`

このコマンドでトレースビューアが開き、次の情報を確認できます:
- ワークフロー全体の時系列ビュー
- 各アクションと対応するスクリーンショット
- ネットワークリクエスト
- コンソールログ
`;
  
  await fs.writeFile(
    path.join(captureDir, 'analysis_report.md'),
    markdownReport
  );
  
  console.log(`分析完了: 結果は ${captureDir} に保存されました`);
  return summaryReport;
}

// メイン実行部分
async function main() {
  try {
    // 設定ファイルからの読み込み
    const configPath = path.resolve(__dirname, '..', '..', 'config', 'default.js');
    let config;
    
    try {
      config = require(configPath);
      console.log('設定ファイルを読み込みました:', configPath);
    } catch (configError) {
      console.warn('設定ファイルの読み込みに失敗しました:', configError.message);
      config = { baseUrl: 'http://localhost:3000' };
      console.log('デフォルト設定を使用します: baseUrl =', config.baseUrl);
    }
    
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
    const result = await captureWorkflow(baseUrl, finalWorkflowName);
    
    if (result.success) {
      // 収集したデータの分析
      const rootDir = path.resolve(__dirname, '..', '..');
      const captureDir = path.join(rootDir, 'captures_pw', finalWorkflowName);
      await runAnalysis(captureDir);
      
      console.log('\nUI分析プロセス完了');
      console.log(`\nPlaywrightトレースを表示するには以下のコマンドを実行してください:`);
      console.log(`npx playwright show-trace ${path.join('captures_pw', finalWorkflowName, 'trace.zip')}`);
    } else {
      console.error('\nUI分析プロセスは問題により完了できませんでした:', result.error);
    }
    
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
  analyzeComponentUsage,
  analyzeStyleConsistency,
  analyzeAccessibility,
  runAnalysis
};
