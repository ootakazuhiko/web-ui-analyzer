// ui-capture-puppeteer.js
// Web UI Analyzer - Puppeteerを使用したWebシステムUI分析用スクリプト（手動画面遷移版）

const puppeteer = require('puppeteer');
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
  const outputDir = path.join(__dirname, 'captures', workflowName);
  await createOutputDir(outputDir);
  
  // ブラウザ起動
  const browser = await puppeteer.launch({ 
    headless: false, // 可視化
    defaultViewport: { width: 1280, height: 800 },
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // ユーザーエージェント設定
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  
  try {
    // トップページにアクセス
    console.log('\n==== UI分析ツール（手動操作版）====');
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
    
    // 3. CSSスタイル（計算済み）
    const styles = await page.evaluate(() => {
      const styleMap = {};
      const elements = document.querySelectorAll('*');
      elements.forEach((el, index) => {
        if (index > 1000) return; // 処理量制限
        const computedStyle = window.getComputedStyle(el);
        const elementId = el.id || el.className || `element-${index}`;
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
      });
      return styleMap;
    });
    
    const stylesPath = path.join(outputDir, `step${stepCounter}_styles.json`);
    await fs.writeFile(stylesPath, JSON.stringify(styles, null, 2));
    console.log(`スタイル情報保存: ${stylesPath}`);
    
    // 4. DOM構造のスナップショット
    const domStructure = await page.evaluate(() => {
      function serializeNode(node, maxDepth = 5, depth = 0) {
        if (depth > maxDepth) return { nodeName: node.nodeName, truncated: true };
        
        const serialized = {
          nodeName: node.nodeName,
          nodeType: node.nodeType
        };
        
        if (node.nodeType === 1) { // Element node
          serialized.attributes = {};
          for (const attr of node.attributes) {
            serialized.attributes[attr.name] = attr.value;
          }
          
          serialized.children = [];
          for (const child of node.childNodes) {
            if (child.nodeType === 1 || child.nodeType === 3) { // Element or Text node
              serialized.children.push(serializeNode(child, maxDepth, depth + 1));
            }
          }
        } else if (node.nodeType === 3) { // Text node
          serialized.textContent = node.textContent.trim();
        }
        
        return serialized;
      }
      
      return serializeNode(document.documentElement);
    });
    
    const domPath = path.join(outputDir, `step${stepCounter}_dom.json`);
    await fs.writeFile(domPath, JSON.stringify(domStructure, null, 2));
    console.log(`DOM構造保存: ${domPath}`);
    
    // 5. アクセシビリティデータ
    const accessibilityData = await page.accessibility.snapshot();
    const accessibilityPath = path.join(outputDir, `step${stepCounter}_accessibility.json`);
    await fs.writeFile(accessibilityPath, JSON.stringify(accessibilityData, null, 2));
    console.log(`アクセシビリティ情報保存: ${accessibilityPath}`);
    
    // 6. 現在のURL
    const urlInfo = {
      url: await page.url(),
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
    
    console.log('UI分析ツール（手動操作版）を開始します');
    
    // ワークフロー名の入力
    const workflowName = await getUserInput('分析するワークフローの名前を入力してください: ');
    
    let finalWorkflowName = workflowName;
    if (!workflowName || workflowName.trim() === '') {
      finalWorkflowName = 'manual_workflow_' + new Date().toISOString().replace(/[:.]/g, '-');
      console.log(`ワークフロー名が指定されなかったため、自動生成しました: ${finalWorkflowName}`);
    }
    
    // ワークフロー実行
    await captureWorkflow(baseUrl, finalWorkflowName);
    
    // 収集したデータの分析
    const captureDir = path.join(__dirname, 'captures', finalWorkflowName);
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
