// analyze.js
// Web UI分析スクリプト - 収集したデータの詳細分析

const fs = require('fs').promises;
const path = require('path');

// 引数の処理
const args = process.argv.slice(2);
let targetDir = null;

if (args.length > 0) {
  targetDir = args[0];
}

/**
 * 収集ディレクトリ内のすべてのキャプチャーディレクトリを取得
 */
async function findCaptureDirectories(baseDir) {
  try {
    const rootDir = path.resolve(__dirname, '..', '..');
    const capturesDir = path.join(rootDir, baseDir);
    const entries = await fs.readdir(capturesDir, { withFileTypes: true });
    
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => path.join(capturesDir, entry.name));
  } catch (error) {
    console.error(`${baseDir}ディレクトリの読み取りエラー:`, error.message);
    return [];
  }
}

/**
 * コンポーネント使用状況の分析
 */
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

/**
 * スタイル一貫性の分析
 */
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
  
  const sortedColors = Object.entries(colorUsage)
    .sort((a, b) => b[1] - a[1]);
  
  for (const [color, count] of sortedColors) {
    if (count >= 3) {
      report += `- ${color}: ${count}回\n`;
    }
  }
  
  report += '\n## フォントサイズの使用状況\n\n';
  
  const sortedFontSizes = Object.entries(fontSizeUsage)
    .sort((a, b) => b[1] - a[1]);
  
  for (const [fontSize, count] of sortedFontSizes) {
    report += `- ${fontSize}: ${count}回\n`;
  }
  
  report += '\n## フォントファミリーの使用状況\n\n';
  
  const sortedFontFamilies = Object.entries(fontFamilyUsage)
    .sort((a, b) => b[1] - a[1]);
  
  for (const [fontFamily, count] of sortedFontFamilies) {
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

/**
 * アクセシビリティ分析
 */
async function analyzeAccessibility(captureDir) {
  const files = await fs.readdir(captureDir);
  const accessibilityFiles = files.filter(file => file.endsWith('_accessibility.json'));
  
  let issues = [];
  
  for (const file of accessibilityFiles) {
    const accessibilityData = JSON.parse(
      await fs.readFile(path.join(captureDir, file), 'utf8')
    );
    
    // input要素にラベルがない問題を検出
    function findAccessibilityIssues(node) {
      if (!node) return;
      
      // ラベルのない入力フィールド
      if (node.role === 'textbox' && (!node.name || node.name === '')) {
        issues.push({
          file,
          issue: 'ラベルのない入力フィールド',
          severity: 'critical',
          element: node
        });
      }
      
      // 代替テキストのない画像
      if (node.role === 'img' && (!node.name || node.name === '')) {
        issues.push({
          file,
          issue: '代替テキストのない画像',
          severity: 'high',
          element: node
        });
      }
      
      // ボタンにテキストまたは代替テキストがない
      if (node.role === 'button' && (!node.name || node.name === '')) {
        issues.push({
          file,
          issue: 'テキストまたはARIAラベルのないボタン',
          severity: 'high',
          element: node
        });
      }
      
      // 見出しレベルのスキップ
      if (node.role && node.role.match(/heading/)) {
        const level = parseInt(node.role.replace('heading', ''));
        if (level > 1) {
          const previousLevel = level - 1;
          // 実際の実装では、前の見出しレベルを追跡する必要があります
          // これは簡易的な実装です
        }
      }
      
      if (node.children) {
        for (const child of node.children) {
          findAccessibilityIssues(child);
        }
      }
    }
    
    findAccessibilityIssues(accessibilityData);
  }
  
  // レポート生成
  let report = '# アクセシビリティ分析レポート\n\n';
  
  if (issues.length === 0) {
    report += '検出された問題はありません。\n';
  } else {
    report += `検出された問題: ${issues.length}件\n\n`;
    
    // 問題の重大度によるグループ化
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    const highIssues = issues.filter(issue => issue.severity === 'high');
    const mediumIssues = issues.filter(issue => issue.severity === 'medium');
    
    report += `- Critical: ${criticalIssues.length}件\n`;
    report += `- High: ${highIssues.length}件\n`;
    report += `- Medium: ${mediumIssues.length || 0}件\n\n`;
    
    report += '## 重大な問題\n\n';
    
    for (const issue of criticalIssues) {
      report += `### ${issue.file} の問題\n\n`;
      report += `- タイプ: ${issue.issue}\n`;
      report += `- 重大度: ${issue.severity}\n`;
      report += `- 要素: ${JSON.stringify(issue.element, null, 2)}\n\n`;
    }
    
    if (highIssues.length > 0) {
      report += '## 高優先度の問題\n\n';
      
      for (const issue of highIssues) {
        report += `### ${issue.file} の問題\n\n`;
        report += `- タイプ: ${issue.issue}\n`;
        report += `- 重大度: ${issue.severity}\n`;
        report += `- 要素: ${JSON.stringify(issue.element, null, 2)}\n\n`;
      }
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

/**
 * パフォーマンス分析
 */
async function analyzePerformance(captureDir) {
  const files = await fs.readdir(captureDir);
  const performanceFiles = files.filter(file => file.endsWith('_performance.json'));
  
  if (performanceFiles.length === 0) {
    console.log('パフォーマンスデータが見つかりません');
    return null;
  }
  
  const performanceStats = {
    navigationTiming: {},
    resourceTiming: {}
  };
  
  for (const file of performanceFiles) {
    const perfData = JSON.parse(
      await fs.readFile(path.join(captureDir, file), 'utf8')
    );
    
    if (perfData && perfData.navigation) {
      const nav = perfData.navigation;
      const stepName = file.replace('_performance.json', '');
      
      performanceStats.navigationTiming[stepName] = {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
        domComplete: nav.domComplete - nav.responseEnd,
        loadEvent: nav.loadEventEnd - nav.loadEventStart,
        totalTime: nav.loadEventEnd - nav.startTime
      };
    }
    
    if (perfData && perfData.resources) {
      const resources = perfData.resources;
      const stepName = file.replace('_performance.json', '');
      
      // リソースタイプごとの統計
      const resourceStats = {
        totalResources: resources.length,
        totalSize: resources.reduce((sum, res) => sum + (res.transferSize || 0), 0),
        byType: {}
      };
      
      for (const res of resources) {
        const type = res.initiatorType || 'unknown';
        if (!resourceStats.byType[type]) {
          resourceStats.byType[type] = {
            count: 0,
            totalSize: 0
          };
        }
        
        resourceStats.byType[type].count++;
        resourceStats.byType[type].totalSize += res.transferSize || 0;
      }
      
      performanceStats.resourceTiming[stepName] = resourceStats;
    }
  }
  
  // JSON形式で保存
  await fs.writeFile(
    path.join(captureDir, 'performance_analysis.json'),
    JSON.stringify(performanceStats, null, 2)
  );
  
  // Markdownレポート生成
  let report = '# パフォーマンス分析レポート\n\n';
  
  report += '## ナビゲーションタイミング\n\n';
  report += '| ステップ | DOM ContentLoaded (ms) | DOM Complete (ms) | Load Event (ms) | Total Time (ms) |\n';
  report += '|---------|----------------------|-----------------|---------------|---------------|\n';
  
  for (const [step, timing] of Object.entries(performanceStats.navigationTiming)) {
    report += `| ${step} | ${timing.domContentLoaded} | ${timing.domComplete} | ${timing.loadEvent} | ${timing.totalTime} |\n`;
  }
  
  report += '\n## リソース統計\n\n';
  
  for (const [step, stats] of Object.entries(performanceStats.resourceTiming)) {
    report += `### ${step}\n\n`;
    report += `- 総リソース数: ${stats.totalResources}\n`;
    report += `- 総サイズ: ${(stats.totalSize / 1024).toFixed(2)} KB\n\n`;
    
    report += '#### リソースタイプ別\n\n';
    report += '| タイプ | 数 | サイズ (KB) |\n';
    report += '|-------|---|------------|\n';
    
    for (const [type, typeStats] of Object.entries(stats.byType)) {
      report += `| ${type} | ${typeStats.count} | ${(typeStats.totalSize / 1024).toFixed(2)} |\n`;
    }
    
    report += '\n';
  }
  
  await fs.writeFile(
    path.join(captureDir, 'performance_report.md'),
    report
  );
  
  console.log('パフォーマンス分析完了');
  
  return performanceStats;
}

/**
 * 総合レポート作成
 */
async function generateSummaryReport(captureDir, results) {
  // 総合レポート
  let report = `# Web UI分析 総合レポート

## 分析概要
- 分析日時: ${new Date().toLocaleString('ja-JP')}
- 分析ディレクトリ: ${captureDir}

`;

  if (results.componentStats) {
    // UI要素分析の要約
    const totalComponents = Object.values(results.componentStats).reduce((sum, stats) => 
      sum + Object.values(stats).reduce((a, b) => a + b, 0), 0);
    
    report += `## UI要素の使用状況
- 分析された要素の総数: ${totalComponents}
`;
    
    // 最も使用されている要素の特定
    let allComponentCounts = {};
    for (const stats of Object.values(results.componentStats)) {
      for (const [component, count] of Object.entries(stats)) {
        allComponentCounts[component] = (allComponentCounts[component] || 0) + count;
      }
    }
    
    const sortedComponents = Object.entries(allComponentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    report += '\n最も使用されている要素:\n';
    for (const [component, count] of sortedComponents) {
      report += `- ${component}: ${count}回\n`;
    }
  }
  
  if (results.styleConsistency) {
    // スタイル一貫性の要約
    report += `\n## スタイルの一貫性
- 使用されている色の種類: ${Object.keys(results.styleConsistency.colorUsage).length}
- 使用されているフォントサイズの種類: ${Object.keys(results.styleConsistency.fontSizeUsage).length}
- 使用されているフォントファミリーの種類: ${Object.keys(results.styleConsistency.fontFamilyUsage).length}

`;
    
    // 最も使用されている色の特定
    const sortedColors = Object.entries(results.styleConsistency.colorUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    report += '最も使用されている色:\n';
    for (const [color, count] of sortedColors) {
      report += `- ${color}: ${count}回\n`;
    }
  }
  
  if (results.accessibilityIssues) {
    // アクセシビリティの要約
    report += `\n## アクセシビリティ
- 検出された問題数: ${results.accessibilityIssues.issueCount}
`;
    
    // 問題の種類によるグループ化
    const issueTypes = {};
    for (const issue of results.accessibilityIssues.issues) {
      issueTypes[issue.issue] = (issueTypes[issue.issue] || 0) + 1;
    }
    
    if (Object.keys(issueTypes).length > 0) {
      report += '\n問題の種類:\n';
      for (const [type, count] of Object.entries(issueTypes)) {
        report += `- ${type}: ${count}件\n`;
      }
    }
  }
  
  if (results.performanceStats) {
    // パフォーマンスの要約
    const navTimings = Object.values(results.performanceStats.navigationTiming);
    
    if (navTimings.length > 0) {
      const avgLoadTime = navTimings.reduce((sum, timing) => sum + timing.totalTime, 0) / navTimings.length;
      
      report += `\n## パフォーマンス
- 平均ロード時間: ${avgLoadTime.toFixed(2)}ms
`;
      
      // リソースタイプの集計
      const resourceTypes = {};
      for (const stepStats of Object.values(results.performanceStats.resourceTiming)) {
        for (const [type, stats] of Object.entries(stepStats.byType)) {
          if (!resourceTypes[type]) {
            resourceTypes[type] = { count: 0, size: 0 };
          }
          resourceTypes[type].count += stats.count;
          resourceTypes[type].size += stats.totalSize;
        }
      }
      
      if (Object.keys(resourceTypes).length > 0) {
        report += '\nリソースタイプの集計:\n';
        for (const [type, stats] of Object.entries(resourceTypes)) {
          report += `- ${type}: ${stats.count}件、合計${(stats.size / 1024).toFixed(2)}KB\n`;
        }
      }
    }
  }
  
  report += `
## 詳細レポート
詳細については各分析レポートを参照してください:
- \`component_usage.json\` / \`component_usage.csv\`: UI要素の使用頻度
- \`consistency_report.md\`: スタイルの一貫性分析
- \`accessibility_report.md\`: アクセシビリティの問題
`;

  if (results.performanceStats) {
    report += `- \`performance_report.md\`: パフォーマンス分析\n`;
  }

  const playwrightTraceFile = path.join(captureDir, 'trace.zip');
  try {
    await fs.access(playwrightTraceFile);
    report += `
## Playwrightトレースの活用方法

収集されたトレースファイル(\`trace.zip\`)を使用して、よりインタラクティブな分析が可能です:

\`\`\`bash
npx playwright show-trace ${playwrightTraceFile}
\`\`\`

このコマンドでトレースビューアが開き、次の情報を確認できます:
- ワークフロー全体の時系列ビュー
- 各アクションと対応するスクリーンショット
- ネットワークリクエスト
- コンソールログ
`;
  } catch (e) {
    // トレースファイルがない場合は何もしない
  }
  
  await fs.writeFile(
    path.join(captureDir, 'summary_report.md'),
    report
  );
  
  console.log('総合レポート生成完了');
  return report;
}

/**
 * 分析プロセスの実行
 */
async function runAnalysis(captureDir) {
  console.log(`\n==== ${captureDir} の詳細分析を開始 ====`);
  
  // 1. コンポーネント使用状況
  const componentStats = await analyzeComponentUsage(captureDir);
  
  // 2. スタイル一貫性
  const styleConsistency = await analyzeStyleConsistency(captureDir);
  
  // 3. アクセシビリティ
  const accessibilityIssues = await analyzeAccessibility(captureDir);
  
  // 4. パフォーマンス分析
  const performanceStats = await analyzePerformance(captureDir);
  
  // 5. 総合レポート生成
  await generateSummaryReport(captureDir, {
    componentStats,
    styleConsistency,
    accessibilityIssues,
    performanceStats
  });
  
  console.log(`分析完了: 結果は ${captureDir} に保存されました`);
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log('Web UI分析ツール - 収集データ分析');
    
    let dirsToParse = [];
    
    if (targetDir) {
      // 指定したディレクトリを分析
      const rootDir = path.resolve(__dirname, '..', '..');
      const fullPath = path.join(rootDir, targetDir);
      dirsToParse.push(fullPath);
    } else {
      // PlaywrightとPuppeteerの両方のキャプチャーディレクトリを検索
      const playwrightCaptures = await findCaptureDirectories('captures_pw');
      const puppeteerCaptures = await findCaptureDirectories('captures');
      
      dirsToParse = [...playwrightCaptures, ...puppeteerCaptures];
      
      if (dirsToParse.length === 0) {
        console.log('キャプチャーディレクトリが見つかりません。最初にキャプチャーを実行してください。');
        return;
      }
      
      console.log(`${dirsToParse.length}個のキャプチャーディレクトリが見つかりました`);
    }
    
    // 各ディレクトリを分析
    for (const dir of dirsToParse) {
      await runAnalysis(dir);
    }
    
    console.log('すべての分析が完了しました');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// プログラム実行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzeComponentUsage,
  analyzeStyleConsistency,
  analyzeAccessibility,
  analyzePerformance,
  runAnalysis
};