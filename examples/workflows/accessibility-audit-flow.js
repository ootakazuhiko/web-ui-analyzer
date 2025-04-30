// accessibility-audit-flow.js
// アクセシビリティ監査に特化したワークフローサンプル

const path = require('path');
const { captureWorkflow } = require('../../src/capture/playwright');
const { runAnalysis } = require('../../src/analysis/analyze');

// アクセシビリティ評価用のサンプルサイト（実際のURLに変更してください）
const DEMO_SITE_URL = 'https://dequeuniversity.com/demo/mars/';

/**
 * アクセシビリティ監査に特化したワークフローを実行します
 * このサンプルは、Webサイトのアクセシビリティ問題を効率的に発見するための
 * 手動操作ワークフローの例です
 */
async function runAccessibilityAuditFlow() {
  console.log('=== アクセシビリティ監査ワークフローのサンプル実行 ===');
  console.log(`サイト: ${DEMO_SITE_URL}`);
  
  // ワークフロー名
  const workflowName = 'accessibility_audit_flow_' + 
    new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    // アクセシビリティテスト用のブラウザ設定
    const options = {
      headless: false,
      viewportSize: { width: 1366, height: 768 } // 標準的な画面サイズ
    };
    
    // ワークフロー実行
    const result = await captureWorkflow(DEMO_SITE_URL, workflowName, options);
    
    if (result.success) {
      console.log(`\nアクセシビリティ監査フローの収集が完了しました (${result.stepCount}ステップ)`);
      console.log(`データは ${result.outputDir} に保存されました`);
      
      // 分析実行
      await runAnalysis(result.outputDir);
      
      console.log('\n分析完了');
      console.log('\n===== アクセシビリティ監査のポイント =====');
      console.log('1. accessibility_report.md で検出された問題の一覧を確認');
      console.log('2. 各ステップの _accessibility.json ファイルでアクセシビリティツリーの詳細を確認');
      console.log('3. ラベルのない入力フィールド、代替テキストのない画像などの一般的な問題を特に注意して確認');
      console.log('4. 色のコントラスト比の問題は color_usage.json と実際のスクリーンショットを併用して確認');
      console.log('5. フォーカス順序の問題はトレースビューアを使用して確認');
      console.log(`6. トレースビューアで実際の操作を確認: npx playwright show-trace ${path.join(result.outputDir, 'trace.zip')}`);
    } else {
      console.error('ワークフローの実行中にエラーが発生しました:', result.error);
    }
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// このスクリプトが直接実行された場合は実行する
if (require.main === module) {
  runAccessibilityAuditFlow().catch(console.error);
}

module.exports = { runAccessibilityAuditFlow };