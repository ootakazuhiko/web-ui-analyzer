# Web UI Analyzer - 使用手順書

このドキュメントでは、Web UI Analyzerを使用してWebシステムのUIを手動操作しながら収集・分析する方法について説明します。このツールはWebシステムの画面遷移を追跡し、各画面のUI要素を記録・分析することで、システムの使いやすさやデザインの一貫性を評価するのに役立ちます。

## 1. 前提条件

以下のソフトウェアがインストールされている必要があります：

- Node.js (v14以上)
- npm または yarn

## 2. 環境セットアップ

### 2.1 パッケージのインストール

リポジトリをクローンまたはダウンロードした後、以下のコマンドで必要なパッケージをインストールします：

```bash
# パッケージのインストール
npm install
```

または

```bash
yarn install
```

## 3. 設定ファイルの確認

### 3.1 `config/default.js`の確認

`config/default.js`ファイルを確認して、分析対象のWebシステムのURLを設定します：

```javascript
// config/default.js
module.exports = {
  // WebシステムのベースURL
  baseUrl: 'http://your-web-system.com', // 実際のWebシステムURLに変更
  
  // 出力設定
  output: {
    // 出力ディレクトリ
    baseDir: './captures',
    
    // 収集するデータタイプ
    capture: {
      screenshot: true,
      html: true,
      styles: true,
      dom: true,
      accessibility: true
    },
    
    // 分析オプション
    analysis: {
      componentUsage: true,
      styleConsistency: true,
      accessibility: true,
      generateFlowDiagram: true
    }
  }
};
```

## 4. Web UI Analyzerの実行方法

このツールには2つのバージョンがあります：Puppeteer版とPlaywright版。どちらも同様の機能を提供しますが、Playwright版はより詳細な情報（トレースデータなど）を収集できます。

### 4.1 Puppeteer版の実行

```bash
node src/capture/puppeteer.js
```

### 4.2 Playwright版の実行

```bash
node src/capture/playwright.js
```

### 4.3 サンプルワークフローの実行

分析を始める前に、いくつかのサンプルワークフローを実行して、ツールの使用方法を学ぶことができます：

```bash
# サンプルワークフロー選択メニューを実行
node examples/workflows/index.js
```

以下の3種類のサンプルワークフローから選択できます：

1. **Eコマースサイト購入フロー** - 商品選択から購入までの典型的な流れを分析
2. **レイアウト分析特化ワークフロー** - UIの一貫性やレイアウトパターンを詳細に分析
3. **アクセシビリティ監査ワークフロー** - アクセシビリティ問題の検出に重点を置いた分析

各サンプルは手動操作が必要ですが、分析の目的に応じた最適な設定と、結果の見方に関するガイダンスを提供します。

特定のサンプルを直接実行することもできます：

```bash
# Eコマースフローを直接実行
node examples/workflows/ecommerce-flow.js

# レイアウト分析を直接実行
node examples/workflows/layout-analysis-flow.js

# アクセシビリティ監査を直接実行
node examples/workflows/accessibility-audit-flow.js
```

## 5. 手動操作による分析方法

最新バージョンでは、完全手動操作に対応しており、以下の流れで分析を行います：

1. **ワークフロー名の入力**：
   - 最初に分析するワークフローの名前を入力します（例：「ユーザー登録」、「商品購入」など）
   - この名前は出力ディレクトリ名としても使用されます

2. **ブラウザ起動と初期アクセス**：
   - 自動的にブラウザが起動し、設定したWebシステムのURLにアクセスします

3. **手動ログイン**：
   - Webシステムのログイン画面が表示されたら、手動でログイン情報を入力します
   - ログイン完了後、コンソールで「Enterキー」を押して次に進みます

4. **各画面での操作**：
   - 各画面で以下の作業を行います：
     - 現在の画面の説明を入力（例：「ダッシュボード画面」、「商品一覧画面」など）
     - Enterキーを押すと自動的に画面情報が収集・保存されます
     - 次の画面に進むか確認され、「y」と入力すると続行、「n」で終了します
   - 次の画面に手動で移動した後、Enterキーを押して次のステップに進みます

5. **分析完了**：
   - すべての画面を収集後、自動的に基本的な分析が実行されます

### 操作例:

```
UI分析ツール（手動操作版）を開始します
分析するワークフローの名前を入力してください: 商品購入

==== UI分析ツール（手動操作版）====
トップページにアクセスしています: http://your-web-system.com

手動ログインを行ってください
メールアドレスとパスワードを入力し、ログインボタンをクリックしてください

ログインが完了したら、Enterキーを押してください... 

==== ステップ 1 ====
現在の画面の説明を入力してください: ホーム画面
画面データの収集を開始: ホーム画面
スクリーンショット保存: C:\path\to\captures\商品購入\step1_screenshot.png
HTML構造保存: C:\path\to\captures\商品購入\step1_page.html
スタイル情報保存: C:\path\to\captures\商品購入\step1_styles.json
DOM構造保存: C:\path\to\captures\商品購入\step1_dom.json
アクセシビリティ情報保存: C:\path\to\captures\商品購入\step1_accessibility.json
URL情報保存: C:\path\to\captures\商品購入\step1_url.json
ステップ 1 のデータ収集完了

次の画面に手動で移動しますか？(y/n): y

次の画面に移動してください。準備ができたらEnterキーを押してください。
移動が完了したら、Enterキーを押してください... 

==== ステップ 2 ====
現在の画面の説明を入力してください: 商品一覧画面
...
```

## 6. 収集されるデータ

### 6.1 ディレクトリ構造

分析結果は以下のディレクトリ構造で保存されます：

```
captures/（Puppeteer版）または captures_pw/（Playwright版）
└── <ワークフロー名>/
    ├── step1_info.json        // ステップ情報（説明など）
    ├── step1_screenshot.png   // 画面スクリーンショット
    ├── step1_page.html        // HTML構造
    ├── step1_styles.json      // CSSスタイル情報
    ├── step1_dom.json         // DOM構造（Puppeteer版）
    ├── step1_layout.json      // レイアウト情報（Playwright版）
    ├── step1_accessibility.json // アクセシビリティ情報
    ├── step1_url.json         // URL情報
    ├── step2_info.json
    ├── ... 
    ├── component_usage.json   // 要素使用分析
    └── component_usage.csv    // 要素使用分析（CSV形式）
```

Playwright版では、さらに詳細なトレース情報も記録されます：

```
captures_pw/
└── <ワークフロー名>/
    ├── ... （上記と同じ）
    └── trace.zip              // 詳細なトレース情報
```

### 6.2 各ファイルの内容

- `step{n}_info.json`: ステップの説明と収集時刻
- `step{n}_screenshot.png`: 画面のスクリーンショット
- `step{n}_page.html`: ページのHTML構造
- `step{n}_styles.json`: 計算済みCSSスタイル情報
- `step{n}_dom.json`/`step{n}_layout.json`: DOM/レイアウト構造
- `step{n}_accessibility.json`: アクセシビリティツリー情報
- `step{n}_url.json`: URL情報とページタイトル
- `component_usage.json`: HTML要素の使用頻度分析
- `trace.zip`: Playwright版のみ。ブラウザセッションの詳細なトレース情報

## 7. 分析機能

### 7.1 基本的なコンポーネント分析

収集した画面データから、以下の基本的な分析が自動的に行われます：

- HTML要素の使用頻度の集計（ボタン、入力フィールド、テーブルなど）
- 各画面でのUI要素の分布状況

### 7.2 追加分析の実装

以下の高度な分析スクリプトを追加実装することができます：

#### スタイル一貫性の分析

```javascript
// analyze-consistency.js
const fs = require('fs').promises;
const path = require('path');

async function analyzeStyleConsistency(captureDir) {
  const files = await fs.readdir(captureDir);
  const styleFiles = files.filter(file => file.endsWith('_styles.json'));
  
  const colorUsage = {};
  const fontSizeUsage = {};
  
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
  
  await fs.writeFile(
    path.join(captureDir, 'consistency_report.md'),
    report
  );
}
```

#### アクセシビリティ分析

```javascript
// analyze-accessibility.js
const fs = require('fs').promises;
const path = require('path');

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
      report += `- 要素: ${JSON.stringify(issue.element)}\n\n`;
    }
  }
  
  await fs.writeFile(
    path.join(captureDir, 'accessibility_report.md'),
    report
  );
}
```

### 7.3 Playwrightのトレース機能の活用

Playwright版で収集されたトレースデータは、Playwrightのトレースビューアで開くことができます。

```bash
# トレースビューアの起動
npx playwright show-trace captures_pw/<ワークフロー名>/trace.zip
```

これにより、ブラウザの動作やネットワークリクエスト、DOM変更などを詳細に分析できます。

## 8. トラブルシューティング

### 8.1 入力処理に関する問題

コンソールでの入力処理に問題がある場合：

- Windows環境では、Git BashではなくコマンドプロンプトやPowerShellでの実行を試してください
- `process.stdin` と `process.stdout` の取り扱いはOS環境によって異なる場合があります

### 8.2 ブラウザの起動に失敗する場合

```bash
# Puppeteerの場合
npm uninstall puppeteer
npm install puppeteer --no-cache

# Playwrightの場合
npx playwright install chromium
```

### 8.3 メモリ不足エラー

大規模なWebシステムを分析する場合、メモリ不足になることがあります：

```bash
# Node.jsのメモリ制限を増やして実行
node --max-old-space-size=4096 erp-ui-capture.js
```

## 9. Puppeteer版とPlaywright版の違い

両方のバージョンは同様の基本機能を提供しますが、いくつかの違いがあります：

### Puppeteer版の特徴

- より軽量で、Chromeブラウザのみに対応
- DOM構造のより詳細なスナップショットを提供
- 多くの環境ですぐに動作する

### Playwright版の特徴

- 複数のブラウザエンジン（Chromium、Firefox、WebKit）に対応
- トレース機能により、セッション全体の詳細な記録が可能
- 自動待機機能がより洗練されている
- 要素レイアウト情報がより詳細

### どちらを選ぶべきか

- 詳細な分析やクロスブラウザテストが必要な場合は **Playwright版**
- シンプルな使用や軽量な実行環境が必要な場合は **Puppeteer版**

多くの場合、Playwright版の方がより多くの情報を収集でき、トレース機能による詳細な分析が可能なため推奨されます。

## 10. カスタマイズと拡張

### 10.1 追加データの収集

`collectScreenData` 関数を拡張して、より多くのデータを収集できます：

```javascript
// 例: パフォーマンスメトリクスの収集を追加
const performanceMetrics = await page.evaluate(() => {
  const perfEntries = performance.getEntriesByType('navigation');
  if (perfEntries.length > 0) {
    return perfEntries[0];
  }
  return null;
});

const metricsPath = path.join(outputDir, `step${stepCounter}_performance.json`);
await fs.writeFile(metricsPath, JSON.stringify(performanceMetrics, null, 2));
```

### 10.2 分析レポートの拡張

より詳細なレポートを生成するスクリプトを追加できます：

```javascript
// 例: 総合レポート生成スクリプト
async function generateCompleteReport(workflowName) {
  const captureDir = path.join(__dirname, 'captures', workflowName);
  // レポート生成ロジック
}
```

### 10.3 サンプルワークフローのカスタマイズ

`examples/workflows` ディレクトリにあるサンプルを参考に、独自のワークフローを作成できます。基本的には以下の手順で実装します：

1. 新しいJavaScriptファイルを作成（例：`my-custom-workflow.js`）
2. `captureWorkflow`関数と`runAnalysis`関数を利用して処理を実装
3. 必要に応じて特定の目的に合わせたブラウザオプションを設定

例：

```javascript
const { captureWorkflow } = require('../../src/capture/playwright');
const { runAnalysis } = require('../../src/analysis/analyze');

async function runMyCustomWorkflow() {
  // カスタムオプションの設定
  const options = {
    headless: false,
    viewportSize: { width: 1600, height: 900 }
  };
  
  // ワークフロー実行
  const result = await captureWorkflow('https://your-target-site.com', 'my_custom_workflow', options);
  
  if (result.success) {
    // 分析実行
    await runAnalysis(result.outputDir);
    console.log('カスタムワークフローの分析が完了しました');
  }
}

// 実行
if (require.main === module) {
  runMyCustomWorkflow().catch(console.error);
}
```

## 11. まとめ

Web UI Analyzerは、Webシステムのユーザーインターフェースを手動で操作しながら各画面の情報を収集・分析することで、以下のことを可能にします：

1. 実際のユーザー操作フローに基づく画面データの収集
2. UI要素の使用状況と一貫性の分析
3. 各画面の視覚的・構造的な情報の保存
4. アクセシビリティの問題の特定

最新バージョンでは完全な手動操作をサポートしているため、複雑なWebシステムの画面遷移も柔軟に記録・分析できます。この情報はUI改善の提案や、新しいシステム設計の参考資料として活用できます。